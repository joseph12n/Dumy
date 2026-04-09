// Domain Types - Single source of truth for all data types
// All amounts are in COP (Colombian Pesos) as integers - no fractional parts

export type TransactionType = 'income' | 'expense';
export type BudgetPeriod = 'monthly' | 'weekly';
export type ChatRole = 'user' | 'assistant';
export type ThemeType = 'light' | 'dark' | 'system';

// ========== TRANSACTIONS ==========
export interface Transaction {
  id: string;
  amount: number; // COP pesos (integer)
  description: string;
  categoryId: string;
  date: string; // ISO 8601 date: 'YYYY-MM-DD'
  type: TransactionType;
  receiptImagePath: string | null;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

export type CreateTransactionInput = Omit<
  Transaction,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateTransactionInput = Partial<CreateTransactionInput> & {
  id: string;
};

// ========== CATEGORIES ==========
export interface Category {
  id: string;
  name: string;
  icon: string; // Icon name for Expo Vector Icons
  color: string; // Hex color code
  isDefault: 0 | 1; // SQLite boolean
  budgetLimit: number | null; // COP pesos or null if no limit
}

export type CreateCategoryInput = Omit<Category, 'id' | 'isDefault'>;

export type UpdateCategoryInput = Partial<CreateCategoryInput> & {
  id: string;
};

// ========== BUDGETS ==========
export interface Budget {
  id: string;
  categoryId: string;
  limitAmount: number; // COP pesos
  period: BudgetPeriod;
  createdAt: string; // ISO 8601 timestamp
}

export type CreateBudgetInput = Omit<Budget, 'id' | 'createdAt'>;

export type UpdateBudgetInput = Partial<Omit<Budget, 'id' | 'createdAt'>> & {
  id: string;
};

// ========== CHAT MESSAGES ==========
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string; // ISO 8601 timestamp
  sessionId: string;
}

export type CreateChatMessageInput = Omit<ChatMessage, 'id' | 'createdAt'>;

// ========== USER SETTINGS ==========
export interface UserSetting {
  key: string;
  value: string;
}

// ========== STATISTICS ==========
export interface PeriodStats {
  totalIncome: number; // COP pesos
  totalExpense: number; // COP pesos
  balance: number; // COP pesos
  transactionCount: number;
  period: {
    from: string; // ISO date
    to: string; // ISO date
  };
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalSpent: number; // COP pesos
  percentage: number; // 0-100
  transactionCount: number;
}

export interface TrendData {
  weekOverWeek: number; // percentage change: +12.5 means 12.5% increase
  monthOverMonth: number; // percentage change
  dailyAverageThisMonth: number; // COP pesos
  projectedMonthTotal: number; // COP pesos
}

export interface BudgetStatus {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  limitAmount: number; // COP pesos
  spent: number; // COP pesos
  remaining: number; // COP pesos
  percentageUsed: number; // 0-100
  isOverBudget: boolean;
  period: BudgetPeriod;
}

// ========== DATABASE QUERIES / AGGREGATES ==========
export interface CategorySpend {
  categoryId: string;
  total: number; // COP pesos
}

export interface DailySummary {
  date: string; // ISO date
  income: number; // COP pesos
  expense: number; // COP pesos
  balance: number; // COP pesos
}

// ========== FINANCIAL CONTEXT FOR AI ==========
export interface FinancialContext {
  currentMonthSummary: {
    totalIncome: number; // COP pesos
    totalExpense: number; // COP pesos
    balance: number; // COP pesos
    topCategories: Array<{
      name: string;
      amount: number; // COP pesos
      percentage: number; // 0-100
    }>;
  };
  recentTransactions: Array<{
    description: string;
    amount: number; // COP pesos
    type: TransactionType;
    categoryName: string;
    date: string; // ISO date
  }>;
  budgetAlerts: Array<{
    categoryName: string;
    percentageUsed: number; // 0-100
    isOverBudget: boolean;
  }>;
  userName?: string;
}
