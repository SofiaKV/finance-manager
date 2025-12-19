import type { TransactionType } from './types';

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