/**
 * Custom hooks for transaction management.
 * Backward-compatible facade over the centralized financial system.
 */

import { useMemo } from "react";
import { Transaction } from "../store/types";
import { useFinancialSystem } from "./useFinancialSystem";

/**
 * Get all transactions with CRUD operations
 */
export function useTransactions() {
  const financial = useFinancialSystem();

  return {
    transactions: financial.transactions,
    isLoading: financial.isLoading,
    addTransaction: financial.addTransaction,
    updateTransaction: financial.updateTransaction,
    deleteTransaction: financial.deleteTransaction,
  };
}

/**
 * Get transactions for a specific month
 * Pure filter on current state
 */
export function useTransactionsByMonth(
  year: number,
  month: number,
): Transaction[] {
  const financial = useFinancialSystem({ year, month });
  return financial.transactions.filter(
    (t) => t.date >= financial.range.from && t.date <= financial.range.to,
  );
}

/**
 * Get transactions for a specific category
 */
export function useTransactionsByCategory(categoryId: string): Transaction[] {
  const financial = useFinancialSystem();
  return financial.transactions.filter((t) => t.categoryId === categoryId);
}

/**
 * Get N most recent transactions
 */
export function useRecentTransactions(limit: number = 10): Transaction[] {
  const financial = useFinancialSystem();
  return financial.recentTransactions.slice(0, limit);
}

/**
 * Get transactions within a date range
 */
export function useTransactionsByDateRange(
  from: string,
  to: string,
): Transaction[] {
  const financial = useFinancialSystem();
  return useMemo(
    () => financial.transactions.filter((t) => t.date >= from && t.date <= to),
    [financial.transactions, from, to],
  );
}

/**
 * Get transactions of a specific type (income/expense)
 */
export function useTransactionsByType(
  type: "income" | "expense",
): Transaction[] {
  const financial = useFinancialSystem();
  return financial.transactions.filter((t) => t.type === type);
}

/**
 * Count transactions in a month
 */
export function useTransactionCountForMonth(
  year: number,
  month: number,
): number {
  return useTransactionsByMonth(year, month).length;
}

/**
 * Get total amount for a specific type in a month
 */
export function useMonthlyTotal(
  year: number,
  month: number,
  type: "income" | "expense",
): number {
  return useTransactionsByMonth(year, month)
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}
