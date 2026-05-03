/**
 * Build financial context from live Zustand stores
 * Injects current transaction data + savings goals into LLM prompts
 */

import { useCategoryStore } from '../store/categoryStore';
import { useSavingsStore } from '../store/savingsStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTransactionStore } from '../store/transactionStore';
import { FinancialContext } from '../store/types';
import { getMonthRange } from '../utils/dates';
import { computeCategoryBreakdown } from '../utils/statistics';

/**
 * Build complete financial context from current app state
 * This is injected into every LLM prompt so the model has real data
 */
export async function buildChatContext(
  recentMessageLimit: number = 5,
): Promise<FinancialContext> {
  const transactions = useTransactionStore.getState().transactions;
  const categories = useCategoryStore.getState().categories;
  const budgets = useCategoryStore.getState().budgets;
  const goals = useSavingsStore.getState().goals;
  const settingsMap = useSettingsStore.getState().settings;

  // Get current month range
  const today = new Date();
  const { from, to } = getMonthRange(today.getFullYear(), today.getMonth() + 1);

  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(
    (t) => t.date >= from && t.date <= to,
  );

  // Calculate month summary
  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of currentMonthTransactions) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
    }
  }

  // Get top 3 spending categories
  const breakdown = computeCategoryBreakdown(
    currentMonthTransactions,
    categories,
    'expense',
  );

  const topCategories = breakdown.slice(0, 3).map((item) => ({
    name: item.categoryName,
    amount: item.totalSpent,
    percentage: item.percentage,
  }));

  // Format recent transactions
  const recentTransactions = currentMonthTransactions
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, recentMessageLimit)
    .map((tx) => {
      const category = categories.find((c) => c.id === tx.categoryId);
      return {
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        categoryName: category?.name || 'Otros',
        date: tx.date,
      };
    });

  // Build budget alerts for categories near/over limit
  const budgetAlerts = budgets
    .map((budget) => {
      const category = categories.find((c) => c.id === budget.categoryId);
      if (!category) return null;

      const spent = currentMonthTransactions
        .filter(
          (t) =>
            t.categoryId === budget.categoryId && t.type === 'expense',
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const percentageUsed =
        budget.limitAmount > 0
          ? (spent / budget.limitAmount) * 100
          : 0;

      // Only include alerts for budgets at 70%+ utilization
      if (percentageUsed >= 70) {
        return {
          categoryName: category.name,
          percentageUsed,
          isOverBudget: spent > budget.limitAmount,
        };
      }

      return null;
    })
    .filter((alert) => alert !== null) as Array<{
    categoryName: string;
    percentageUsed: number;
    isOverBudget: boolean;
  }>;

  // Build savings context from current goals
  const activeGoals = goals.filter((g) => g.isCompleted === 0);
  const completedGoalsCount = goals.filter((g) => g.isCompleted === 1).length;
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const savingsContext =
    goals.length > 0
      ? {
          totalSaved,
          activeGoals: activeGoals.map((g) => ({
            name: g.name,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount,
            progressPercent:
              g.targetAmount > 0
                ? Math.min(100, (g.currentAmount / g.targetAmount) * 100)
                : 0,
            deadline: g.deadline,
          })),
          completedGoalsCount,
        }
      : undefined;

  // Resolve user name from settings
  const userName = settingsMap['profile_name'] || undefined;

  return {
    currentMonthSummary: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      topCategories,
    },
    recentTransactions,
    budgetAlerts,
    userName,
    savingsContext,
  };
}

/**
 * Format conversation history for LLM
 * Takes messages and returns formatted history
 * Called directly from chatStore to avoid circular dependencies
 */
export function formatConversationHistory(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages;
}
