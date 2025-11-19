import { Injectable } from '@nestjs/common';
import {
  Budget,
  CreateBudgetDto,
  UpdateBudgetDto,
  TransactionType,
} from '../types';
import { BudgetDao } from '../data/budgets.data';
import { TransactionDao } from '../data/transactions.data';

@Injectable()
export class BudgetsService {
  constructor(
    private readonly budgetDao: BudgetDao,
    private readonly transactionDao: TransactionDao,
  ) {}

  async getBudgets(userId: string): Promise<Budget[]> {
    const budgets = await this.budgetDao.getBudgetsByUserId(userId); 
    const transactions =
      await this.transactionDao.getTransactionsByUserId(userId); 

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
    const budget = await this.budgetDao.getBudgetById(id); 
    if (!budget || budget.userId !== userId) {
      return null;
    }

    const transactions =
      await this.transactionDao.getTransactionsByUserId(userId); 
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

    return await this.budgetDao.addBudget(newBudget); 
  }

  async updateBudget(
    id: string,
    userId: string,
    updateBudgetDto: UpdateBudgetDto,
  ): Promise<Budget | null> {
    const budget = await this.budgetDao.getBudgetById(id); 
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

    const updated = await this.budgetDao.updateBudget(id, updates); 
    return updated ?? null;
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    const budget = await this.budgetDao.getBudgetById(id); 
    if (!budget || budget.userId !== userId) {
      return false;
    }
    return await this.budgetDao.deleteBudget(id); 
  }
}
