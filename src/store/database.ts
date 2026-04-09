import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { runMigrations } from './migrations';

let _db: SQLiteDatabase | null = null;

/**
 * Get or initialize the SQLite database singleton.
 * On first call, opens 'dumy.db' and runs migrations.
 * On subsequent calls, returns the cached instance.
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  if (_db !== null) {
    return _db;
  }

  try {
    _db = await openDatabaseAsync('dumy.db');
    console.log('[DB] Database opened');

    // Run migrations on first open
    await runMigrations(_db);
    console.log('[DB] Migrations completed');

    return _db;
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error);
    _db = null;
    throw error;
  }
}

/**
 * Close the database connection and reset the singleton.
 * Call this during app cleanup (e.g., logout, app termination).
 */
export async function closeDatabase(): Promise<void> {
  if (_db !== null) {
    try {
      await _db.closeAsync();
      console.log('[DB] Database closed');
    } catch (error) {
      console.error('[DB] Error closing database:', error);
    } finally {
      _db = null;
    }
  }
}

/**
 * Check if database is currently open
 */
export function isDatabaseReady(): boolean {
  return _db !== null;
}
