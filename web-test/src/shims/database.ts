type UserSettingsRow = { key: string; value: string };
type CategoryRow = {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: 0 | 1;
  budget_limit: number | null;
};
type BudgetRow = {
  id: string;
  category_id: string;
  limit_amount: number;
  period: string;
  created_at: string;
};
type TransactionRow = {
  id: string;
  amount: number;
  description: string;
  category_id: string;
  date: string;
  type: string;
  receipt_image_path: string | null;
  created_at: string;
  updated_at: string;
};
type ChatRow = {
  id: string;
  role: string;
  content: string;
  created_at: string;
  session_id: string;
};

type DBState = {
  user_settings: UserSettingsRow[];
  categories: CategoryRow[];
  budgets: BudgetRow[];
  transactions: TransactionRow[];
  chat_messages: ChatRow[];
};

export interface SQLiteDatabase {
  runAsync(sql: string, params?: unknown[]): Promise<void>;
  getAllAsync<T>(sql: string, params?: unknown[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, params?: unknown[]): Promise<T | null>;
  execAsync(sql: string): Promise<void>;
  withExclusiveTransactionAsync<T>(task: () => Promise<T>): Promise<T>;
  closeAsync(): Promise<void>;
}

const STORAGE_KEY = "dumy-web-db-v1";

function seedCategories(): CategoryRow[] {
  return [
    {
      id: "cat_food",
      name: "Alimentacion",
      icon: "utensils",
      color: "#F59E0B",
      is_default: 1,
      budget_limit: null,
    },
    {
      id: "cat_transport",
      name: "Transporte",
      icon: "navigation",
      color: "#3B82F6",
      is_default: 1,
      budget_limit: null,
    },
    {
      id: "cat_health",
      name: "Salud",
      icon: "heart",
      color: "#EF4444",
      is_default: 1,
      budget_limit: null,
    },
    {
      id: "cat_education",
      name: "Educacion",
      icon: "book-open",
      color: "#8B5CF6",
      is_default: 1,
      budget_limit: null,
    },
    {
      id: "cat_leisure",
      name: "Ocio",
      icon: "gamepad-2",
      color: "#10B981",
      is_default: 1,
      budget_limit: null,
    },
    {
      id: "cat_home",
      name: "Hogar",
      icon: "home",
      color: "#6366F1",
      is_default: 1,
      budget_limit: null,
    },
    {
      id: "cat_shopping",
      name: "Compras",
      icon: "shopping-bag",
      color: "#EC4899",
      is_default: 1,
      budget_limit: null,
    },
    {
      id: "cat_income",
      name: "Ingresos",
      icon: "trending-up",
      color: "#22C55E",
      is_default: 1,
      budget_limit: null,
    },
    {
      id: "cat_other",
      name: "Otros",
      icon: "more-horizontal",
      color: "#9CA3AF",
      is_default: 1,
      budget_limit: null,
    },
  ];
}

function createInitialState(): DBState {
  return {
    user_settings: [{ key: "schema_version", value: "1" }],
    categories: seedCategories(),
    budgets: [],
    transactions: [],
    chat_messages: [],
  };
}

function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, " ").trim().toUpperCase();
}

class WebSQLiteDatabase implements SQLiteDatabase {
  private state: DBState;

