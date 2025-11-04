/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
} from '../types';
import {
  getTransactionsByUserId,
  getTransactionById,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../data/transactions.data';
import { getGoalsByUserId, updateGoal } from '../data/goals.data';

@Injectable()
export class TransactionsService {
  async getTransactions(
    userId: string,
    filters: TransactionFilters,
  ): Promise<Transaction[]> {
    let transactions = getTransactionsByUserId(userId);

    // Apply filters
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

    // Sort by date descending
    transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return transactions;
  }

  async getTransaction(
    id: string,
    userId: string,
  ): Promise<Transaction | null> {
    const transaction = getTransactionById(id);
    if (!transaction || transaction.userId !== userId) {
      return null;
    }
    return transaction;
  }

  async createTransaction(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      userId,
      ...createTransactionDto,
      date: new Date(createTransactionDto.date),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return addTransaction(newTransaction);
  }

  async updateTransaction(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction | null> {
    const transaction = getTransactionById(id);
    if (!transaction || transaction.userId !== userId) {
      return null;
    }

    const updates: Partial<Transaction> = {};
    if (updateTransactionDto.type !== undefined)
      updates.type = updateTransactionDto.type;
    if (updateTransactionDto.amount !== undefined)
      updates.amount = updateTransactionDto.amount;
    if (updateTransactionDto.category !== undefined)
      updates.category = updateTransactionDto.category;
    if (updateTransactionDto.description !== undefined)
      updates.description = updateTransactionDto.description;
    if (updateTransactionDto.date !== undefined)
      updates.date = new Date(updateTransactionDto.date);

    return updateTransaction(id, updates) || null;
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const transaction = getTransactionById(id);
    if (!transaction || transaction.userId !== userId) {
      return false;
    }

    // Check if this is a goal contribution transaction
    if (
      transaction.category === 'Ціль' &&
      transaction.description?.startsWith('Внесок у ціль:')
    ) {
      // Extract goal name from description
      const goalName = transaction.description.replace('Внесок у ціль: ', '');

      // Find the goal by name
      const goals = getGoalsByUserId(userId);
      const goal = goals.find((g) => g.name === goalName);

      if (goal) {
        // Decrease the goal's current amount by the transaction amount
        const newCurrentAmount = Math.max(
          0,
          goal.currentAmount - transaction.amount,
        );
        updateGoal(goal.id, { currentAmount: newCurrentAmount });
      }
    }

    return deleteTransaction(id);
  }
}
