/**
 * Custom hooks for category and budget management
 * Backward-compatible facade over the centralized financial system.
 */

import {
    Budget,
    Category
} from "../store/types";
import { useFinancialSystem } from "./useFinancialSystem";

/**
 * Get all categories with CRUD operations
 */
export function useCategories() {
  const financial = useFinancialSystem();

  return {
    categories: financial.categories,
    isLoading: financial.isLoading,
    addCategory: financial.addCategory,
    updateCategory: financial.updateCategory,
    deleteCategory: financial.deleteCategory,
  };
}

/**
 * Get a single category by ID
 */
export function useCategoryById(id: string): Category | undefined {
  const financial = useFinancialSystem();
  return financial.findCategoryById(id);
}

/**
 * Get default categories only
 */
export function useDefaultCategories(): Category[] {
  const financial = useFinancialSystem();
  return financial.categories.filter((c) => c.isDefault === 1);
}

/**
 * Get custom (user-created) categories
 */
export function useCustomCategories(): Category[] {
  const financial = useFinancialSystem();
  return financial.categories.filter((c) => c.isDefault === 0);
}

/**
 * Get categories sorted by name
 */
export function useCategoriesSorted(): Category[] {
  const financial = useFinancialSystem();
  return [...financial.categories].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get all budgets with CRUD operations
 */
export function useBudgets() {
  const financial = useFinancialSystem();

  return {
    budgets: financial.budgets,
    addBudget: financial.addBudget,
    updateBudget: financial.updateBudget,
    deleteBudget: financial.deleteBudget,
  };
}

/**
 * Get budget for a specific category
 */
export function useCategoryBudget(categoryId: string): Budget | undefined {
  const { budgets } = useBudgets();
  return budgets.find((b) => b.categoryId === categoryId);
}

/**
 * Get all budgets for multiple categories
 */
export function useBudgetsForCategories(categoryIds: string[]): Budget[] {
  const { budgets } = useBudgets();
  return budgets.filter((b) => categoryIds.includes(b.categoryId));
}

/**
 * Get categories with budgets
 */
export function useCategoriesWithBudgets(): Array<
  Category & { budget: Budget | null }
> {
  const financial = useFinancialSystem();
  const { budgets } = useBudgets();

  return financial.categories.map((c) => ({
    ...c,
    budget: budgets.find((b) => b.categoryId === c.id) || null,
  }));
}

/**
 * Get categories without budgets
 */
export function useCategoriesWithoutBudgets(): Category[] {
  const financial = useFinancialSystem();
  const { budgets } = useBudgets();
  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));

  return financial.categories.filter((c) => !budgetedCategoryIds.has(c.id));
}

/**
 * Check if a category has a budget
 */
export function useCategoryHasBudget(categoryId: string): boolean {
  const budget = useCategoryBudget(categoryId);
  return budget !== undefined;
}

/**
 * Get budget limit for a category (null if no budget)
 */
export function useCategoryBudgetLimit(categoryId: string): number | null {
  const budget = useCategoryBudget(categoryId);
  return budget?.limitAmount || null;
}

/**
 * Get category count
 */
export function useCategoryCount(): number {
  const financial = useFinancialSystem();
  return financial.categories.length;
}

/**
 * Get budget count
 */
export function useBudgetCount(): number {
  const financial = useFinancialSystem();
  return financial.budgetsCount;
}

/**
 * Get category loading state
 */
export function useCategoriesLoading(): boolean {
  const financial = useFinancialSystem();
  return financial.isLoading;
}