  constructor(state: DBState) {
    this.state = state;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  async runAsync(sql: string, params: unknown[] = []): Promise<void> {
    const q = normalizeSql(sql);

    if (q.startsWith("INSERT OR REPLACE INTO USER_SETTINGS")) {
      const key = String(params[0]);
      const value = String(params[1]);
      const idx = this.state.user_settings.findIndex((r) => r.key === key);
      if (idx >= 0) {
        this.state.user_settings[idx] = { key, value };
      } else {
        this.state.user_settings.push({ key, value });
      }
      this.persist();
      return;
    }

    if (q.startsWith("INSERT INTO CATEGORIES")) {
      this.state.categories.push({
        id: String(params[0]),
        name: String(params[1]),
        icon: String(params[2]),
        color: String(params[3]),
        is_default: Number(params[4]) as 0 | 1,
        budget_limit: (params[5] as number | null) ?? null,
      });
      this.persist();
      return;
    }

    if (q.startsWith("UPDATE CATEGORIES SET")) {
      const id = String(params[params.length - 1]);
      const category = this.state.categories.find((c) => c.id === id);
      if (!category) return;

      let i = 0;
      if (q.includes("NAME = ?")) category.name = String(params[i++]);
      if (q.includes("ICON = ?")) category.icon = String(params[i++]);
      if (q.includes("COLOR = ?")) category.color = String(params[i++]);
      if (q.includes("BUDGET_LIMIT = ?"))
        category.budget_limit = (params[i++] as number | null) ?? null;
      this.persist();
      return;
    }

    if (q === "DELETE FROM CATEGORIES WHERE ID = ?") {
      const id = String(params[0]);
      this.state.categories = this.state.categories.filter((c) => c.id !== id);
      this.persist();
      return;
    }

    if (q.startsWith("INSERT INTO BUDGETS")) {
      this.state.budgets.push({
        id: String(params[0]),
        category_id: String(params[1]),
        limit_amount: Number(params[2]),
        period: String(params[3]),
        created_at: String(params[4]),
      });
      this.persist();
      return;
    }

    if (q.startsWith("UPDATE BUDGETS SET")) {
      const id = String(params[params.length - 1]);
      const budget = this.state.budgets.find((b) => b.id === id);
      if (!budget) return;

      let i = 0;
      if (q.includes("LIMIT_AMOUNT = ?"))
        budget.limit_amount = Number(params[i++]);
      if (q.includes("PERIOD = ?")) budget.period = String(params[i++]);
      this.persist();
      return;
    }

    if (q === "DELETE FROM BUDGETS WHERE ID = ?") {
      const id = String(params[0]);
      this.state.budgets = this.state.budgets.filter((b) => b.id !== id);
      this.persist();
      return;
    }

    if (q.startsWith("INSERT INTO TRANSACTIONS")) {
      this.state.transactions.push({
        id: String(params[0]),
        amount: Number(params[1]),
        description: String(params[2]),
        category_id: String(params[3]),
        date: String(params[4]),
        type: String(params[5]),
        receipt_image_path: (params[6] as string | null) ?? null,
        created_at: String(params[7]),
        updated_at: String(params[8]),
      });
      this.persist();
      return;
    }

    if (q.startsWith("UPDATE TRANSACTIONS SET")) {
      const id = String(params[params.length - 1]);
      const tx = this.state.transactions.find((t) => t.id === id);
      if (!tx) return;

      let i = 0;
      if (q.includes("AMOUNT = ?")) tx.amount = Number(params[i++]);
      if (q.includes("DESCRIPTION = ?")) tx.description = String(params[i++]);
      if (q.includes("CATEGORY_ID = ?")) tx.category_id = String(params[i++]);
      if (q.includes("DATE = ?")) tx.date = String(params[i++]);
      if (q.includes("TYPE = ?")) tx.type = String(params[i++]);
      if (q.includes("RECEIPT_IMAGE_PATH = ?"))
        tx.receipt_image_path = (params[i++] as string | null) ?? null;
      if (q.includes("UPDATED_AT = ?")) tx.updated_at = String(params[i++]);
      this.persist();
      return;
    }

    if (q === "DELETE FROM TRANSACTIONS WHERE ID = ?") {
      const id = String(params[0]);
      this.state.transactions = this.state.transactions.filter(
        (t) => t.id !== id,
      );
      this.persist();
      return;
    }

    if (q.startsWith("INSERT INTO CHAT_MESSAGES")) {
      this.state.chat_messages.push({
        id: String(params[0]),
        role: String(params[1]),
        content: String(params[2]),
        created_at: String(params[3]),
        session_id: String(params[4]),
      });
      this.persist();
      return;
    }

    if (q === "DELETE FROM CHAT_MESSAGES WHERE SESSION_ID = ?") {
      const sessionId = String(params[0]);
      this.state.chat_messages = this.state.chat_messages.filter(
        (m) => m.session_id !== sessionId,
      );
      this.persist();
      return;
    }

    if (q === "DELETE FROM CHAT_MESSAGES") {
      this.state.chat_messages = [];
      this.persist();
      return;
    }

    console.warn("[Web DB] Unsupported runAsync query:", sql);
  }

  async getAllAsync<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const q = normalizeSql(sql);

    if (q === "SELECT KEY, VALUE FROM USER_SETTINGS") {
      return [...this.state.user_settings] as T[];
    }

    if (q === "SELECT * FROM CATEGORIES ORDER BY NAME") {
      return [...this.state.categories].sort((a, b) =>
        a.name.localeCompare(b.name),
      ) as T[];
    }

    if (q === "SELECT * FROM CATEGORIES WHERE IS_DEFAULT = 1 ORDER BY NAME") {
      return this.state.categories
        .filter((c) => c.is_default === 1)
        .sort((a, b) => a.name.localeCompare(b.name)) as T[];
    }

    if (q === "SELECT * FROM BUDGETS ORDER BY CREATED_AT DESC") {
      return [...this.state.budgets].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      ) as T[];
    }

