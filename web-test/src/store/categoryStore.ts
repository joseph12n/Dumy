import { create } from 'zustand';
import { Budget, Category, CreateBudgetInput, CreateCategoryInput } from './types';
import { loadFromStorage, saveToStorage } from './storage';
import { generateId } from '../utils/uuid';
import { nowISO } from '../utils/dates';

const STORAGE_KEY = 'dumy-categories';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_food', name: 'Alimentacion', icon: '🍔', color: '#F59E0B', isDefault: 1, budgetLimit: null },
  { id: 'cat_transport', name: 'Transporte', icon: '🚌', color: '#3B82F6', isDefault: 1, budgetLimit: null },
  { id: 'cat_health', name: 'Salud', icon: '❤️', color: '#EF4444', isDefault: 1, budgetLimit: null },
  { id: 'cat_education', name: 'Educacion', icon: '📚', color: '#8B5CF6', isDefault: 1, budgetLimit: null },
  { id: 'cat_leisure', name: 'Ocio', icon: '🎮', color: '#10B981', isDefault: 1, budgetLimit: null },
  { id: 'cat_home', name: 'Hogar', icon: '🏠', color: '#6366F1', isDefault: 1, budgetLimit: null },
  { id: 'cat_shopping', name: 'Compras', icon: '🛍️', color: '#EC4899', isDefault: 1, budgetLimit: null },
  { id: 'cat_income', name: 'Ingresos', icon: '📊', color: '#22C55E', isDefault: 1, budgetLimit: null },
  { id: 'cat_services', name: 'Servicios', icon: '📱', color: '#0EA5E9', isDefault: 1, budgetLimit: null },
  { id: 'cat_other', name: 'Otros', icon: '📦', color: '#9CA3AF', isDefault: 1, budgetLimit: null },
];

interface CategoryState {
  categories: Category[];
  budgets: Budget[];
  isLoading: boolean;

  addCategory: (input: CreateCategoryInput) => Category;
  updateCategory: (id: string, input: Partial<CreateCategoryInput>) => void;
  deleteCategory: (id: string) => void;
  addBudget: (input: CreateBudgetInput) => Budget;
  updateBudget: (id: string, input: Partial<{ limitAmount: number; period: 'monthly' | 'weekly' }>) => void;
  deleteBudget: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getBudgetForCategory: (categoryId: string) => Budget | undefined;
}

const saved = loadFromStorage<{ categories: Category[]; budgets: Budget[] }>(STORAGE_KEY, {
  categories: DEFAULT_CATEGORIES,
  budgets: [],
});

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: saved.categories,
  budgets: saved.budgets,
  isLoading: false,

  addCategory: (input) => {
    const cat: Category = {
      id: generateId(),
      name: input.name,
      icon: input.icon,
      color: input.color,
      isDefault: 0,
      budgetLimit: input.budgetLimit ?? null,
    };
    set((s) => ({ categories: [...s.categories, cat] }));
    return cat;
  },

  updateCategory: (id, input) => {
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, ...input } : c,
      ),
    }));
  },

  deleteCategory: (id) => {
    const cat = get().categories.find((c) => c.id === id);
    if (cat?.isDefault === 1) throw new Error('No puedes eliminar categorias por defecto');
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
      budgets: s.budgets.filter((b) => b.categoryId !== id),
    }));
  },

  addBudget: (input) => {
    const budget: Budget = {
      id: generateId(),
      categoryId: input.categoryId,
      limitAmount: input.limitAmount,
      period: input.period,
      createdAt: nowISO(),
    };
    set((s) => ({ budgets: [budget, ...s.budgets] }));
    return budget;
  },

  updateBudget: (id, input) => {
    set((s) => ({
      budgets: s.budgets.map((b) =>
        b.id === id ? { ...b, ...input } : b,
      ),
    }));
  },

  deleteBudget: (id) => {
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
  },

  getCategoryById: (id) => get().categories.find((c) => c.id === id),
  getBudgetForCategory: (categoryId) => get().budgets.find((b) => b.categoryId === categoryId),
}));

// Auto-persist
useCategoryStore.subscribe((state) => {
  saveToStorage(STORAGE_KEY, { categories: state.categories, budgets: state.budgets });
});
