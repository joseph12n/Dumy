import type { SQLiteDatabase } from "expo-sqlite";
import { nowISO } from "../../utils/dates";
import { generateId } from "../../utils/uuid";
import {
    Budget,
    BudgetPeriod,
    CreateBudgetInput,
    UpdateBudgetInput,
} from "../types";

type BudgetRow = {
  id: string;
  category_id: string;
  limit_amount: number;
  period: string;
  created_at: string;
};

function rowToBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    categoryId: row.category_id,
    limitAmount: row.limit_amount,
    period: row.period as BudgetPeriod,
    createdAt: row.created_at,
  };
}

export const budgetRepository = {
  /**
   * Get all budgets, most recent first
   */
  async getAll(db: SQLiteDatabase): Promise<Budget[]> {
    const rows = await db.getAllAsync<BudgetRow>(
      "SELECT * FROM budgets ORDER BY created_at DESC",
    );
    return rows.map(rowToBudget);
  },

  /**
   * Get the most recent (active) budget for a category
   */
  async getByCategory(
    db: SQLiteDatabase,
    categoryId: string,
  ): Promise<Budget | null> {
    const row = await db.getFirstAsync<BudgetRow>(
      `SELECT * FROM budgets WHERE category_id = ? ORDER BY created_at DESC LIMIT 1`,
      [categoryId],
    );
    return row ? rowToBudget(row) : null;
  },

  /**
   * Get a single budget by ID
   */
  async getById(db: SQLiteDatabase, id: string): Promise<Budget | null> {
    const row = await db.getFirstAsync<BudgetRow>(
      "SELECT * FROM budgets WHERE id = ?",
      [id],
    );
    return row ? rowToBudget(row) : null;
  },

  /**
   * Insert a new budget
   */
  async insert(db: SQLiteDatabase, input: CreateBudgetInput): Promise<Budget> {
    const id = generateId();
    const now = nowISO();

    await db.runAsync(
      `INSERT INTO budgets (id, category_id, limit_amount, period, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, input.categoryId, input.limitAmount, input.period, now],
    );

    return {
      id,
      categoryId: input.categoryId,
      limitAmount: input.limitAmount,
      period: input.period,
      createdAt: now,
    };
  },

  /**
   * Update a budget
   */
  async update(
    db: SQLiteDatabase,
    id: string,
    input: Partial<UpdateBudgetInput>,
  ): Promise<Budget | null> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.limitAmount !== undefined) {
      updates.push("limit_amount = ?");
      values.push(input.limitAmount);
    }
    if (input.period !== undefined) {
      updates.push("period = ?");
      values.push(input.period);
    }

    if (updates.length === 0) {
      return this.getById(db, id);
    }

    values.push(id);
    await db.runAsync(
      `UPDATE budgets SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return this.getById(db, id);
  },

  /**
   * Delete a budget
   */
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync("DELETE FROM budgets WHERE id = ?", [id]);
  },
};
