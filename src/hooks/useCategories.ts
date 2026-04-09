/**
 * Custom hooks for category and budget management
 * Wraps categoryStore for component consumption
 */

import { useCategoryStore } from '../store/categoryStore';
import { Budget, Category, CreateBudgetInput, CreateCategoryInput } from '../store/types';

/**
 * Get all categories with CRUD operations
 */
export function useCategories() {
  const categories = useCategoryStore((s) => s.categories);
  const isLoading = useCategoryStore((s) => s.isLoading);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}

/**
 * Get a single category by ID
 */
export function useCategoryById(id: string): Category | undefined {
  return useCategoryStore((s) => s.getCategoryById(id));
}

/**
 * Get default categories only
 */
export function useDefaultCategories(): Category[] {
  const categories = useCategoryStore((s) => s.categories);
  return categories.filter((c) => c.isDefault === 1);
}

/**
 * Get custom (user-created) categories
 */
export function useCustomCategories(): Category[] {
  const categories = useCategoryStore((s) => s.categories);
  return categories.filter((c) => c.isDefault === 0);
}

/**
 * Get categories sorted by name
 */
export function useCategoriesSorted(): Category[] {
  const categories = useCategoryStore((s) => s.categories);
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get all budgets with CRUD operations
 */
export function useBudgets() {
  const budgets = useCategoryStore((s) => s.budgets);
  const addBudget = useCategoryStore((s) => s.addBudget);
  const updateBudget = useCategoryStore((s) => s.updateBudget);
  const deleteBudget = useCategoryStore((s) => s.deleteBudget);

  return {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
  };
}

/**
 * Get budget for a specific category
 */
export function useCategoryBudget(categoryId: string): Budget | undefined {
  return useCategoryStore((s) =>
    s.getBudgetForCategory(categoryId),
  );
}

/**
 * Get all budgets for multiple categories
 */
export function useBudgetsForCategories(categoryIds: string[]): Budget[] {
  const budgets = useCategoryStore((s) => s.budgets);
  return budgets.filter((b) => categoryIds.includes(b.categoryId));
}

/**
 * Get categories with budgets
 */
export function useCategoriesWithBudgets(): Array<Category & { budget: Budget | null }> {
  const categories = useCategoryStore((s) => s.categories);
  const categoryStore = useCategoryStore((s) => s);

  return categories.map((c) => ({
    ...c,
    budget: categoryStore.getBudgetForCategory(c.id) || null,
  }));
}

/**
 * Get categories without budgets
 */
export function useCategoriesWithoutBudgets(): Category[] {
  const categories = useCategoryStore((s) => s.categories);
  const budgets = useCategoryStore((s) => s.budgets);
  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));

  return categories.filter((c) => !budgetedCategoryIds.has(c.id));
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
  const categories = useCategoryStore((s) => s.categories);
  return categories.length;
}

/**
 * Get budget count
 */
export function useBudgetCount(): number {
  const budgets = useCategoryStore((s) => s.budgets);
  return budgets.length;
}

/**
 * Get category loading state
 */
export function useCategoriesLoading(): boolean {
  return useCategoryStore((s) => s.isLoading);
}
