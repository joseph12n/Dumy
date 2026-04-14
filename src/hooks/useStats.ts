/**
 * Custom hooks for statistics and financial insights
 * Backward-compatible facade over the centralized financial system.
 */

import {
    BudgetStatus,
    CategoryBreakdown,
    PeriodStats,
    TrendData,
} from "../store/types";
import { useFinancialSystem } from "./useFinancialSystem";

/**
 * Get all monthly statistics with automatic computation
 * Triggers recomputation when month changes
 */
export function useMonthlyStats(year: number, month: number) {
  const financial = useFinancialSystem({ year, month });

  return {
    periodStats: financial.stats,
    categoryBreakdown: financial.categoryBreakdown,
    trends: financial.trends,
    budgetStatus: financial.budgetStatus,
    isComputing: financial.isLoading,
  };
}

/**
 * Get period statistics only
 */
export function usePeriodStats(): PeriodStats | null {
  return useFinancialSystem().stats;
}

/**
 * Get category breakdown for current period
 */
export function useCategoryBreakdown(): CategoryBreakdown[] {
  return useFinancialSystem().categoryBreakdown;
}

/**
 * Get trend data (week-over-week, month-over-month)
 */
export function useTrends(): TrendData | null {
  return useFinancialSystem().trends;
}

/**
 * Get budget status for all budgets
 */
export function useBudgetStatus(): BudgetStatus[] {
  return useFinancialSystem().budgetStatus;
}

/**
 * Get status for a specific category's budget
 */
export function useCategoryBudgetStatus(
  categoryId: string,
): BudgetStatus | undefined {
  const budgetStatus = useFinancialSystem().budgetStatus;
  return budgetStatus.find((b) => b.categoryId === categoryId);
}

/**
 * Check if any budget is exceeded
 */
export function useHasOverBudget(): boolean {
  return useFinancialSystem().overBudgetAlerts.length > 0;
}

/**
 * Get percentage used for a specific category budget
 */
export function useBudgetPercentageUsed(categoryId: string): number {
  const budgetStatus = useFinancialSystem().budgetStatus;
  const status = budgetStatus.find((b) => b.categoryId === categoryId);
  return status?.percentageUsed || 0;
}

/**
 * Get savings rate for current month
 */
export function useSavingsRate(): number {
  const periodStats = useFinancialSystem().stats;
  if (!periodStats || periodStats.totalIncome === 0) return 0;

  const savings = periodStats.totalIncome - periodStats.totalExpense;
  return (savings / periodStats.totalIncome) * 100;
}

/**
 * Get total spending for current period
 */
export function useTotalSpending(): number {
  const periodStats = useFinancialSystem().stats;
  return periodStats?.totalExpense || 0;
}

/**
 * Get total income for current period
 */
export function useTotalIncome(): number {
  const periodStats = useFinancialSystem().stats;
  return periodStats?.totalIncome || 0;
}

/**
 * Get net balance for current period
 */
export function useNetBalance(): number {
  const periodStats = useFinancialSystem().stats;
  return periodStats?.balance || 0;
}

/**
 * Get stats loading state
 */
export function useStatsLoading(): boolean {
  return useFinancialSystem().isLoading;
}
