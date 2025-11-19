import { Injectable } from '@nestjs/common';
import { Category } from '../types';
import { Connection } from './connection.service';
import { CategoryEntity } from './types';
import { mapEntityTransactionTypeToEnum } from './utils';

@Injectable()
export class CategoryDao {
  constructor(private readonly connection: Connection) {}

  mapRowToCategory(row: CategoryEntity): Category {
    return {
      id: row.id,
      name: row.name,
      type: mapEntityTransactionTypeToEnum(row.type),
      icon: row.icon ?? undefined,
    };
  }

  async findAllCategories(): Promise<Category[]> {
    const rows = await this.connection
      .db<CategoryEntity>('categories')
      .select('*');
    return rows.map((row) => this.mapRowToCategory(row));
  }
}
