import { create } from 'zustand';
import { Budget, Category, CreateBudgetInput, CreateCategoryInput } from './types';
import { getDatabase } from './database';
import { categoryRepository } from './repositories/categoryRepository';
import { budgetRepository } from './repositories/budgetRepository';

interface CategoryState {
  categories: Category[];
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCategories: () => Promise<void>;
  loadBudgets: () => Promise<void>;
  addCategory: (input: CreateCategoryInput) => Promise<Category>;
  updateCategory: (
    id: string,
    input: Partial<CreateCategoryInput>,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBudget: (input: CreateBudgetInput) => Promise<Budget>;
  updateBudget: (id: string, input: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Selectors
  getCategoryById: (id: string) => Category | undefined;
  getBudgetForCategory: (categoryId: string) => Budget | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  budgets: [],
  isLoading: false,
  error: null,

  loadCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      const categories = await categoryRepository.getAll(db);
      set({ categories, isLoading: false });
      console.log(`[CategoryStore] Loaded ${categories.length} categories`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      console.error('[CategoryStore] Error loading categories:', error);
    }
  },

  loadBudgets: async () => {
    try {
      const db = await getDatabase();
      const budgets = await budgetRepository.getAll(db);
      set({ budgets });
      console.log(`[CategoryStore] Loaded ${budgets.length} budgets`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[CategoryStore] Error loading budgets:', error);
    }
  },

  addCategory: async (input) => {
    try {
      const db = await getDatabase();
      const category = await categoryRepository.insert(db, input);
      set((state) => ({
        categories: [...state.categories, category],
      }));
      console.log('[CategoryStore] Category added:', category.id);
      return category;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[CategoryStore] Error adding category:', error);
      throw error;
    }
  },

  updateCategory: async (id, input) => {
    try {
      const db = await getDatabase();
      const updated = await categoryRepository.update(db, id, input);
      if (updated) {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? updated : c,
          ),
        }));
        console.log('[CategoryStore] Category updated:', id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[CategoryStore] Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const db = await getDatabase();
      await categoryRepository.delete(db, id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
      console.log('[CategoryStore] Category deleted:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[CategoryStore] Error deleting category:', error);
      throw error;
    }
  },

  addBudget: async (input) => {
    try {
      const db = await getDatabase();
      const budget = await budgetRepository.insert(db, input);
      set((state) => ({
        budgets: [budget, ...state.budgets],
      }));
      console.log('[CategoryStore] Budget added:', budget.id);
      return budget;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[CategoryStore] Error adding budget:', error);
      throw error;
    }
  },

  updateBudget: async (id, input) => {
    try {
      const db = await getDatabase();
      const updated = await budgetRepository.update(db, id, input);
      if (updated) {
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? updated : b,
          ),
        }));
        console.log('[CategoryStore] Budget updated:', id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[CategoryStore] Error updating budget:', error);
      throw error;
    }
  },

  deleteBudget: async (id) => {
    try {
      const db = await getDatabase();
      await budgetRepository.delete(db, id);
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
      }));
      console.log('[CategoryStore] Budget deleted:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[CategoryStore] Error deleting budget:', error);
      throw error;
    }
  },

  getCategoryById: (id) => get().categories.find((c) => c.id === id),
  getBudgetForCategory: (categoryId) =>
    get().budgets.find((b) => b.categoryId === categoryId),
}));
