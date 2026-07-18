const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

app.post('/api/b2b', async (req, res) => {
  try {
    const { farmer, region, product, variety, quantity, unit, pricePerKg, dateLabel, transportIncluded } = req.body;

    if (!farmer || !region || !product || !quantity || !pricePerKg) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const result = await db.query(`
      INSERT INTO b2b_listings (farmer, region, product, variety, quantity, unit, price_per_kg, date_label, transport_included)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [farmer, region, product, variety || null, quantity, unit || 'Tonnes', pricePerKg, dateLabel || "Aujourd'hui", transportIncluded ? 1 : 0]);

    res.status(201).json({ id: result.rows[0].id, message: 'Offre publiée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

app.post('/api/report', async (req, res) => {
  try {
    const { shopName, product, reportedPrice, description } = req.body;

    if (!shopName || !product) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const result = await db.query(`
      INSERT INTO reports (shop_name, product, reported_price, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [shopName, product, reportedPrice || null, description || null]);

    res.status(201).json({ id: result.rows[0].id, message: 'Signalement enregistré. Merci !' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
