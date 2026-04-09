import { useCategoryStore } from '../store/categoryStore';
import { Budget, Category, CreateBudgetInput, CreateCategoryInput } from '../store/types';

export function useCategories() {
  const categories = useCategoryStore((s) => s.categories);
  const isLoading = useCategoryStore((s) => s.isLoading);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  return { categories, isLoading, addCategory, updateCategory, deleteCategory };
}

export function useBudgets() {
  const budgets = useCategoryStore((s) => s.budgets);
  const addBudget = useCategoryStore((s) => s.addBudget);
  const updateBudget = useCategoryStore((s) => s.updateBudget);
  const deleteBudget = useCategoryStore((s) => s.deleteBudget);
  return { budgets, addBudget, updateBudget, deleteBudget };
}

export function useCategoriesWithoutBudgets(): Category[] {
  const categories = useCategoryStore((s) => s.categories);
  const budgets = useCategoryStore((s) => s.budgets);
  const budgetedIds = new Set(budgets.map((b) => b.categoryId));
  return categories.filter((c) => !budgetedIds.has(c.id));
}

export function useCategoryCount(): number {
  return useCategoryStore((s) => s.categories).length;
}

export function useBudgetCount(): number {
  return useCategoryStore((s) => s.budgets).length;
}
