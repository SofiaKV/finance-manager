/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { Goal, CreateGoalDto, UpdateGoalDto } from '../types';
import {
  getGoalsByUserId,
  getGoalById,
  addGoal,
  updateGoal,
  deleteGoal,
} from '../data/goals.data';

@Injectable()
export class GoalsService {
  async getGoals(userId: string): Promise<Goal[]> {
    return getGoalsByUserId(userId);
  }

  async getGoal(id: string, userId: string): Promise<Goal | null> {
    const goal = getGoalById(id);
    if (!goal || goal.userId !== userId) {
      return null;
    }
    return goal;
  }

  async createGoal(
    userId: string,
    createGoalDto: CreateGoalDto,
  ): Promise<Goal> {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      userId,
      ...createGoalDto,
      deadline: new Date(createGoalDto.deadline),
      currentAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return addGoal(newGoal);
  }

  async updateGoal(
    id: string,
    userId: string,
    updateGoalDto: UpdateGoalDto,
  ): Promise<Goal | null> {
    const goal = getGoalById(id);
    if (!goal || goal.userId !== userId) {
      return null;
    }

    const updates: Partial<Goal> = {};
    if (updateGoalDto.name !== undefined) updates.name = updateGoalDto.name;
    if (updateGoalDto.targetAmount !== undefined)
      updates.targetAmount = updateGoalDto.targetAmount;
    if (updateGoalDto.currentAmount !== undefined)
      updates.currentAmount = updateGoalDto.currentAmount;
    if (updateGoalDto.deadline !== undefined)
      updates.deadline = new Date(updateGoalDto.deadline);

    return updateGoal(id, updates) || null;
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    const goal = getGoalById(id);
    if (!goal || goal.userId !== userId) {
      return false;
    }
    return deleteGoal(id);
  }
}
