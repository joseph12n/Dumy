import type { SQLiteDatabase } from "expo-sqlite";

type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

/**
 * All migrations in order.
 * Each migration's version must be unique and incrementally greater than the previous.
 */
const MIGRATIONS: Migration[] = [{ version: 1, up: createInitialSchema }];

/**
 * Run all pending migrations.
 * Reads current schema_version from user_settings table.
 * Executes each migration where version > currentVersion in an exclusive transaction.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  try {
    // Create user_settings table first (bootstrap, always needed)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // Read current schema version
    const result = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM user_settings WHERE key = 'schema_version'`,
    );
    const currentVersion = result ? parseInt(result.value, 10) : 0;

    console.log(`[Migrations] Current schema version: ${currentVersion}`);

    // Run pending migrations
    for (const migration of MIGRATIONS) {
      if (migration.version > currentVersion) {
        console.log(`[Migrations] Running migration v${migration.version}...`);

        await db.withExclusiveTransactionAsync(async () => {
          await migration.up(db);

          // Update schema version
          await db.runAsync(
            `INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)`,
            ["schema_version", String(migration.version)],
          );
        });

        console.log(`[Migrations] Migration v${migration.version} completed`);
      }
    }
  } catch (error) {
    console.error("[Migrations] Error running migrations:", error);
    throw error;
  }
}

/**
 * Migration v1: Initial schema with all core tables
 */
async function createInitialSchema(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    -- Categories for transaction classification
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'circle',
      color TEXT NOT NULL DEFAULT '#6B7280',
      is_default INTEGER NOT NULL DEFAULT 0,
      budget_limit REAL
    );

    -- Main transactions table
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount INTEGER NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category_id TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      receipt_image_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    -- Budget limits per category and period
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      limit_amount INTEGER NOT NULL,
      period TEXT NOT NULL CHECK(period IN ('monthly', 'weekly')),
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    -- Chat message history
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      session_id TEXT NOT NULL
    );

    -- Indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);

    -- Seed default categories (Colombian context, Spanish names)
    INSERT OR IGNORE INTO categories (id, name, icon, color, is_default) VALUES
      ('cat_food', 'Alimentación', 'utensils', '#F59E0B', 1),
      ('cat_transport', 'Transporte', 'navigation', '#3B82F6', 1),
      ('cat_health', 'Salud', 'heart', '#EF4444', 1),
      ('cat_education', 'Educación', 'book-open', '#8B5CF6', 1),
      ('cat_leisure', 'Ocio', 'gamepad-2', '#10B981', 1),
      ('cat_home', 'Hogar', 'home', '#6366F1', 1),
      ('cat_shopping', 'Compras', 'shopping-bag', '#EC4899', 1),
      ('cat_income', 'Ingresos', 'trending-up', '#22C55E', 1),
      ('cat_other', 'Otros', 'more-horizontal', '#9CA3AF', 1);
  `);
}
