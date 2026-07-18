const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'wassit.db'));

// ── Create Tables ──────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unit TEXT DEFAULT 'kg',
    wholesale_price REAL NOT NULL,
    recommended_min REAL NOT NULL,
    recommended_max REAL NOT NULL,
    current_market_avg REAL NOT NULL,
    trend TEXT CHECK(trend IN ('up', 'down', 'stable')) DEFAULT 'stable',
    alert INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS b2b_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer TEXT NOT NULL,
    region TEXT NOT NULL,
    product TEXT NOT NULL,
    variety TEXT,
    quantity REAL NOT NULL,
    unit TEXT DEFAULT 'Tonnes',
    price_per_kg REAL NOT NULL,
    date_label TEXT,
    transport_included INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS trusted_shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    zone TEXT NOT NULL,
    distance TEXT,
    respect_index INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('open', 'closed')) DEFAULT 'open',
    latitude REAL,
    longitude REAL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_name TEXT,
    product TEXT,
    reported_price REAL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// ── Seed Data ──────────────────────────────────────────────────

function seedDatabase() {
  const priceCount = db.prepare('SELECT COUNT(*) as count FROM prices').get();

  if (priceCount.count === 0) {
    const insertPrice = db.prepare(`
      INSERT INTO prices (name, unit, wholesale_price, recommended_min, recommended_max, current_market_avg, trend, alert)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const prices = [
      ['Tomates Rondes', 'kg', 2.5, 3.5, 4.5, 4.2, 'down', 0],
      ['Oignons Blancs', 'kg', 3.0, 4.0, 5.0, 5.5, 'up', 1],
      ['Pommes de terre', 'kg', 2.8, 3.8, 4.5, 4.0, 'stable', 0],
      ['Carottes', 'kg', 1.5, 2.5, 3.5, 3.0, 'stable', 0],
      ['Courgettes', 'kg', 2.0, 3.0, 4.0, 3.8, 'up', 0],
      ['Poivrons Verts', 'kg', 3.5, 5.0, 6.5, 6.0, 'down', 0],
      ['Concombres', 'kg', 1.2, 2.0, 3.0, 2.5, 'stable', 0],
      ['Aubergines', 'kg', 2.2, 3.2, 4.2, 3.9, 'up', 0],
    ];

    for (const item of prices) {
      insertPrice.run(...item);
    }
  }

  const b2bCount = db.prepare('SELECT COUNT(*) as count FROM b2b_listings').get();

  if (b2bCount.count === 0) {
    const insertB2B = db.prepare(`
      INSERT INTO b2b_listings (farmer, region, product, variety, quantity, unit, price_per_kg, date_label, transport_included, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const listings = [
      ['Coop. Agricole Souss', 'Agadir', 'Tomates Industrie', 'Roma', 15, 'Tonnes', 1.8, "Aujourd'hui", 1, 1],
      ['Domaine El Haouz', 'Marrakech', 'Oignons', 'Rouge', 5, 'Tonnes', 2.7, 'Demain', 0, 1],
      ['Ferme Doukkala', 'El Jadida', 'Pommes de terre', 'Spunta', 20, 'Tonnes', 2.5, "Aujourd'hui", 1, 0],
      ['Agrumes du Gharb', 'Kénitra', 'Carottes', 'Nantaise', 8, 'Tonnes', 1.3, "Aujourd'hui", 1, 1],
      ['Coop. Tadla', 'Béni Mellal', 'Courgettes', 'Verte', 10, 'Tonnes', 1.7, 'Demain', 0, 0],
      ['Domaine Saïss', 'Fès', 'Poivrons', 'Lamuyo', 6, 'Tonnes', 3.0, "Aujourd'hui", 1, 1],
    ];

    for (const item of listings) {
      insertB2B.run(...item);
    }
  }

  const shopCount = db.prepare('SELECT COUNT(*) as count FROM trusted_shops').get();

  if (shopCount.count === 0) {
    const insertShop = db.prepare(`
      INSERT INTO trusted_shops (name, type, zone, distance, respect_index, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const shops = [
      ['Khaddar Hassan', 'Légumes & Fruits', 'Souk Tariq', '150m', 98, 'open'],
      ['Hanout Bouchaib', 'Alimentation générale', 'Tacharouk', '300m', 95, 'open'],
      ['Coopérative Al Qods', 'Produits Frais', 'Al Qods', '450m', 100, 'open'],
      ['Brahim Market', 'Épicerie', 'Anaf', '600m', 88, 'open'],
      ['Souk Al Kheir', 'Fruits & Légumes', 'Hay Mohammadi', '800m', 92, 'open'],
      ['Marché Central', 'Grossiste', 'Centre Ville', '1.2km', 96, 'open'],
    ];

    for (const item of shops) {
      insertShop.run(...item);
    }
  }
}

seedDatabase();

module.exports = db;
