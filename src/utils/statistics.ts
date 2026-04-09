/**
 * Pure statistical calculation functions
 * No side effects, no database access
 */

import {
  Budget,
  BudgetStatus,
  Category,
  CategoryBreakdown,
  DailySummary,
  PeriodStats,
  Transaction,
  TrendData,
} from '../store/types';
import { getDaysElapsedInMonth, getDaysInMonth } from './dates';

/**
 * Compute period summary (income, expense, balance)
 */
export function computePeriodSummary(
  transactions: Transaction[],
  from: string,
  to: string,
): PeriodStats {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  }

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: transactions.length,
    period: { from, to },
  };
}

/**
 * Compute category breakdown by expense
 * Returns categories sorted by amount descending
 */
export function computeCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  type: 'expense' | 'income',
): CategoryBreakdown[] {
  // Group transactions by category
  const byCategory = new Map<string, number>();
  let total = 0;

  for (const transaction of transactions) {
    if (transaction.type === type) {
      const current = byCategory.get(transaction.categoryId) || 0;
      byCategory.set(transaction.categoryId, current + transaction.amount);
      total += transaction.amount;
    }
  }

  // Map to breakdown with category info
  const breakdown: CategoryBreakdown[] = [];

  for (const [categoryId, amount] of byCategory.entries()) {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) continue;

    const percentage = total > 0 ? (amount / total) * 100 : 0;
    const count = transactions.filter(
      (t) => t.categoryId === categoryId && t.type === type,
    ).length;

    breakdown.push({
      categoryId,
      categoryName: category.name,
      categoryIcon: category.icon,
      categoryColor: category.color,
      totalSpent: amount,
      percentage,
      transactionCount: count,
    });
  }

  // Sort by amount descending
  breakdown.sort((a, b) => b.totalSpent - a.totalSpent);

  return breakdown;
}

/**
 * Compute trends (week-over-week, month-over-month, projections)
 */
export function computeTrends(
  currentPeriodTransactions: Transaction[],
  previousPeriodTransactions: Transaction[],
  today: Date,
): TrendData {
  // Calculate totals for each period
  const currentExpense = currentPeriodTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const previousExpense = previousPeriodTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Week-over-week percentage change
  const weekOverWeek =
    previousExpense > 0
      ? ((currentExpense - previousExpense) / previousExpense) * 100
      : 0;

  // Month-over-month percentage change (same logic)
  const monthOverMonth = weekOverWeek;

  // Daily average this month
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const daysElapsed = getDaysElapsedInMonth(year, month, today);
  const dailyAverageThisMonth =
    daysElapsed > 0 ? Math.round(currentExpense / daysElapsed) : 0;

  // Projected month total
  const totalDaysInMonth = getDaysInMonth(year, month);
  const projectedMonthTotal = Math.round(
    dailyAverageThisMonth * totalDaysInMonth,
  );

  return {
    weekOverWeek,
    monthOverMonth,
    dailyAverageThisMonth,
    projectedMonthTotal,
  };
}

/**
 * Compute budget status for a single budget
 */
export function computeBudgetStatus(
  budget: Budget,
  category: Category,
  spentAmount: number,
): BudgetStatus {
  const remaining = budget.limitAmount - spentAmount;
  const percentageUsed =
    budget.limitAmount > 0 ? (spentAmount / budget.limitAmount) * 100 : 0;

  return {
    budgetId: budget.id,
    categoryId: budget.categoryId,
    categoryName: category.name,
    categoryIcon: category.icon,
    categoryColor: category.color,
    limitAmount: budget.limitAmount,
    spent: spentAmount,
    remaining: Math.max(0, remaining),
    percentageUsed: Math.min(100, percentageUsed),
    isOverBudget: spentAmount > budget.limitAmount,
    period: budget.period,
  };
}

/**
 * Group transactions by day (YYYY-MM-DD)
 */
export function groupTransactionsByDay(
  transactions: Transaction[],
): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const day = transaction.date;
    if (!grouped.has(day)) {
      grouped.set(day, []);
    }
    grouped.get(day)!.push(transaction);
  }

  return grouped;
}

/**
 * Group transactions by week (ISO week string YYYY-Www)
 */
export function groupTransactionsByWeek(
  transactions: Transaction[],
): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const date = new Date(transaction.date + 'T00:00:00Z');
    // ISO week calculation
    const tempDate = new Date(date.getTime());
    tempDate.setDate(tempDate.getDate() - tempDate.getDay() + (tempDate.getDay() === 0 ? -6 : 1)); // Adjust to Monday
    const weekStart = tempDate.toISOString().split('T')[0];

    if (!grouped.has(weekStart)) {
      grouped.set(weekStart, []);
    }
    grouped.get(weekStart)!.push(transaction);
  }

  return grouped;
}

/**
 * Compute running balance (daily cumulative balance)
 * Used for balance-over-time charts
 */
export function computeRunningBalance(
  transactions: Transaction[],
  initialBalance: number = 0,
): DailySummary[] {
  // Group by day and sort
  const byDay = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    if (!byDay.has(transaction.date)) {
      byDay.set(transaction.date, []);
    }
    byDay.get(transaction.date)!.push(transaction);
  }

  // Sort dates
  const sortedDates = Array.from(byDay.keys()).sort();

  // Calculate running balance
  const result: DailySummary[] = [];
  let runningBalance = initialBalance;

  for (const date of sortedDates) {
    const dayTransactions = byDay.get(date) || [];

    let dayIncome = 0;
    let dayExpense = 0;

    for (const transaction of dayTransactions) {
      if (transaction.type === 'income') {
        dayIncome += transaction.amount;
      } else {
        dayExpense += transaction.amount;
      }
    }

    runningBalance = runningBalance + dayIncome - dayExpense;

    result.push({
      date,
      income: dayIncome,
      expense: dayExpense,
      balance: runningBalance,
    });
  }

  return result;
}

/**
 * Get daily average expense over a period
 */
export function computeDailyAverage(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;

  // Get unique days
  const days = new Set(transactions.map((t) => t.date));
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return days.size > 0 ? Math.round(totalExpense / days.size) : 0;
}

/**
 * Get category with highest spending
 */
export function getTopSpendingCategory(
  breakdown: CategoryBreakdown[],
): CategoryBreakdown | null {
  return breakdown.length > 0 ? breakdown[0] : null;
}

/**
 * Calculate savings rate percentage (income - expense) / income * 100
 */
export function computeSavingsRate(
  totalIncome: number,
  totalExpense: number,
): number {
  if (totalIncome <= 0) return 0;
  return ((totalIncome - totalExpense) / totalIncome) * 100;
}
