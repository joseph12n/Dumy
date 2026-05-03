import { create } from 'zustand';
import {
  SavingsGoal,
  SavingsContribution,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  CreateSavingsContributionInput,
} from './types';
import { getDatabase } from './database';
import { savingsRepository } from './repositories/savingsRepository';

interface SavingsState {
  goals: SavingsGoal[];
  contributions: Map<string, SavingsContribution[]>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadGoals: () => Promise<void>;
  loadContributions: (goalId: string) => Promise<void>;
  addGoal: (input: CreateSavingsGoalInput) => Promise<SavingsGoal>;
  updateGoal: (input: UpdateSavingsGoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (input: CreateSavingsContributionInput) => Promise<SavingsContribution>;
  deleteContribution: (id: string, goalId: string, amount: number) => Promise<void>;
  markGoalCompleted: (id: string) => Promise<void>;
  deleteAllGoals: () => Promise<void>;

  // Selectors
  getGoalById: (id: string) => SavingsGoal | undefined;
  getActiveGoals: () => SavingsGoal[];
  getCompletedGoals: () => SavingsGoal[];
  getTotalSaved: () => number;
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  goals: [],
  contributions: new Map(),
  isLoading: false,
  error: null,

  loadGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDatabase();
      const goals = await savingsRepository.getAllGoals(db);
      set({ goals, isLoading: false });
      console.log(`[SavingsStore] Loaded ${goals.length} goals`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      console.error('[SavingsStore] Error loading goals:', error);
    }
  },

  loadContributions: async (goalId) => {
    try {
      const db = await getDatabase();
      const contribs = await savingsRepository.getContributionsForGoal(db, goalId);
      set((state) => {
        const newMap = new Map(state.contributions);
        newMap.set(goalId, contribs);
        return { contributions: newMap };
      });
    } catch (error) {
      console.error('[SavingsStore] Error loading contributions:', error);
    }
  },

  addGoal: async (input) => {
    try {
      const db = await getDatabase();
      const goal = await savingsRepository.insertGoal(db, input);
      set((state) => ({ goals: [goal, ...state.goals] }));
      console.log('[SavingsStore] Goal added:', goal.id);
      return goal;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[SavingsStore] Error adding goal:', error);
      throw error;
    }
  },

  updateGoal: async (input) => {
    try {
      const db = await getDatabase();
      const updated = await savingsRepository.updateGoal(db, input);
      if (updated) {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === input.id ? updated : g)),
        }));
        console.log('[SavingsStore] Goal updated:', input.id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[SavingsStore] Error updating goal:', error);
      throw error;
    }
  },

  deleteGoal: async (id) => {
    try {
      const db = await getDatabase();
      await savingsRepository.deleteGoal(db, id);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
      }));
      console.log('[SavingsStore] Goal deleted:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[SavingsStore] Error deleting goal:', error);
      throw error;
    }
  },

  addContribution: async (input) => {
    try {
      const db = await getDatabase();
      const contribution = await savingsRepository.insertContribution(db, input);

      // Update the goal's currentAmount in local state
      set((state) => ({
        goals: state.goals.map((g) => {
          if (g.id === input.goalId) {
            const newAmount = g.currentAmount + input.amount;
            return {
              ...g,
              currentAmount: newAmount,
              isCompleted: newAmount >= g.targetAmount ? 1 as const : g.isCompleted,
              updatedAt: new Date().toISOString(),
            };
          }
          return g;
        }),
      }));

      // Check if goal is completed
      const goal = get().goals.find((g) => g.id === input.goalId);
      if (goal && goal.currentAmount >= goal.targetAmount && goal.isCompleted === 0) {
        await savingsRepository.markGoalCompleted(db, input.goalId);
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === input.goalId ? { ...g, isCompleted: 1 as const } : g,
          ),
        }));
      }

      console.log('[SavingsStore] Contribution added:', contribution.id);
      return contribution;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[SavingsStore] Error adding contribution:', error);
      throw error;
    }
  },

  deleteContribution: async (id, goalId, amount) => {
    try {
      const db = await getDatabase();
      await savingsRepository.deleteContribution(db, id, goalId, amount);

      // Update local state
      set((state) => ({
        goals: state.goals.map((g) => {
          if (g.id === goalId) {
            return {
              ...g,
              currentAmount: Math.max(0, g.currentAmount - amount),
              updatedAt: new Date().toISOString(),
            };
          }
          return g;
        }),
      }));

      console.log('[SavingsStore] Contribution deleted:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[SavingsStore] Error deleting contribution:', error);
      throw error;
    }
  },

  markGoalCompleted: async (id) => {
    try {
      const db = await getDatabase();
      await savingsRepository.markGoalCompleted(db, id);
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, isCompleted: 1 as const, updatedAt: new Date().toISOString() } : g,
        ),
      }));
      console.log('[SavingsStore] Goal completed:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[SavingsStore] Error marking goal completed:', error);
      throw error;
    }
  },

  deleteAllGoals: async () => {
    try {
      const db = await getDatabase();
      await savingsRepository.deleteAllGoals(db);
      set({ goals: [], contributions: new Map() });
      console.log('[SavingsStore] All goals deleted');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      console.error('[SavingsStore] Error deleting all goals:', error);
      throw error;
    }
  },

  getGoalById: (id) => get().goals.find((g) => g.id === id),
  getActiveGoals: () => get().goals.filter((g) => g.isCompleted === 0),
  getCompletedGoals: () => get().goals.filter((g) => g.isCompleted === 1),
  getTotalSaved: () => get().goals.reduce((sum, g) => sum + g.currentAmount, 0),
}));
