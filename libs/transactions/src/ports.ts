import type { Transaction, TransactionFilters } from './types';
import type { CreateTransactionDto, UpdateTransactionDto } from './dtos';

export interface TransactionRepository {
  findMany(userId: string, filters: TransactionFilters): Promise<Transaction[]>;
  findById(id: string, userId: string): Promise<Transaction | null>;
  create(userId: string, dto: CreateTransactionDto): Promise<Transaction>;
  update(id: string, userId: string, dto: UpdateTransactionDto): Promise<Transaction | null>;
  softDelete(id: string, userId: string): Promise<boolean>;
}

export type Goal = {
  id: string;
  userId: string;
  name: string;
  currentAmount: number;
};

export interface GoalRepository {
  findByName(userId: string, name: string): Promise<Goal | null>;
  updateCurrentAmount(goalId: string, userId: string, currentAmount: number): Promise<void>;
}
