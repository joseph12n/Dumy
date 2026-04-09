import { create } from 'zustand';
import { Transaction, CreateTransactionInput, UpdateTransactionInput } from './types';
import { getDatabase } from './database';
import { transactionRepository } from './repositories/transactionRepository';
import { useStatsStore } from './statsStore';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTransactions: () => Promise<void>;
  addTransaction: (input: CreateTransactionInput) => Promise<Transaction>;
  updateTransaction: (input: UpdateTransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  loadTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      const transactions = await transactionRepository.getAll(db);
      set({ transactions, isLoading: false });
      console.log(`[TransactionStore] Loaded ${transactions.length} transactions`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      console.error('[TransactionStore] Error loading transactions:', error);
    }
  },

  addTransaction: async (input) => {
    try {
      const db = await getDatabase();
      const transaction = await transactionRepository.insert(db, input);

      // Optimistic update
      set((state) => ({
        transactions: [transaction, ...state.transactions],
      }));

      // Invalidate stats cache
      useStatsStore.getState().invalidate();

      console.log('[TransactionStore] Transaction added:', transaction.id);
      return transaction;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[TransactionStore] Error adding transaction:', error);
      throw error;
    }
  },

  updateTransaction: async (input) => {
    try {
      const db = await getDatabase();
      const updated = await transactionRepository.update(db, input);

      if (updated) {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === input.id ? updated : t,
          ),
        }));

        // Invalidate stats cache
        useStatsStore.getState().invalidate();

        console.log('[TransactionStore] Transaction updated:', input.id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[TransactionStore] Error updating transaction:', error);
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      const db = await getDatabase();
      await transactionRepository.delete(db, id);

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));

      // Invalidate stats cache
      useStatsStore.getState().invalidate();

      console.log('[TransactionStore] Transaction deleted:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[TransactionStore] Error deleting transaction:', error);
      throw error;
    }
  },
}));
