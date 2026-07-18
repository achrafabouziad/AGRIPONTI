const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ── Price Indices (B2C) ────────────────────────────────────────

app.get('/api/prices', (req, res) => {
  try {
    const prices = db.prepare('SELECT * FROM prices ORDER BY name').all();
    const formatted = prices.map(p => ({
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

app.get('/api/b2b', (req, res) => {
  try {
    const { region, product } = req.query;
    let query = 'SELECT * FROM b2b_listings WHERE 1=1';
    const params = [];

    if (region) {
      query += ' AND region LIKE ?';
      params.push(`%${region}%`);
    }
    if (product) {
      query += ' AND product LIKE ?';
      params.push(`%${product}%`);
    }

    query += ' ORDER BY created_at DESC';
    const listings = db.prepare(query).all(...params);

    const formatted = listings.map(l => ({
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

app.post('/api/b2b', (req, res) => {
  try {
    const { farmer, region, product, variety, quantity, unit, pricePerKg, dateLabel, transportIncluded } = req.body;

    if (!farmer || !region || !product || !quantity || !pricePerKg) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const result = db.prepare(`
      INSERT INTO b2b_listings (farmer, region, product, variety, quantity, unit, price_per_kg, date_label, transport_included)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(farmer, region, product, variety || null, quantity, unit || 'Tonnes', pricePerKg, dateLabel || "Aujourd'hui", transportIncluded ? 1 : 0);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Offre publiée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Trusted Shops ──────────────────────────────────────────────

app.get('/api/shops', (req, res) => {
  try {
    const shops = db.prepare('SELECT * FROM trusted_shops ORDER BY respect_index DESC').all();
    const formatted = shops.map(s => ({
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

app.post('/api/report', (req, res) => {
  try {
    const { shopName, product, reportedPrice, description } = req.body;

    if (!shopName || !product) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const result = db.prepare(`
      INSERT INTO reports (shop_name, product, reported_price, description)
      VALUES (?, ?, ?, ?)
    `).run(shopName, product, reportedPrice || null, description || null);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Signalement enregistré. Merci !' });
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
  console.log(`\n  🌱 Wassit API running on http://localhost:${PORT}`);
  console.log(`  📊 Prices:  http://localhost:${PORT}/api/prices`);
  console.log(`  🏪 Shops:   http://localhost:${PORT}/api/shops`);
  console.log(`  🚛 B2B:     http://localhost:${PORT}/api/b2b\n`);
});
