const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const db = require('./db');

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let firebaseInitError = null;

try {
  let serviceAccount;
  const envKeys = Object.keys(process.env);
  const base64Key = envKeys.find(k => k.includes('FIREBASE_SERVICE_ACCOUNT') && k.includes('BASE'));
  const rawKey = envKeys.find(k => k.includes('FIREBASE_SERVICE_ACCOUNT') && !k.includes('BASE'));

  if (base64Key && process.env[base64Key]) {
    const decoded = Buffer.from(process.env[base64Key], 'base64').toString('utf-8');
    serviceAccount = JSON.parse(decoded);
  } else if (rawKey && process.env[rawKey]) {
    serviceAccount = typeof process.env[rawKey] === 'string' 
      ? JSON.parse(process.env[rawKey]) 
      : process.env[rawKey];
  } else {
    try {
      serviceAccount = require('./serviceAccountKey.json');
    } catch (err) {
      serviceAccount = require('../serviceAccountKey.json'); // fallback to root
    }
  }
  
  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (err) {
  firebaseInitError = err;
  console.error('Firebase Admin initialization skipped or failed: ', err);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ── Auth Middleware ──────────────────────────────────────────────
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Non autorisé' });
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedClaims = await getAuth().verifyIdToken(idToken);
    req.user = decodedClaims;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Session invalide' });
  }
};

// ── Auth Routes ──────────────────────────────────────────────────

app.post('/api/auth/sync', async (req, res) => {
  if (firebaseInitError) {
    return res.status(500).json({ error: 'Firebase Init Failed', details: firebaseInitError.message || firebaseInitError.toString() });
  }

  const { idToken } = req.body;
  try {
    const decodedIdToken = await getAuth().verifyIdToken(idToken);
    
    // Upsert user in database
    const { uid, email, phone_number, name } = decodedIdToken;
    await db.query(`
      INSERT INTO users (uid, email, phone, name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (uid) DO UPDATE SET 
        email = EXCLUDED.email, 
        phone = EXCLUDED.phone, 
        name = EXCLUDED.name
    `, [uid, email || null, phone_number || null, name || null]);

    res.json({ status: 'success' });
  } catch (error) {
    console.error("Auth Sync Error:", error);
    res.status(401).json({ error: 'Requête non autorisée', details: error.message });
  }
});

app.get('/api/env-debug', (req, res) => {
  res.json({
    keys: Object.keys(process.env).filter(k => k.includes('FIREBASE')),
    hasBase64: !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
    hasRaw: !!process.env.FIREBASE_SERVICE_ACCOUNT
  });
});

// ── Price Indices (B2C) ────────────────────────────────────────

app.get('/api/prices', async (req, res) => {
  try {
    const prices = await db.query('SELECT * FROM prices ORDER BY name');
    const formatted = prices.rows.map(p => ({
      id: p.id,
      name: p.name,
      unit: p.unit,
      wholesalePrice: p.wholesale_price,
      recommendedRetail: { min: p.recommended_min, max: p.recommended_max },
      currentMarketAvg: p.current_market_avg,
      trend: p.trend,
      alert: Boolean(p.alert),
      updatedAt: p.updated_at,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── B2B Listings ───────────────────────────────────────────────

app.get('/api/b2b', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b2b_listings.*, users.name as user_name, users.phone as user_phone 
      FROM b2b_listings 
      LEFT JOIN users ON b2b_listings.user_id = users.id
      ORDER BY b2b_listings.id DESC
    `);
    // Map database snake_case columns to camelCase for the frontend
    const mapped = result.rows.map(row => ({
      id: row.id,
      farmer: row.farmer || row.user_name || 'Agriculteur',
      phone: row.user_phone,
      region: row.region,
      product: row.product,
      variety: row.variety,
      quantity: row.quantity,
      unit: row.unit,
      pricePerKg: row.price_per_kg,
      dateLabel: row.date_label,
      transportIncluded: row.transport_included,
      verified: row.verified,
      imageUrl: row.image_url
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/b2b', requireAuth, async (req, res) => {
  try {
    const { product, variety, region, quantity, unit, pricePerKg, transportIncluded, imageUrl } = req.body;
    
    // Get the user's postgres ID
    const userRes = await db.query('SELECT id, name FROM users WHERE uid = $1', [req.user.uid]);
    if (userRes.rows.length === 0) return res.status(403).json({ error: 'Utilisateur non trouvé' });
    const userId = userRes.rows[0].id;
    const farmerName = userRes.rows[0].name || 'Agriculteur';

    const result = await db.query(`
      INSERT INTO b2b_listings (farmer, region, product, variety, quantity, unit, price_per_kg, date_label, transport_included, verified, user_id, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [farmerName, region, product, variety || null, quantity, unit || 'Tonnes', pricePerKg, "Aujourd'hui", transportIncluded ? 1 : 0, 0, userId, imageUrl || null]);
    
    res.json({ status: 'success', listing: result.rows[0] });
  } catch (error) {
    console.error('B2B POST error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── Trusted Shops ──────────────────────────────────────────────

app.get('/api/shops', async (req, res) => {
  try {
    const shops = await db.query('SELECT * FROM trusted_shops ORDER BY respect_index DESC');
    const formatted = shops.rows.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      zone: s.zone,
      distance: s.distance,
      respectIndex: s.respect_index,
      status: s.status,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Reports ────────────────────────────────────────────────────

// Submit a price report (Protected)
app.post('/api/reports', requireAuth, async (req, res) => {
  const { shop_name, product, reported_price, description } = req.body;
  const userId = req.user ? req.user.uid : null;
  try {
    const userRes = await db.query('SELECT id FROM users WHERE uid = $1', [userId]);
    const internalUserId = userRes.rows.length > 0 ? userRes.rows[0].id : null;

    const result = await db.query(
      'INSERT INTO reports (shop_name, product, reported_price, description, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [shop_name, product, reported_price, description, internalUserId]
    );
    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// ── Health Check ───────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start Server ───────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  🌱 AGRIPONTI API running on http://localhost:${PORT}`);
  console.log(`  📊 Prices:  http://localhost:${PORT}/api/prices`);
  console.log(`  🏪 Shops:   http://localhost:${PORT}/api/shops`);
  console.log(`  🚛 B2B:     http://localhost:${PORT}/api/b2b\n`);
});
