// User types
export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  balance: number;
  createdAt: Date;
}

// Transaction types
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Category types
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
}

// Budget types
export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  startDate: Date;
  endDate: Date;
  spent: number;
  createdAt: Date;
  updatedAt: Date;
}

// Goal types
export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

// DTO types for requests
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
}

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export interface UpdateTransactionDto {
  type?: TransactionType;
  amount?: number;
  category?: string;
  description?: string;
  date?: Date;
}

export interface CreateBudgetDto {
  category: string;
  amount: number;
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  startDate: Date;
  endDate: Date;
}

export interface UpdateBudgetDto {
  category?: string;
  amount?: number;
  period?: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  startDate?: Date;
  endDate?: Date;
}

export interface CreateGoalDto {
  name: string;
  targetAmount: number;
  deadline: Date;
}

export interface UpdateGoalDto {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: Date;
}

// Filter types
export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: TransactionType;
}

// Response types
export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface PeriodSummary {
  period: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionsCount: number;
  byCategory: CategorySummary[];
  recentTransactions: Transaction[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
