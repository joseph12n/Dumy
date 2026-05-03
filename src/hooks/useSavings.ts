/**
 * Custom hook for savings goals interaction.
 * Wraps savingsStore for component consumption.
 */

import { useSavingsStore } from '../store/savingsStore';
import { SavingsGoal } from '../store/types';

/**
 * Primary savings hook — state + actions
 */
export function useSavings() {
  const goals = useSavingsStore((s) => s.goals);
  const isLoading = useSavingsStore((s) => s.isLoading);
  const error = useSavingsStore((s) => s.error);
  const loadGoals = useSavingsStore((s) => s.loadGoals);
  const addGoal = useSavingsStore((s) => s.addGoal);
  const updateGoal = useSavingsStore((s) => s.updateGoal);
  const deleteGoal = useSavingsStore((s) => s.deleteGoal);
  const addContribution = useSavingsStore((s) => s.addContribution);
  const deleteContribution = useSavingsStore((s) => s.deleteContribution);
  const markGoalCompleted = useSavingsStore((s) => s.markGoalCompleted);
  const deleteAllGoals = useSavingsStore((s) => s.deleteAllGoals);
  const loadContributions = useSavingsStore((s) => s.loadContributions);
  const contributions = useSavingsStore((s) => s.contributions);

  const activeGoals = goals.filter((g) => g.isCompleted === 0);
  const completedGoals = goals.filter((g) => g.isCompleted === 1);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const getGoalProgress = (goal: SavingsGoal): number => {
    if (goal.targetAmount <= 0) return 0;
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  return {
    goals,
    activeGoals,
    completedGoals,
    totalSaved,
    isLoading,
    error,
    contributions,
    loadGoals,
    loadContributions,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    deleteContribution,
    markGoalCompleted,
    deleteAllGoals,
    getGoalProgress,
  };
}
