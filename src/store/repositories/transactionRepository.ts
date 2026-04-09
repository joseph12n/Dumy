import type { SQLiteDatabase } from "expo-sqlite";
import { nowISO } from "../../utils/dates";
import { generateId } from "../../utils/uuid";
import {
    CategorySpend,
    CreateTransactionInput,
    Transaction,
    TransactionType,
    UpdateTransactionInput,
} from "../types";

/**
 * Raw row type from database
 */
export type TransactionRow = {
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

/**
 * Convert database row to typed Transaction
 */
function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount: row.amount,
    description: row.description,
    categoryId: row.category_id,
    date: row.date,
    type: row.type as TransactionType,
    receiptImagePath: row.receipt_image_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const transactionRepository = {
  /**
   * Insert a new transaction
   */
  async insert(
    db: SQLiteDatabase,
    input: CreateTransactionInput,
  ): Promise<Transaction> {
    const id = generateId();
    const now = nowISO();

    await db.runAsync(
      `INSERT INTO transactions (id, amount, description, category_id, date, type, receipt_image_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.amount,
        input.description,
        input.categoryId,
        input.date,
        input.type,
        input.receiptImagePath || null,
        now,
        now,
      ],
    );

    return {
      id,
      amount: input.amount,
      description: input.description,
      categoryId: input.categoryId,
      date: input.date,
      type: input.type,
      receiptImagePath: input.receiptImagePath || null,
      createdAt: now,
      updatedAt: now,
    };
  },

  /**
   * Update an existing transaction
   */
  async update(
    db: SQLiteDatabase,
    input: UpdateTransactionInput,
  ): Promise<Transaction | null> {
    const now = nowISO();
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.amount !== undefined) {
      updates.push("amount = ?");
      values.push(input.amount);
    }
    if (input.description !== undefined) {
      updates.push("description = ?");
      values.push(input.description);
    }
    if (input.categoryId !== undefined) {
      updates.push("category_id = ?");
      values.push(input.categoryId);
    }
    if (input.date !== undefined) {
      updates.push("date = ?");
      values.push(input.date);
    }
    if (input.type !== undefined) {
      updates.push("type = ?");
      values.push(input.type);
    }
    if (input.receiptImagePath !== undefined) {
      updates.push("receipt_image_path = ?");
      values.push(input.receiptImagePath || null);
    }

    if (updates.length === 0) {
      return this.getById(db, input.id);
    }

    updates.push("updated_at = ?");
    values.push(now);
    values.push(input.id);

    await db.runAsync(
      `UPDATE transactions SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return this.getById(db, input.id);
  },

  /**
   * Delete a transaction
   */
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync("DELETE FROM transactions WHERE id = ?", [id]);
  },

  /**
   * Get a single transaction by ID
   */
  async getById(db: SQLiteDatabase, id: string): Promise<Transaction | null> {
    const row = await db.getFirstAsync<TransactionRow>(
      "SELECT * FROM transactions WHERE id = ?",
      [id],
    );
    return row ? rowToTransaction(row) : null;
  },

  /**
   * Get all transactions, ordered by date descending
   */
  async getAll(db: SQLiteDatabase): Promise<Transaction[]> {
    const rows = await db.getAllAsync<TransactionRow>(
      "SELECT * FROM transactions ORDER BY date DESC, created_at DESC",
    );
    return rows.map(rowToTransaction);
  },

  /**
   * Get transactions within a date range (inclusive)
   */
  async getByDateRange(
    db: SQLiteDatabase,
    from: string,
    to: string,
  ): Promise<Transaction[]> {
    const rows = await db.getAllAsync<TransactionRow>(
      "SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC",
      [from, to],
    );
    return rows.map(rowToTransaction);
  },

  /**
   * Get transactions for a specific category
   */
  async getByCategory(
    db: SQLiteDatabase,
    categoryId: string,
  ): Promise<Transaction[]> {
    const rows = await db.getAllAsync<TransactionRow>(
      "SELECT * FROM transactions WHERE category_id = ? ORDER BY date DESC",
      [categoryId],
    );
    return rows.map(rowToTransaction);
  },

  /**
   * Get summary (income and expense totals) for a date range
   */
  async getSummaryByPeriod(
    db: SQLiteDatabase,
    from: string,
    to: string,
  ): Promise<{ income: number; expense: number }> {
    const rows = await db.getAllAsync<{ type: string; total: number | null }>(
      `SELECT type, COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE date >= ? AND date <= ?
       GROUP BY type`,
      [from, to],
    );

    const result = { income: 0, expense: 0 };
    for (const row of rows) {
      if (row.type === "income") {
        result.income = row.total || 0;
      } else if (row.type === "expense") {
        result.expense = row.total || 0;
      }
    }
    return result;
  },

  /**
   * Get transactions grouped by category with totals
   */
  async getGroupedByCategory(
    db: SQLiteDatabase,
    from: string,
    to: string,
    type: TransactionType,
  ): Promise<CategorySpend[]> {
    const rows = await db.getAllAsync<CategorySpend>(
      `SELECT category_id as categoryId, COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE date >= ? AND date <= ? AND type = ?
       GROUP BY category_id
       ORDER BY total DESC`,
      [from, to, type],
    );
    return rows;
  },

  /**
   * Get transaction count within a date range
   */
  async getCountByPeriod(
    db: SQLiteDatabase,
    from: string,
    to: string,
  ): Promise<number> {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM transactions WHERE date >= ? AND date <= ?`,
      [from, to],
    );
    return result?.count || 0;
  },
};
