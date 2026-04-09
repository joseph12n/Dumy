/**
 * Custom hooks for statistics and financial insights
 * Wraps statsStore and triggers computations automatically
 */

import { useEffect } from 'react';
import { useStatsStore } from '../store/statsStore';
import { BudgetStatus, CategoryBreakdown, PeriodStats, TrendData } from '../store/types';
import { getMonthRange } from '../utils/dates';

/**
 * Get all monthly statistics with automatic computation
 * Triggers recomputation when month changes
 */
export function useMonthlyStats(year: number, month: number) {
  const statsStore = useStatsStore();
  const currentPeriodStats = useStatsStore((s) => s.currentPeriodStats);
  const categoryBreakdown = useStatsStore((s) => s.categoryBreakdown);
  const trends = useStatsStore((s) => s.trends);
  const budgetStatus = useStatsStore((s) => s.budgetStatus);
  const isComputing = useStatsStore((s) => s.isComputing);

  useEffect(() => {
    const { from, to } = getMonthRange(year, month);
    statsStore.computeStatsForPeriod(from, to);
    statsStore.computeTrends();
    statsStore.computeBudgetStatus();
  }, [year, month, statsStore]);

  return {
    periodStats: currentPeriodStats,
    categoryBreakdown,
    trends,
    budgetStatus,
    isComputing,
  };
}

/**
 * Get period statistics only
 */
export function usePeriodStats(): PeriodStats | null {
  return useStatsStore((s) => s.currentPeriodStats);
}

/**
 * Get category breakdown for current period
 */
export function useCategoryBreakdown(): CategoryBreakdown[] {
  return useStatsStore((s) => s.categoryBreakdown);
}

/**
 * Get trend data (week-over-week, month-over-month)
 */
export function useTrends(): TrendData | null {
  return useStatsStore((s) => s.trends);
}

/**
 * Get budget status for all budgets
 */
export function useBudgetStatus(): BudgetStatus[] {
  return useStatsStore((s) => s.budgetStatus);
}

/**
 * Get status for a specific category's budget
 */
export function useCategoryBudgetStatus(categoryId: string): BudgetStatus | undefined {
  const budgetStatus = useStatsStore((s) => s.budgetStatus);
  return budgetStatus.find((b) => b.categoryId === categoryId);
}

/**
 * Check if any budget is exceeded
 */
export function useHasOverBudget(): boolean {
  const budgetStatus = useStatsStore((s) => s.budgetStatus);
  return budgetStatus.some((b) => b.isOverBudget);
}

/**
 * Get percentage used for a specific category budget
 */
export function useBudgetPercentageUsed(categoryId: string): number {
  const budgetStatus = useStatsStore((s) => s.budgetStatus);
  const status = budgetStatus.find((b) => b.categoryId === categoryId);
  return status?.percentageUsed || 0;
}

/**
 * Get savings rate for current month
 */
export function useSavingsRate(): number {
  const periodStats = useStatsStore((s) => s.currentPeriodStats);
  if (!periodStats || periodStats.totalIncome === 0) return 0;

  const savings = periodStats.totalIncome - periodStats.totalExpense;
  return (savings / periodStats.totalIncome) * 100;
}

/**
 * Get total spending for current period
 */
export function useTotalSpending(): number {
  const periodStats = useStatsStore((s) => s.currentPeriodStats);
  return periodStats?.totalExpense || 0;
}

/**
 * Get total income for current period
 */
export function useTotalIncome(): number {
  const periodStats = useStatsStore((s) => s.currentPeriodStats);
  return periodStats?.totalIncome || 0;
}

/**
 * Get net balance for current period
 */
export function useNetBalance(): number {
  const periodStats = useStatsStore((s) => s.currentPeriodStats);
  return periodStats?.balance || 0;
}

/**
 * Get stats loading state
 */
export function useStatsLoading(): boolean {
  return useStatsStore((s) => s.isComputing);
}
