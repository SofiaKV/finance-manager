import { Injectable } from '@nestjs/common';
import { Goal, CreateGoalDto, UpdateGoalDto } from '../types';
import { Connection } from './connection.service';
import { GoalEntity } from './types';

@Injectable()
export class GoalDao {
  constructor(private readonly connection: Connection) {}

  mapRowToGoal(row: GoalEntity): Goal {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      targetAmount: Number(row.target_amount),
      currentAmount: Number(row.current_saved),
      deadline: row.target_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getGoalsByUserId(userId: string): Promise<Goal[]> {
    const rows = await this.connection
      .db<GoalEntity>('goals')
      .where({ user_id: userId, deleted_at: null })
      .orderBy('created_at', 'desc');

    return rows.map((row) => this.mapRowToGoal(row));
  }

  async getGoalByIdAndUserId(id: string, userId: string): Promise<Goal | null> {
    const row = await this.connection
      .db<GoalEntity>('goals')
      .where({ id, user_id: userId, deleted_at: null })
      .first();

    return row ? this.mapRowToGoal(row) : null;
  }

  async addGoal(userId: string, dto: CreateGoalDto): Promise<Goal> {
    const now = new Date();

    const [row] = await this.connection
      .db<GoalEntity>('goals')
      .insert({
        user_id: userId,
        name: dto.name,

        target_amount: dto.targetAmount,
        current_saved: 0,

        target_date: dto.deadline ?? null,

        start_date: now,
        status: 'in_progress',
      })
      .returning('*');

    return this.mapRowToGoal(row);
  }

  async updateGoal(
    id: string,
    userId: string,
    dto: UpdateGoalDto,
  ): Promise<Goal | null> {
    const patch: Partial<GoalEntity> = {};

    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.targetAmount !== undefined) patch.target_amount = dto.targetAmount;
    if (dto.currentAmount !== undefined)
      patch.current_saved = dto.currentAmount;
    if (dto.deadline !== undefined) patch.target_date = dto.deadline;

    if (Object.keys(patch).length === 0) {
      const row = await this.connection
        .db<GoalEntity>('goals')
        .where({ id, user_id: userId, deleted_at: null })
        .first();
      return row ? this.mapRowToGoal(row) : null;
    }

    patch.updated_at = new Date();

    const [row] = await this.connection
      .db<GoalEntity>('goals')
      .where({ id, user_id: userId, deleted_at: null })
      .update(patch)
      .returning('*');

    return row ? this.mapRowToGoal(row) : null;
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    const affected = await this.connection
      .db<GoalEntity>('goals')
      .where({ id, user_id: userId, deleted_at: null })
      .update({ deleted_at: new Date() });

    return affected > 0;
  }
}
