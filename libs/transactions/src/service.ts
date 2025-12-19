import type { Transaction, TransactionFilters } from './types';
import type { CreateTransactionDto, UpdateTransactionDto } from './dtos';
import type { TransactionRepository, GoalRepository } from './ports';
import type { OnTransactionDeletedPolicy } from './policies';

export type TransactionsDeps = {
  txRepo: TransactionRepository;
  goalRepo?: GoalRepository;
  onDeletedPolicy?: OnTransactionDeletedPolicy;
};

export class TransactionsService {
  constructor(private readonly deps: TransactionsDeps) {}

  getTransactions(userId: string, filters: TransactionFilters = {}): Promise<Transaction[]> {
    return this.deps.txRepo.findMany(userId, filters);
  }

  getTransaction(id: string, userId: string): Promise<Transaction | null> {
    return this.deps.txRepo.findById(id, userId);
  }

  createTransaction(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    return this.deps.txRepo.create(userId, dto);
  }

  async updateTransaction(id: string, userId: string, dto: UpdateTransactionDto): Promise<Transaction | null> {
    const exists = await this.deps.txRepo.findById(id, userId);
    if (!exists) return null;
    return this.deps.txRepo.update(id, userId, dto);
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const tx = await this.deps.txRepo.findById(id, userId);
    if (!tx) return false;

    if (this.deps.onDeletedPolicy) {
      await this.deps.onDeletedPolicy.onDeleted(tx);
    }

    return this.deps.txRepo.softDelete(id, userId);
  }
}

export function createTransactionsService(deps: TransactionsDeps) {
  return new TransactionsService(deps);
}
