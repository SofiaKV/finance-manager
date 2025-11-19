import { Injectable } from '@nestjs/common';
import {
  DashboardSummary,
  CategorySummary,
  PeriodSummary,
  TransactionType,
  TransactionFilters,
} from '../types';
import { TransactionDao } from '../data/transactions.data';

@Injectable()
export class ReportsService {
  constructor(private readonly transactionDao: TransactionDao) {}

  async getDashboard(
    userId: string,
    filters: { startDate?: Date; endDate?: Date },
  ): Promise<DashboardSummary> {
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

    const totalIncome = transactions
      .filter((txn) => txn.type === TransactionType.INCOME)
      .reduce((sum, txn) => sum + txn.amount, 0);

    const totalExpenses = transactions
      .filter((txn) => txn.type === TransactionType.EXPENSE)
      .reduce((sum, txn) => sum + txn.amount, 0);

    const balance = totalIncome - totalExpenses;

    const categoryMap = new Map<string, { total: number; count: number }>();
    transactions.forEach((txn) => {
      const existing = categoryMap.get(txn.category) || { total: 0, count: 0 };
      categoryMap.set(txn.category, {
        total: existing.total + txn.amount,
        count: existing.count + 1,
      });
    });

    const byCategory: CategorySummary[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionsCount: transactions.length,
      byCategory,
      recentTransactions,
    };
  }

  async getByCategory(
    userId: string,
    filters: TransactionFilters,
  ): Promise<CategorySummary[]> {
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
    if (filters.type) {
      transactions = transactions.filter((txn) => txn.type === filters.type);
    }

    const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);

    const categoryMap = new Map<string, { total: number; count: number }>();
    transactions.forEach((txn) => {
      const existing = categoryMap.get(txn.category) || { total: 0, count: 0 };
      categoryMap.set(txn.category, {
        total: existing.total + txn.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  async getByPeriod(
    userId: string,
    filters: { startDate?: Date; endDate?: Date },
    groupBy: 'day' | 'week' | 'month',
  ): Promise<PeriodSummary[]> {
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

    const periodMap = new Map<
      string,
      { income: number; expenses: number; balance: number }
    >();

    transactions.forEach((txn) => {
      const period = this.getPeriodKey(new Date(txn.date), groupBy);
      const existing = periodMap.get(period) || {
        income: 0,
        expenses: 0,
        balance: 0,
      };

      if (txn.type === TransactionType.INCOME) {
        existing.income += txn.amount;
        existing.balance += txn.amount;
      } else {
        existing.expenses += txn.amount;
        existing.balance -= txn.amount;
      }

      periodMap.set(period, existing);
    });

    return Array.from(periodMap.entries())
      .map(([period, data]) => ({
        period,
        ...data,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private getPeriodKey(date: Date, groupBy: 'day' | 'week' | 'month'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (groupBy === 'day') {
      return `${year}-${month}-${day}`;
    } else if (groupBy === 'month') {
      return `${year}-${month}`;
    } else {
      const weekNumber = this.getWeekNumber(date);
      return `${year}-W${String(weekNumber).padStart(2, '0')}`;
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
