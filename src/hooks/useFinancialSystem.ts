import { useMemo } from "react";
import { useCategoryStore } from "../store/categoryStore";
import { useTransactionStore } from "../store/transactionStore";
import {
    Budget,
    BudgetStatus,
    Category,
    CategoryBreakdown,
    CreateBudgetInput,
    CreateCategoryInput,
    CreateTransactionInput,
    PeriodStats,
    Transaction,
    TrendData,
    UpdateTransactionInput,
} from "../store/types";
import { getMonthRange, getPreviousMonthRange } from "../utils/dates";
import {
    computeBudgetStatus,
    computeCategoryBreakdown,
    computePeriodSummary,
    computeTrends,
} from "../utils/statistics";

interface FinancialPeriod {
  year: number;
  month: number;
}

function isWithinRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

function getCurrentPeriod(): FinancialPeriod {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export interface FinancialSystemState {
  period: FinancialPeriod;
  range: { from: string; to: string };
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  budgetsCount: number;
  isLoading: boolean;
  stats: PeriodStats;
  categoryBreakdown: CategoryBreakdown[];
  trends: TrendData;
  budgetStatus: BudgetStatus[];
  overBudgetAlerts: BudgetStatus[];
  recentTransactions: Transaction[];
  addTransaction: (input: CreateTransactionInput) => Promise<Transaction>;
  updateTransaction: (input: UpdateTransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (input: CreateCategoryInput) => Promise<Category>;
  updateCategory: (
    id: string,
    input: Partial<CreateCategoryInput>,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBudget: (input: CreateBudgetInput) => Promise<Budget>;
  updateBudget: (id: string, input: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  findCategoryById: (categoryId: string) => Category | undefined;
}

export function useFinancialSystem(
  requestedPeriod?: FinancialPeriod,
): FinancialSystemState {
  const period = requestedPeriod ?? getCurrentPeriod();
  const range = useMemo(
    () => getMonthRange(period.year, period.month),
    [period.year, period.month],
  );
  const previousRange = useMemo(
    () => getPreviousMonthRange(period.year, period.month),
    [period.year, period.month],
  );

  const transactions = useTransactionStore((s) => s.transactions);
  const transactionLoading = useTransactionStore((s) => s.isLoading);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);

  const categories = useCategoryStore((s) => s.categories);
  const budgets = useCategoryStore((s) => s.budgets);
  const categoryLoading = useCategoryStore((s) => s.isLoading);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  const addBudget = useCategoryStore((s) => s.addBudget);
  const updateBudget = useCategoryStore((s) => s.updateBudget);
  const deleteBudget = useCategoryStore((s) => s.deleteBudget);

  const transactionsInPeriod = useMemo(
    () =>
      transactions.filter((t) => isWithinRange(t.date, range.from, range.to)),
    [transactions, range.from, range.to],
  );

  const previousTransactions = useMemo(
    () =>
      transactions.filter((t) =>
        isWithinRange(t.date, previousRange.from, previousRange.to),
      ),
    [transactions, previousRange.from, previousRange.to],
  );

  const periodStats = useMemo<PeriodStats>(
    () => computePeriodSummary(transactionsInPeriod, range.from, range.to),
    [transactionsInPeriod, range.from, range.to],
  );

  const categoryBreakdown = useMemo<CategoryBreakdown[]>(
    () => computeCategoryBreakdown(transactionsInPeriod, categories, "expense"),
    [transactionsInPeriod, categories],
  );

  const trendData = useMemo<TrendData>(
    () => computeTrends(transactionsInPeriod, previousTransactions, new Date()),
    [transactionsInPeriod, previousTransactions],
  );

  const budgetStatus = useMemo<BudgetStatus[]>(() => {
    return budgets
      .map((budget) => {
        const category = categories.find((c) => c.id === budget.categoryId);
        if (!category) {
          return null;
        }

        const spent = transactionsInPeriod
          .filter(
            (transaction) =>
              transaction.type === "expense" &&
              transaction.categoryId === budget.categoryId,
          )
          .reduce((sum, transaction) => sum + transaction.amount, 0);

        return computeBudgetStatus(budget, category, spent);
      })
      .filter((status): status is BudgetStatus => status !== null);
  }, [budgets, categories, transactionsInPeriod]);

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.createdAt.localeCompare(a.createdAt);
      }),
    [transactions],
  );

  return {
    period,
    range,
    transactions: sortedTransactions,
    categories,
    budgets,
    budgetsCount: budgets.length,
    isLoading: transactionLoading || categoryLoading,
    stats: periodStats,
    categoryBreakdown,
    trends: trendData,
    budgetStatus,
    overBudgetAlerts: budgetStatus.filter((status) => status.isOverBudget),
    recentTransactions: sortedTransactions.slice(0, 10),
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    findCategoryById: (categoryId) =>
      categories.find((category) => category.id === categoryId),
  };
}
