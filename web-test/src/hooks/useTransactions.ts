import { useTransactionStore } from '../store/transactionStore';
import { Transaction } from '../store/types';

export function useTransactions() {
  const transactions = useTransactionStore((s) => s.transactions);
  const isLoading = useTransactionStore((s) => s.isLoading);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  return { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction };
}

function useTransactionsByMonth(year: number, month: number): Transaction[] {
  const transactions = useTransactionStore((s) => s.transactions);
  return transactions.filter((t) => {
    const d = new Date(t.date + 'T00:00:00Z');
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

export function useTransactionCountForMonth(year: number, month: number): number {
  return useTransactionsByMonth(year, month).length;
}

export function useMonthlyTotal(year: number, month: number, type: 'income' | 'expense'): number {
  return useTransactionsByMonth(year, month)
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}
