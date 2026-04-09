import { useMemo } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';
import { BudgetStatus, CategoryBreakdown, PeriodStats, TrendData } from '../store/types';
import { getDaysElapsedInMonth, getDaysInMonth, getMonthRange } from '../utils/dates';

export function useMonthlyStats(year: number, month: number) {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const budgets = useCategoryStore((s) => s.budgets);

  return useMemo(() => {
    const { from, to } = getMonthRange(year, month);
    const periodTxs = transactions.filter((t) => t.date >= from && t.date <= to);

    // Period stats
    let totalIncome = 0;
    let totalExpense = 0;
    for (const t of periodTxs) {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    }

    const periodStats: PeriodStats = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: periodTxs.length,
      period: { from, to },
    };

    // Category breakdown (expenses)
    const byCategory = new Map<string, number>();
    const countByCategory = new Map<string, number>();
    let expenseTotal = 0;

    for (const t of periodTxs) {
      if (t.type === 'expense') {
        byCategory.set(t.categoryId, (byCategory.get(t.categoryId) || 0) + t.amount);
        countByCategory.set(t.categoryId, (countByCategory.get(t.categoryId) || 0) + 1);
        expenseTotal += t.amount;
      }
    }

    const categoryBreakdown: CategoryBreakdown[] = [];
    for (const [catId, amount] of byCategory.entries()) {
      const cat = categories.find((c) => c.id === catId);
      if (!cat) continue;
      categoryBreakdown.push({
        categoryId: catId,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        totalSpent: amount,
        percentage: expenseTotal > 0 ? (amount / expenseTotal) * 100 : 0,
        transactionCount: countByCategory.get(catId) || 0,
      });
    }
    categoryBreakdown.sort((a, b) => b.totalSpent - a.totalSpent);

    // Trends
    const today = new Date();
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prev = getMonthRange(prevYear, prevMonth);
    const prevTxs = transactions.filter((t) => t.date >= prev.from && t.date <= prev.to);

    const prevExpense = prevTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const monthOverMonth = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0;
    const daysElapsed = getDaysElapsedInMonth(year, month, today);
    const dailyAvg = daysElapsed > 0 ? Math.round(totalExpense / daysElapsed) : 0;
    const totalDays = getDaysInMonth(year, month);

    const trends: TrendData = {
      weekOverWeek: monthOverMonth,
      monthOverMonth,
      dailyAverageThisMonth: dailyAvg,
      projectedMonthTotal: Math.round(dailyAvg * totalDays),
    };

    // Budget status
    const budgetStatus: BudgetStatus[] = [];
    for (const budget of budgets) {
      const cat = categories.find((c) => c.id === budget.categoryId);
      if (!cat) continue;

      const spent = periodTxs
        .filter((t) => t.categoryId === budget.categoryId && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);

      const remaining = budget.limitAmount - spent;
      const pct = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;

      budgetStatus.push({
        budgetId: budget.id,
        categoryId: budget.categoryId,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        limitAmount: budget.limitAmount,
        spent,
        remaining: Math.max(0, remaining),
        percentageUsed: Math.min(100, pct),
        isOverBudget: spent > budget.limitAmount,
        period: budget.period,
      });
    }

    return {
      periodStats,
      categoryBreakdown,
      trends,
      budgetStatus,
      isComputing: false,
    };
  }, [transactions, categories, budgets, year, month]);
}

export function useBudgetStatus(): BudgetStatus[] {
  const today = new Date();
  const { budgetStatus } = useMonthlyStats(today.getFullYear(), today.getMonth() + 1);
  return budgetStatus;
}
