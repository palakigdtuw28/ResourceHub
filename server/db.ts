import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

const databasePath = process.env.DATABASE_URL || './campusvault.db';

// Create SQLite database connection
const sqlite = new Database(databasePath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle({ client: sqlite, schema });