    if (
      q === "SELECT * FROM TRANSACTIONS ORDER BY DATE DESC, CREATED_AT DESC"
    ) {
      return [...this.state.transactions].sort((a, b) => {
        if (a.date === b.date) return b.created_at.localeCompare(a.created_at);
        return b.date.localeCompare(a.date);
      }) as T[];
    }

    if (
      q ===
      "SELECT * FROM TRANSACTIONS WHERE DATE >= ? AND DATE <= ? ORDER BY DATE DESC"
    ) {
      const from = String(params[0]);
      const to = String(params[1]);
      return this.state.transactions
        .filter((t) => t.date >= from && t.date <= to)
        .sort((a, b) => b.date.localeCompare(a.date)) as T[];
    }

    if (
      q ===
      "SELECT * FROM TRANSACTIONS WHERE CATEGORY_ID = ? ORDER BY DATE DESC"
    ) {
      const categoryId = String(params[0]);
      return this.state.transactions
        .filter((t) => t.category_id === categoryId)
        .sort((a, b) => b.date.localeCompare(a.date)) as T[];
    }

    if (
      q.startsWith(
        "SELECT TYPE, COALESCE(SUM(AMOUNT), 0) AS TOTAL FROM TRANSACTIONS WHERE DATE >= ? AND DATE <= ? GROUP BY TYPE",
      )
    ) {
      const from = String(params[0]);
      const to = String(params[1]);
      const grouped = new Map<string, number>();
      for (const t of this.state.transactions) {
        if (t.date >= from && t.date <= to) {
          grouped.set(t.type, (grouped.get(t.type) || 0) + t.amount);
        }
      }
      return Array.from(grouped.entries()).map(([type, total]) => ({
        type,
        total,
      })) as T[];
    }

    if (
      q.startsWith(
        "SELECT CATEGORY_ID AS CATEGORYID, COALESCE(SUM(AMOUNT), 0) AS TOTAL FROM TRANSACTIONS WHERE DATE >= ? AND DATE <= ? AND TYPE = ? GROUP BY CATEGORY_ID ORDER BY TOTAL DESC",
      )
    ) {
      const from = String(params[0]);
      const to = String(params[1]);
      const type = String(params[2]);
      const grouped = new Map<string, number>();
      for (const t of this.state.transactions) {
        if (t.date >= from && t.date <= to && t.type === type) {
          grouped.set(
            t.category_id,
            (grouped.get(t.category_id) || 0) + t.amount,
          );
        }
      }
      return Array.from(grouped.entries())
        .map(([categoryId, total]) => ({ categoryId, total }))
        .sort((a, b) => b.total - a.total) as T[];
    }

