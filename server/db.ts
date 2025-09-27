import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

const databasePath = process.env.DATABASE_URL || './campusvault.db';

// Ensure the data directory exists if using a custom path
if (process.env.DATABASE_URL && process.env.DATABASE_URL !== './campusvault.db') {
  const fs = require('fs');
  const path = require('path');
  const dir = path.dirname(process.env.DATABASE_URL);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Create SQLite database connection
const sqlite = new Database(databasePath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle({ client: sqlite, schema });