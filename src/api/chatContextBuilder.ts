/**
 * Build financial context from live Zustand stores
 * Injects current transaction data into LLM prompts
 */

import { FinancialContext } from '../store/types';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryStore } from '../store/categoryStore';
import { useStatsStore } from '../store/statsStore';
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

  return {
    currentMonthSummary: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      topCategories,
    },
    recentTransactions,
    budgetAlerts,
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
