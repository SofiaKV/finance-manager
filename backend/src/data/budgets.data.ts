import { Injectable } from '@nestjs/common';
import { Budget } from '../types';
import { Connection } from './connection.service';
import { BudgetEntity } from './types';

type BudgetEntityWithSpent = BudgetEntity & { spent: number };

@Injectable()
export class BudgetDao {
  constructor(private readonly connection: Connection) {}

  mapRowToBudget(row: BudgetEntityWithSpent): Budget {
    return {
      id: row.id,
      userId: row.user_id,
      category: row.name,
      amount: Number(row.amount),
      period: (row.period_type ?? 'monthly').toUpperCase() as Budget['period'],
      startDate: row.start_date,
      endDate: row.end_date ?? row.start_date,
      spent: Number(row.spent ?? 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getBudgetsByUserId(userId: string): Promise<Budget[]> {
    const rows = await this.connection
      .db('budgets as b')
      .leftJoin('budget_usage as u', 'u.budget_id', 'b.id')
      .select(
        'b.id',
        'b.user_id',
        'b.name',
        'b.amount',
        'b.period_type',
        'b.start_date',
        'b.end_date',
        'b.created_at',
        'b.updated_at',
      )
      .sum({ spent: 'u.spent_amount' })
      .where('b.user_id', userId)
      .groupBy<
        BudgetEntityWithSpent[]
      >('b.id', 'b.user_id', 'b.name', 'b.amount', 'b.period_type', 'b.start_date', 'b.end_date', 'b.created_at', 'b.updated_at');

    return rows.map((row) => this.mapRowToBudget(row));
  }

  async getBudgetById(id: string): Promise<Budget | undefined> {
    const row = await this.connection
      .db('budgets as b')
      .leftJoin('budget_usage as u', 'u.budget_id', 'b.id')
      .select(
        'b.id',
        'b.user_id',
        'b.name',
        'b.amount',
        'b.period_type',
        'b.start_date',
        'b.end_date',
        'b.created_at',
        'b.updated_at',
      )
      .sum({ spent: 'u.spent_amount' })
      .where('b.id', id)
      .groupBy<
        BudgetEntityWithSpent[]
      >('b.id', 'b.user_id', 'b.name', 'b.amount', 'b.period_type', 'b.start_date', 'b.end_date', 'b.created_at', 'b.updated_at')
      .first();

    return row ? this.mapRowToBudget(row) : undefined;
  }

  async addBudget(budget: Budget): Promise<Budget> {
    const period_type = budget.period.toLowerCase();
    const [inserted] = await this.connection
      .db<BudgetEntity>('budgets')
      .insert({
        user_id: budget.userId,
        name: budget.category,
        amount: budget.amount,
        period_type,
        start_date: budget.startDate,
        end_date: budget.endDate,
        is_active: true,
        alert_threshold: 100,
      })
      .returning('*');

    return this.mapRowToBudget({ ...inserted, spent: 0 });
  }

  async updateBudget(
    id: string,
    updates: Partial<Budget>,
  ): Promise<Budget | undefined> {
    const patch: Partial<BudgetEntity> = {};

    if (updates.category !== undefined) patch.name = updates.category;
    if (updates.amount !== undefined) patch.amount = updates.amount;
    if (updates.period !== undefined) {
      patch.period_type = updates.period.toLowerCase();
    }
    if (updates.startDate !== undefined) patch.start_date = updates.startDate;
    if (updates.endDate !== undefined) patch.end_date = updates.endDate;

    patch.updated_at = new Date();

    const [updated] = await this.connection
      .db<BudgetEntity>('budgets')
      .where({ id })
      .update(patch)
      .returning('*');

    if (!updated) return undefined;

    const usage = await this.connection
      .db('budget_usage')
      .where({ budget_id: id })
      .sum<{ spent: string }>('spent_amount as spent')
      .first<{ spent: number }>();

    return this.mapRowToBudget({ ...updated, spent: usage?.spent ?? 0 });
  }

  async deleteBudget(id: string): Promise<boolean> {
    const deleted = await this.connection.db('budgets').where({ id }).del();
    return deleted > 0;
  }
}
