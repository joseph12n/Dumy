import { create } from 'zustand';
import {
  BudgetStatus,
  CategoryBreakdown,
  PeriodStats,
  TrendData,
} from './types';
import { getDatabase } from './database';
import { transactionRepository } from './repositories/transactionRepository';
import { budgetRepository } from './repositories/budgetRepository';
import {
  computeBudgetStatus,
  computeCategoryBreakdown,
  computePeriodSummary,
  computeTrends,
} from '../utils/statistics';
import { useCategoryStore } from './categoryStore';
import { useTransactionStore } from './transactionStore';

interface StatsState {
  currentPeriodStats: PeriodStats | null;
  categoryBreakdown: CategoryBreakdown[];
  trends: TrendData | null;
  budgetStatus: BudgetStatus[];
  isComputing: boolean;

  // Actions
  computeStatsForPeriod: (from: string, to: string) => Promise<void>;
  computeTrends: () => Promise<void>;
  computeBudgetStatus: () => Promise<void>;
  invalidate: () => void;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  currentPeriodStats: null,
  categoryBreakdown: [],
  trends: null,
  budgetStatus: [],
  isComputing: false,

  computeStatsForPeriod: async (from, to) => {
    set({ isComputing: true });
    try {
      const transactions = useTransactionStore.getState().transactions;
      const categories = useCategoryStore.getState().categories;

      // Filter transactions for the period
      const periodTransactions = transactions.filter(
        (t) => t.date >= from && t.date <= to,
      );

      // Compute period summary
      const periodStats = computePeriodSummary(periodTransactions, from, to);

      // Compute category breakdown for expenses
      const breakdown = computeCategoryBreakdown(
        periodTransactions,
        categories,
        'expense',
      );

      set({
        currentPeriodStats: periodStats,
        categoryBreakdown: breakdown,
        isComputing: false,
      });

      console.log('[StatsStore] Period stats computed for', from, to);
    } catch (error) {
      console.error('[StatsStore] Error computing period stats:', error);
      set({ isComputing: false });
    }
  },

  computeTrends: async () => {
    set({ isComputing: true });
    try {
      const transactions = useTransactionStore.getState().transactions;
      const today = new Date();

      // Get current and previous month transactions
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // Helper to get month range
      const getMonthStart = (year: number, month: number) => {
        return `${year}-${String(month).padStart(2, '0')}-01`;
      };

      const getMonthEnd = (year: number, month: number) => {
        const lastDay = new Date(year, month, 0).getDate();
        return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      };

      const currentStart = getMonthStart(currentYear, currentMonth);
      const currentEnd = getMonthEnd(currentYear, currentMonth);
      const prevStart = getMonthStart(prevYear, prevMonth);
      const prevEnd = getMonthEnd(prevYear, prevMonth);

      const currentTransactions = transactions.filter(
        (t) => t.date >= currentStart && t.date <= currentEnd,
      );
      const previousTransactions = transactions.filter(
        (t) => t.date >= prevStart && t.date <= prevEnd,
      );

      const trendData = computeTrends(
        currentTransactions,
        previousTransactions,
        today,
      );

      set({ trends: trendData, isComputing: false });
      console.log('[StatsStore] Trends computed');
    } catch (error) {
      console.error('[StatsStore] Error computing trends:', error);
      set({ isComputing: false });
    }
  },

  computeBudgetStatus: async () => {
    set({ isComputing: true });
    try {
      const budgets = useCategoryStore.getState().budgets;
      const categories = useCategoryStore.getState().categories;
      const transactions = useTransactionStore.getState().transactions;

      const budgetStatuses: BudgetStatus[] = [];

      for (const budget of budgets) {
        const category = categories.find((c) => c.id === budget.categoryId);
        if (!category) continue;

        // Calculate spent amount for this budget's period
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        // Simple approach: calculate for current month
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const spent = transactions
          .filter(
            (t) =>
              t.categoryId === budget.categoryId &&
              t.type === 'expense' &&
              t.date >= start &&
              t.date <= end,
          )
          .reduce((sum, t) => sum + t.amount, 0);

        const status = computeBudgetStatus(budget, category, spent);
        budgetStatuses.push(status);
      }

      set({ budgetStatus: budgetStatuses, isComputing: false });
      console.log('[StatsStore] Budget status computed for', budgets.length, 'budgets');
    } catch (error) {
      console.error('[StatsStore] Error computing budget status:', error);
      set({ isComputing: false });
    }
  },

  invalidate: () => {
    set({
      currentPeriodStats: null,
      categoryBreakdown: [],
      trends: null,
      budgetStatus: [],
    });
    console.log('[StatsStore] Cache invalidated');
  },
}));
