import { Injectable } from '@nestjs/common';
import {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
} from '../types';
import { TransactionDao } from '../data/transactions.data';
import { GoalDao } from '../data/goals.data';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly goalDao: GoalDao,
    private readonly transactionDao: TransactionDao,
  ) {}

  async getTransactions(
    userId: string,
    filters: TransactionFilters,
  ): Promise<Transaction[]> {
    let transactions =
      await this.transactionDao.getTransactionsByUserId(userId);

    if (filters.startDate) {
      transactions = transactions.filter(
        (txn) => new Date(txn.date) >= filters.startDate!,
      );
    }

    if (filters.endDate) {
      transactions = transactions.filter(
        (txn) => new Date(txn.date) <= filters.endDate!,
      );
    }

    if (filters.category) {
      transactions = transactions.filter(
        (txn) => txn.category === filters.category,
      );
    }

    if (filters.type) {
      transactions = transactions.filter((txn) => txn.type === filters.type);
    }

    return transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  async getTransaction(
    id: string,
    userId: string,
  ): Promise<Transaction | null> {
    return this.transactionDao.getTransactionById(id, userId);
  }

  async createTransaction(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return await this.transactionDao.addTransaction(
      userId,
      createTransactionDto,
    );
  }

  async updateTransaction(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction | null> {
    const existing = await this.transactionDao.getTransactionById(id, userId);
    if (!existing) {
      return null;
    }

    const updated = await this.transactionDao.updateTransaction(
      id,
      userId,
      updateTransactionDto,
    );
    return updated ?? null;
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const transaction = await this.transactionDao.getTransactionById(
      id,
      userId,
    );
    if (!transaction) {
      return false;
    }

    if (
      transaction.category === 'Ціль' &&
      transaction.description?.startsWith('Внесок у ціль:')
    ) {
      const goalName = transaction.description.replace('Внесок у ціль: ', '');

      const goals = await this.goalDao.getGoalsByUserId(userId);
      const goal = goals.find((g) => g.name === goalName);

      if (goal) {
        const newCurrentAmount = Math.max(
          0,
          goal.currentAmount - transaction.amount,
        );

        await this.goalDao.updateGoal(goal.id, userId, {
          currentAmount: newCurrentAmount,
        });
      }
    }

    return await this.transactionDao.deleteTransaction(id, userId);
  }
}
