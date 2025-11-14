import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Ensure database folder exists
const dbPath = path.join('./database', 'db.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    ingame_name TEXT NOT NULL
  )
`).run();

export default db;
