// backend/db.js
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite");

// Create table for memberships
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS memberships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      plan_type TEXT NOT NULL,         -- "biweekly" or "yearly"
      personal_trainer INTEGER NOT NULL, -- 0 or 1
      price REAL NOT NULL,
      card_last4 TEXT,
      created_at TEXT NOT NULL
    )
  `);
});

module.exports = db;
