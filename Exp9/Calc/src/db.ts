import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

// Initialize and return the database
export async function initCalculatorDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('calculator.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expression TEXT NOT NULL,
        result TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
  return db;
}

export function getCalculatorDB() {
  if (!db) throw new Error('Database not initialized yet');
  return db;
}
