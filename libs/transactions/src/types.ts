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

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: TransactionType;
}
