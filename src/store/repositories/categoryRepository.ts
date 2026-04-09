import type { SQLiteDatabase } from "expo-sqlite";
import { generateId } from "../../utils/uuid";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "../types";

type CategoryRow = {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: 0 | 1;
  budget_limit: number | null;
};

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isDefault: row.is_default,
    budgetLimit: row.budget_limit,
  };
}

export const categoryRepository = {
  /**
   * Get all categories
   */
  async getAll(db: SQLiteDatabase): Promise<Category[]> {
    const rows = await db.getAllAsync<CategoryRow>(
      "SELECT * FROM categories ORDER BY name",
    );
    return rows.map(rowToCategory);
  },

  /**
   * Get a single category by ID
   */
  async getById(db: SQLiteDatabase, id: string): Promise<Category | null> {
    const row = await db.getFirstAsync<CategoryRow>(
      "SELECT * FROM categories WHERE id = ?",
      [id],
    );
    return row ? rowToCategory(row) : null;
  },

  /**
   * Get default categories only
   */
  async getDefaults(db: SQLiteDatabase): Promise<Category[]> {
    const rows = await db.getAllAsync<CategoryRow>(
      "SELECT * FROM categories WHERE is_default = 1 ORDER BY name",
    );
    return rows.map(rowToCategory);
  },

  /**
   * Insert a new category
   */
  async insert(
    db: SQLiteDatabase,
    input: CreateCategoryInput,
  ): Promise<Category> {
    const id = generateId();

    await db.runAsync(
      `INSERT INTO categories (id, name, icon, color, is_default, budget_limit)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.name,
        input.icon,
        input.color,
        0, // New user categories are never default
        input.budgetLimit || null,
      ],
    );

    return {
      id,
      name: input.name,
      icon: input.icon,
      color: input.color,
      isDefault: 0,
      budgetLimit: input.budgetLimit || null,
    };
  },

  /**
   * Update a category (cannot change is_default via this method)
   */
  async update(
    db: SQLiteDatabase,
    id: string,
    input: Partial<UpdateCategoryInput>,
  ): Promise<Category | null> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) {
      updates.push("name = ?");
      values.push(input.name);
    }
    if (input.icon !== undefined) {
      updates.push("icon = ?");
      values.push(input.icon);
    }
    if (input.color !== undefined) {
      updates.push("color = ?");
      values.push(input.color);
    }
    if (input.budgetLimit !== undefined) {
      updates.push("budget_limit = ?");
      values.push(input.budgetLimit || null);
    }

    if (updates.length === 0) {
      return this.getById(db, id);
    }

    values.push(id);
    await db.runAsync(
      `UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return this.getById(db, id);
  },

  /**
   * Delete a category (guard against deleting default categories)
   */
  async delete(db: SQLiteDatabase, id: string): Promise<void> {
    const category = await this.getById(db, id);
    if (category && category.isDefault === 1) {
      throw new Error("Cannot delete a default category");
    }

    await db.runAsync("DELETE FROM categories WHERE id = ?", [id]);
  },
};