    if (
      q.startsWith(
        "SELECT * FROM CHAT_MESSAGES WHERE SESSION_ID = ? ORDER BY CREATED_AT ASC",
      )
    ) {
      const sessionId = String(params[0]);
      return this.state.chat_messages
        .filter((m) => m.session_id === sessionId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)) as T[];
    }

    if (
      q.startsWith(
        "SELECT * FROM CHAT_MESSAGES ORDER BY CREATED_AT DESC LIMIT ?",
      )
    ) {
      const limit = Number(params[0] ?? 10);
      return [...this.state.chat_messages]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, limit) as T[];
    }

    if (
      q.startsWith(
        "SELECT DISTINCT SESSION_ID FROM CHAT_MESSAGES ORDER BY MAX(CREATED_AT) DESC",
      )
    ) {
      const latestBySession = new Map<string, string>();
      for (const row of this.state.chat_messages) {
        const current = latestBySession.get(row.session_id);
        if (!current || row.created_at > current) {
          latestBySession.set(row.session_id, row.created_at);
        }
      }
      return Array.from(latestBySession.entries())
        .sort((a, b) => b[1].localeCompare(a[1]))
        .map(([session_id]) => ({ session_id })) as T[];
    }

    console.warn("[Web DB] Unsupported getAllAsync query:", sql);
    return [];
  }

  async getFirstAsync<T>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T | null> {
    const q = normalizeSql(sql);

    if (q === "SELECT VALUE FROM USER_SETTINGS WHERE KEY = 'SCHEMA_VERSION'") {
      const row = this.state.user_settings.find(
        (r) => r.key === "schema_version",
      );
      return (row ? { value: row.value } : null) as T | null;
    }

    if (q === "SELECT * FROM TRANSACTIONS WHERE ID = ?") {
      const id = String(params[0]);
      return (this.state.transactions.find((t) => t.id === id) ||
        null) as T | null;
    }

    if (
      q ===
      "SELECT COUNT(*) AS COUNT FROM TRANSACTIONS WHERE DATE >= ? AND DATE <= ?"
    ) {
      const from = String(params[0]);
      const to = String(params[1]);
      const count = this.state.transactions.filter(
        (t) => t.date >= from && t.date <= to,
      ).length;
      return { count } as T;
    }

    if (q === "SELECT * FROM CATEGORIES WHERE ID = ?") {
      const id = String(params[0]);
      return (this.state.categories.find((c) => c.id === id) ||
        null) as T | null;
    }

    if (
      q ===
      "SELECT * FROM BUDGETS WHERE CATEGORY_ID = ? ORDER BY CREATED_AT DESC LIMIT 1"
    ) {
      const categoryId = String(params[0]);
      const latest = this.state.budgets
        .filter((b) => b.category_id === categoryId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      return (latest || null) as T | null;
    }

    if (q === "SELECT * FROM BUDGETS WHERE ID = ?") {
      const id = String(params[0]);
      return (this.state.budgets.find((b) => b.id === id) || null) as T | null;
    }

    if (
      q === "SELECT COUNT(*) AS COUNT FROM CHAT_MESSAGES WHERE SESSION_ID = ?"
    ) {
      const sessionId = String(params[0]);
      const count = this.state.chat_messages.filter(
        (m) => m.session_id === sessionId,
      ).length;
      return { count } as T;
    }

    console.warn("[Web DB] Unsupported getFirstAsync query:", sql);
    return null;
  }

  async execAsync(_sql: string): Promise<void> {
    // No-op: schema is represented as typed in-memory collections for web testing.
  }

  async withExclusiveTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
    return task();
  }

  async closeAsync(): Promise<void> {
    this.persist();
  }
}

let _db: SQLiteDatabase | null = null;

function loadState(): DBState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DBState>;
    return {
      user_settings: parsed.user_settings ?? [
        { key: "schema_version", value: "1" },
      ],
      categories: parsed.categories ?? seedCategories(),
      budgets: parsed.budgets ?? [],
      transactions: parsed.transactions ?? [],
      chat_messages: parsed.chat_messages ?? [],
    };
  } catch {
    return createInitialState();
  }
}

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (_db) return _db;
  _db = new WebSQLiteDatabase(loadState());
  return _db;
}

export async function closeDatabase(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}

export function isDatabaseReady(): boolean {
  return _db !== null;
}
