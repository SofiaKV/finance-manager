import { Injectable } from '@nestjs/common';
import type {
  TransactionRepository,
  Transaction,
  TransactionFilters,
  TransactionType,
  CreateTransactionDto,
  UpdateTransactionDto,
} from '@fm/transactions';
import { Connection } from '../../data/connection.service';
import {
  AccountEntity,
  CategoryEntity,
  TransactionEntity,
} from '../../data/types';
import { mapEntityTransactionTypeToEnum } from '../../data/utils';

type TransactionEntityWithCategory = TransactionEntity & {
  category_name: string;
};

@Injectable()
export class TransactionRepositoryAdapter implements TransactionRepository {
  constructor(private readonly connection: Connection) {}

  private mapRow(row: TransactionEntityWithCategory): Transaction {
    return {
      id: row.id,
      userId: row.user_id,
      amount: Number(row.amount),
      type: mapEntityTransactionTypeToEnum(row.type),
      category: row.category_name ?? undefined,
      description: row.description ?? undefined,
      date: row.date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  normalizeTransactionType(
    type: TransactionType | undefined,
  ): 'income' | 'expense' | 'transfer' {
    if (!type) {
      return 'expense';
    }

    const t = String(type).toLowerCase();

    if (t === 'income' || t === 'expense' || t === 'transfer') {
      return t;
    }

    throw new Error(`Unsupported transaction type: ${type}`);
  }

  private async findCategoryId(name?: string): Promise<string | null> {
    if (!name) return null;
    const row = await this.connection
      .db<CategoryEntity>('categories')
      .where({ name })
      .first('id');
    return row?.id ?? null;
  }

  private async ensureDefaultAccountId(userId: string): Promise<string> {
    const existing = await this.connection
      .db<AccountEntity>('accounts')
      .where({ user_id: userId, deleted_at: null })
      .orderBy('created_at', 'asc')
      .first('id');

    if (existing) return existing.id;

    const [row] = await this.connection
      .db('accounts')
      .insert({
        user_id: userId,
        name: 'Основний рахунок',
        currency: 'UAH',
        initial_balance: 0,
        balance: 0,
        account_type: 'cash',
        is_active: true,
        icon: null,
        sort_order: 0,
      })
      .returning<AccountEntity[]>('id');

    return row.id;
  }

  async findMany(
    userId: string,
    filters: TransactionFilters = {},
  ): Promise<Transaction[]> {
    const q = this.connection
      .db('transactions as t')
      .leftJoin('categories as c', 't.category_id', 'c.id')
      .select<
        TransactionEntityWithCategory[]
      >('t.id', 't.user_id', 't.amount', 't.type', 't.date', 't.description', 't.created_at', 't.updated_at', this.connection.db.raw('c.name as category_name'))
      .where('t.user_id', userId)
      .whereNull('t.deleted_at');

    if (filters.startDate)
      q.andWhere('t.date', '>=', filters.startDate.toISOString());
    if (filters.endDate)
      q.andWhere('t.date', '<=', filters.endDate.toISOString());
    if (filters.type)
      q.andWhere('t.type', this.normalizeTransactionType(filters.type));
    if (filters.category) q.andWhere('c.name', filters.category);

    const rows = await q.orderBy('t.date', 'desc');
    return rows.map((r) => this.mapRow(r));
  }

  async findById(id: string, userId: string): Promise<Transaction | null> {
    const row = await this.connection
      .db('transactions as t')
      .leftJoin('categories as c', 't.category_id', 'c.id')
      .select<TransactionEntityWithCategory>(
        't.*',
        this.connection.db.raw('c.name as category_name'),
      )
      .where('t.id', id)
      .andWhere('t.user_id', userId)
      .whereNull('t.deleted_at')
      .first();

    return row ? this.mapRow(row) : null;
  }

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    const accountId = await this.ensureDefaultAccountId(userId);
    const categoryId = await this.findCategoryId(dto.category);

    const [inserted] = await this.connection
      .db<TransactionEntity>('transactions')
      .insert({
        user_id: userId,
        account_id: accountId,
        category_id: categoryId,
        amount: dto.amount,
        type: this.normalizeTransactionType(dto.type),
        description: dto.description ?? null,
        date: dto.date,
      })
      .returning('*');

    return (await this.findById(inserted.id, userId))!;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction | null> {
    const patch: Partial<TransactionEntity> = {};

    if (dto.amount !== undefined) patch.amount = dto.amount;
    if (dto.type !== undefined)
      patch.type = this.normalizeTransactionType(dto.type);
    if (dto.description !== undefined)
      patch.description = dto.description ?? null;
    if (dto.date !== undefined) patch.date = dto.date;

    if (dto.category !== undefined) {
      patch.category_id = await this.findCategoryId(dto.category);
    }

    if (Object.keys(patch).length === 0) {
      return this.findById(id, userId);
    }

    patch.updated_at = new Date();

    const [updated] = await this.connection
      .db<TransactionEntity>('transactions')
      .where({ id, user_id: userId, deleted_at: null })
      .update(patch)
      .returning('*');

    if (!updated) return null;
    return this.findById(updated.id, userId);
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const affected = await this.connection
      .db<TransactionEntity>('transactions')
      .where({ id, user_id: userId, deleted_at: null })
      .update({ deleted_at: new Date() });

    return affected > 0;
  }
}
