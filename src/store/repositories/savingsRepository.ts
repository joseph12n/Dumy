/**
 * Savings Repository — CRUD for savings_goals and savings_contributions
 * Pure SQL operations, no business logic
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import {
  SavingsGoal,
  SavingsContribution,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  CreateSavingsContributionInput,
} from '../types';
import { generateId } from '../../utils/uuid';

/* ------------------------------------------------------------------ */
/*  Row mappers                                                       */
/* ------------------------------------------------------------------ */

interface GoalRow {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string;
  color: string;
  is_completed: number;
  created_at: string;
  updated_at: string;
}

interface ContributionRow {
  id: string;
  goal_id: string;
  amount: number;
  note: string;
  created_at: string;
}

function mapGoalRow(row: GoalRow): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    deadline: row.deadline,
    icon: row.icon,
    color: row.color,
    isCompleted: row.is_completed as 0 | 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapContributionRow(row: ContributionRow): SavingsContribution {
  return {
    id: row.id,
    goalId: row.goal_id,
    amount: row.amount,
    note: row.note,
    createdAt: row.created_at,
  };
}

/* ------------------------------------------------------------------ */
/*  Goals CRUD                                                        */
/* ------------------------------------------------------------------ */

async function getAllGoals(db: SQLiteDatabase): Promise<SavingsGoal[]> {
  const rows = await db.getAllAsync<GoalRow>(
    `SELECT * FROM savings_goals ORDER BY is_completed ASC, created_at DESC`,
  );
  return rows.map(mapGoalRow);
}

async function getActiveGoals(db: SQLiteDatabase): Promise<SavingsGoal[]> {
  const rows = await db.getAllAsync<GoalRow>(
    `SELECT * FROM savings_goals WHERE is_completed = 0 ORDER BY created_at DESC`,
  );
  return rows.map(mapGoalRow);
}

async function getCompletedGoals(db: SQLiteDatabase): Promise<SavingsGoal[]> {
  const rows = await db.getAllAsync<GoalRow>(
    `SELECT * FROM savings_goals WHERE is_completed = 1 ORDER BY updated_at DESC`,
  );
  return rows.map(mapGoalRow);
}

async function insertGoal(
  db: SQLiteDatabase,
  input: CreateSavingsGoalInput,
): Promise<SavingsGoal> {
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO savings_goals (id, name, target_amount, current_amount, deadline, icon, color, is_completed, created_at, updated_at)
     VALUES (?, ?, ?, 0, ?, ?, ?, 0, ?, ?)`,
    [
      id,
      input.name,
      input.targetAmount,
      input.deadline ?? null,
      input.icon,
      input.color,
      now,
      now,
    ],
  );

  return {
    id,
    name: input.name,
    targetAmount: input.targetAmount,
    currentAmount: 0,
    deadline: input.deadline ?? null,
    icon: input.icon,
    color: input.color,
    isCompleted: 0,
    createdAt: now,
    updatedAt: now,
  };
}

async function updateGoal(
  db: SQLiteDatabase,
  input: UpdateSavingsGoalInput,
): Promise<SavingsGoal | null> {
  const now = new Date().toISOString();
  const fields: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [now];

  if (input.name !== undefined) {
    fields.push('name = ?');
    values.push(input.name);
  }
  if (input.targetAmount !== undefined) {
    fields.push('target_amount = ?');
    values.push(input.targetAmount);
  }
  if (input.deadline !== undefined) {
    fields.push('deadline = ?');
    values.push(input.deadline);
  }
  if (input.icon !== undefined) {
    fields.push('icon = ?');
    values.push(input.icon);
  }
  if (input.color !== undefined) {
    fields.push('color = ?');
    values.push(input.color);
  }

  values.push(input.id);
  await db.runAsync(
    `UPDATE savings_goals SET ${fields.join(', ')} WHERE id = ?`,
    values,
  );

  const row = await db.getFirstAsync<GoalRow>(
    `SELECT * FROM savings_goals WHERE id = ?`,
    [input.id],
  );
  return row ? mapGoalRow(row) : null;
}

async function markGoalCompleted(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE savings_goals SET is_completed = 1, updated_at = ? WHERE id = ?`,
    [now, id],
  );
}

async function deleteGoal(db: SQLiteDatabase, id: string): Promise<void> {
  // Contributions cascade-delete via FK
  await db.runAsync(`DELETE FROM savings_goals WHERE id = ?`, [id]);
}

/* ------------------------------------------------------------------ */
/*  Contributions CRUD                                                */
/* ------------------------------------------------------------------ */

async function getContributionsForGoal(
  db: SQLiteDatabase,
  goalId: string,
): Promise<SavingsContribution[]> {
  const rows = await db.getAllAsync<ContributionRow>(
    `SELECT * FROM savings_contributions WHERE goal_id = ? ORDER BY created_at DESC`,
    [goalId],
  );
  return rows.map(mapContributionRow);
}

async function insertContribution(
  db: SQLiteDatabase,
  input: CreateSavingsContributionInput,
): Promise<SavingsContribution> {
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO savings_contributions (id, goal_id, amount, note, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, input.goalId, input.amount, input.note, now],
  );

  // Update goal's current_amount
  await db.runAsync(
    `UPDATE savings_goals
     SET current_amount = current_amount + ?, updated_at = ?
     WHERE id = ?`,
    [input.amount, now, input.goalId],
  );

  return {
    id,
    goalId: input.goalId,
    amount: input.amount,
    note: input.note,
    createdAt: now,
  };
}

async function deleteContribution(
  db: SQLiteDatabase,
  id: string,
  goalId: string,
  amount: number,
): Promise<void> {
  await db.runAsync(`DELETE FROM savings_contributions WHERE id = ?`, [id]);

  // Subtract from goal's current_amount
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE savings_goals
     SET current_amount = MAX(0, current_amount - ?), updated_at = ?
     WHERE id = ?`,
    [amount, now, goalId],
  );
}

async function deleteAllGoals(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(`DELETE FROM savings_contributions`);
  await db.runAsync(`DELETE FROM savings_goals`);
}

export const savingsRepository = {
  getAllGoals,
  getActiveGoals,
  getCompletedGoals,
  insertGoal,
  updateGoal,
  markGoalCompleted,
  deleteGoal,
  getContributionsForGoal,
  insertContribution,
  deleteContribution,
  deleteAllGoals,
};
