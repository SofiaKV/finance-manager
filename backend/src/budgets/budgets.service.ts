/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import {
  Budget,
  CreateBudgetDto,
  UpdateBudgetDto,
  TransactionType,
} from '../types';
import {
  getBudgetsByUserId,
  getBudgetById,
  addBudget,
  updateBudget,
  deleteBudget,
} from '../data/budgets.data';
import { getTransactionsByUserId } from '../data/transactions.data';

@Injectable()
export class BudgetsService {
  async getBudgets(userId: string): Promise<Budget[]> {
    const budgets = getBudgetsByUserId(userId);
    const transactions = getTransactionsByUserId(userId);

    // Calculate spent amount for each budget
    return budgets.map((budget) => {
      const spent = transactions
        .filter(
          (txn) =>
            txn.type === TransactionType.EXPENSE &&
            txn.category === budget.category &&
            new Date(txn.date) >= new Date(budget.startDate) &&
            new Date(txn.date) <= new Date(budget.endDate),
        )
        .reduce((sum, txn) => sum + txn.amount, 0);

      return { ...budget, spent };
    });
  }

  async getBudget(id: string, userId: string): Promise<Budget | null> {
    const budget = getBudgetById(id);
    if (!budget || budget.userId !== userId) {
      return null;
    }

    // Calculate spent amount
    const transactions = getTransactionsByUserId(userId);
    const spent = transactions
      .filter(
        (txn) =>
          txn.type === TransactionType.EXPENSE &&
          txn.category === budget.category &&
          new Date(txn.date) >= new Date(budget.startDate) &&
          new Date(txn.date) <= new Date(budget.endDate),
      )
      .reduce((sum, txn) => sum + txn.amount, 0);

    return { ...budget, spent };
  }

  async createBudget(
    userId: string,
    createBudgetDto: CreateBudgetDto,
  ): Promise<Budget> {
    const newBudget: Budget = {
      id: `budget-${Date.now()}`,
      userId,
      ...createBudgetDto,
      startDate: new Date(createBudgetDto.startDate),
      endDate: new Date(createBudgetDto.endDate),
      spent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return addBudget(newBudget);
  }

  async updateBudget(
    id: string,
    userId: string,
    updateBudgetDto: UpdateBudgetDto,
  ): Promise<Budget | null> {
    const budget = getBudgetById(id);
    if (!budget || budget.userId !== userId) {
      return null;
    }

    const updates: Partial<Budget> = {};
    if (updateBudgetDto.category !== undefined)
      updates.category = updateBudgetDto.category;
    if (updateBudgetDto.amount !== undefined)
      updates.amount = updateBudgetDto.amount;
    if (updateBudgetDto.period !== undefined)
      updates.period = updateBudgetDto.period;
    if (updateBudgetDto.startDate !== undefined)
      updates.startDate = new Date(updateBudgetDto.startDate);
    if (updateBudgetDto.endDate !== undefined)
      updates.endDate = new Date(updateBudgetDto.endDate);

    return updateBudget(id, updates) || null;
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    const budget = getBudgetById(id);
    if (!budget || budget.userId !== userId) {
      return false;
    }
    return deleteBudget(id);
  }
}
