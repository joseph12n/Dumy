export type TransactionType = 'income' | 'expense';
export type BudgetPeriod = 'monthly' | 'weekly';
export type ChatRole = 'user' | 'assistant';
export type ThemeType = 'light' | 'dark' | 'system';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  type: TransactionType;
  receiptImagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateTransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTransactionInput = Partial<CreateTransactionInput> & { id: string };

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: 0 | 1;
  budgetLimit: number | null;
}

export type CreateCategoryInput = Omit<Category, 'id' | 'isDefault'>;

export interface Budget {
  id: string;
  categoryId: string;
  limitAmount: number;
  period: BudgetPeriod;
  createdAt: string;
}

export type CreateBudgetInput = Omit<Budget, 'id' | 'createdAt'>;

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  sessionId: string;
}

export interface PeriodStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  period: { from: string; to: string };
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalSpent: number;
  percentage: number;
  transactionCount: number;
}

export interface TrendData {
  weekOverWeek: number;
  monthOverMonth: number;
  dailyAverageThisMonth: number;
  projectedMonthTotal: number;
}

export interface BudgetStatus {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  limitAmount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  period: BudgetPeriod;
}
