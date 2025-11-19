import { Injectable } from '@nestjs/common';
import {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionType,
} from '../types';
import { Connection } from './connection.service';
import { AccountEntity, CategoryEntity, TransactionEntity } from './types';
import { mapEntityTransactionTypeToEnum } from './utils';

type TransactionEntityWithCategory = TransactionEntity & {
  category_name: string;
};

@Injectable()
export class TransactionDao {
  constructor(private readonly connection: Connection) {}

  mapRowToTransaction(row: TransactionEntityWithCategory): Transaction {
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

  async ensureCategoryId(categoryName: string): Promise<string | null> {
    if (!categoryName) return null;

    const existing = await this.connection
      .db<CategoryEntity>('categories')
      .where({ name: categoryName })
      .first('id');

    if (existing) {
      return existing.id;
    }

    return null;
  }

  async ensureDefaultAccountId(userId: string): Promise<string> {
    const existing = await this.connection
      .db<AccountEntity>('accounts')
      .where({ user_id: userId, deleted_at: null })
      .orderBy('created_at', 'asc')
      .first('id');

    if (existing) return existing.id;

    const [row] = await this.connection
      .db<AccountEntity>('accounts')
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
      .returning('id');

    return row.id;
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    const rows = await this.connection
      .db('transactions as t')
      .leftJoin('categories as c', 't.category_id', 'c.id')
      .select<
        TransactionEntityWithCategory[]
      >('t.id', 't.user_id', 't.amount', 't.type', 't.date', 't.description', 't.created_at', 't.updated_at', this.connection.db.raw('c.name as category_name'))
      .where('t.user_id', userId)
      .whereNull('t.deleted_at')
      .orderBy('t.date', 'desc');

    return rows.map((row) => this.mapRowToTransaction(row));
  }

  async getTransactionById(
    id: string,
    userId: string,
  ): Promise<Transaction | null> {
    const row = await this.connection
      .db('transactions as t')
      .leftJoin('categories as c', 't.category_id', 'c.id')
      .select('t.*', this.connection.db.raw('c.name as category_name'))
      .where('t.id', id)
      .andWhere('t.user_id', userId)
      .whereNull('t.deleted_at')
      .first<TransactionEntityWithCategory>();

    return row ? this.mapRowToTransaction(row) : null;
  }

  async addTransaction(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    const accountId = await this.ensureDefaultAccountId(userId);
    const categoryId = await this.ensureCategoryId(dto.category);

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

    const row = await this.connection
      .db('transactions as t')
      .leftJoin('categories as c', 't.category_id', 'c.id')
      .select('t.*', this.connection.db.raw('c.name as category_name'))
      .where('t.id', inserted.id)
      .first<TransactionEntityWithCategory>();

    return this.mapRowToTransaction(row);
  }

  async updateTransaction(
    id: string,
    userId: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction | null> {
    const patch: Partial<TransactionEntity> = {};

    if (dto.amount !== undefined) patch.amount = dto.amount;
    if (dto.type !== undefined)
      patch.type = this.normalizeTransactionType(dto.type);
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.date !== undefined) patch.date = dto.date;

    if (dto.category !== undefined) {
      patch.category_id = await this.ensureCategoryId(dto.category);
    }

    if (Object.keys(patch).length === 0) {
      return this.getTransactionById(id, userId);
    }

    patch.updated_at = new Date();

    const [updated] = await this.connection
      .db<TransactionEntity>('transactions')
      .where({ id, user_id: userId, deleted_at: null })
      .update(patch)
      .returning('*');

    if (!updated) return null;

    const row = await this.connection
      .db('transactions as t')
      .leftJoin('categories as c', 't.category_id', 'c.id')
      .select('t.*', this.connection.db.raw('c.name as category_name'))
      .where('t.id', updated.id)
      .first<TransactionEntityWithCategory>();

    return row ? this.mapRowToTransaction(row) : null;
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const affected = await this.connection
      .db<TransactionEntity>('transactions')
      .where({ id, user_id: userId, deleted_at: null })
      .update({ deleted_at: new Date() });

    return affected > 0;
  }
}
