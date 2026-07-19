const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const db = require('./db');

try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (err) {
  console.warn('Firebase Admin initialization skipped: serviceAccountKey.json not found.');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ── Auth Middleware ──────────────────────────────────────────────
const requireAuth = async (req, res, next) => {
  const sessionCookie = req.cookies.session || '';
  if (!sessionCookie) return res.status(401).json({ error: 'Non autorisé' });
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    req.user = decodedClaims;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Session invalide' });
  }
};

// ── Auth Routes ──────────────────────────────────────────────────

app.post('/api/auth/session', async (req, res) => {
  const { idToken } = req.body;
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    
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

    // Create session cookie
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    res.cookie('session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    res.json({ status: 'success' });
  } catch (error) {
    res.status(401).json({ error: 'Requête non autorisée' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ status: 'success' });
});

app.get('/api/auth/me', async (req, res) => {
  const sessionCookie = req.cookies.session || '';
  if (!sessionCookie) return res.status(401).json({ user: null });
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    const userRes = await db.query('SELECT * FROM users WHERE uid = $1', [decodedClaims.uid]);
    res.json({ user: userRes.rows[0] });
  } catch (error) {
    res.status(401).json({ user: null });
  }
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
    const { region, product } = req.query;
    let query = 'SELECT * FROM b2b_listings WHERE 1=1';
    const params = [];

    if (region) {
      params.push(`%${region}%`);
      query += ` AND region LIKE $${params.length}`;
    }
    if (product) {
      params.push(`%${product}%`);
      query += ` AND product LIKE $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    const listings = await db.query(query, params);

    const formatted = listings.rows.map(l => ({
      id: l.id,
      farmer: l.farmer,
      region: l.region,
      product: l.product,
      variety: l.variety,
      quantity: l.quantity,
      unit: l.unit,
      pricePerKg: l.price_per_kg,
      dateLabel: l.date_label,
      transportIncluded: Boolean(l.transport_included),
      verified: Boolean(l.verified),
      createdAt: l.created_at,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new B2B listing (Protected)
app.post('/api/b2b', requireAuth, async (req, res) => {
  const { farmer, region, product, variety, quantity, unit, pricePerKg, transportIncluded } = req.body;
  const userId = req.user ? req.user.uid : null;
  try {
    const userRes = await db.query('SELECT id FROM users WHERE uid = $1', [userId]);
    const internalUserId = userRes.rows.length > 0 ? userRes.rows[0].id : null;

    const result = await db.query(
      'INSERT INTO b2b_listings (farmer, region, product, variety, quantity, unit, price_per_kg, transport_included, verified, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [farmer, region, product, variety, quantity, unit, pricePerKg, transportIncluded ? 1 : 0, false, internalUserId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create listing' });
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
