import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

// Initialize and return the database
export async function initDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('tasks.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0
      );
    `);
  }
  return db;
}

// Return already opened db (used later)
export function getDB() {
  if (!db) throw new Error("Database not initialized yet!");
  return db;
}
