/**
 * Custom hooks for transaction management
 * Wraps transactionStore for component consumption
 */

import { useTransactionStore } from '../store/transactionStore';
import { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../store/types';
import { useEffect } from 'react';

/**
 * Get all transactions with CRUD operations
 */
export function useTransactions() {
  const transactions = useTransactionStore((s) => s.transactions);
  const isLoading = useTransactionStore((s) => s.isLoading);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
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
  const transactions = useTransactionStore((s) => s.transactions);

  return transactions.filter((t) => {
    const date = new Date(t.date + 'T00:00:00Z');
    return (
      date.getFullYear() === year &&
      date.getMonth() + 1 === month
    );
  });
}

/**
 * Get transactions for a specific category
 */
export function useTransactionsByCategory(
  categoryId: string,
): Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);
  return transactions.filter((t) => t.categoryId === categoryId);
}

/**
 * Get N most recent transactions
 */
export function useRecentTransactions(limit: number = 10): Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);
  return transactions.slice(0, limit);
}

/**
 * Get transactions within a date range
 */
export function useTransactionsByDateRange(
  from: string,
  to: string,
): Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);
  return transactions.filter(
    (t) => t.date >= from && t.date <= to,
  );
}

/**
 * Get transactions of a specific type (income/expense)
 */
export function useTransactionsByType(
  type: 'income' | 'expense',
): Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);
  return transactions.filter((t) => t.type === type);
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
  type: 'income' | 'expense',
): number {
  return useTransactionsByMonth(year, month)
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}
