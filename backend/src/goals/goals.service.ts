import { Injectable } from '@nestjs/common';
import { Goal, CreateGoalDto, UpdateGoalDto } from '../types';
import { GoalDao } from '../data/goals.data';

@Injectable()
export class GoalsService {
  constructor(private readonly goalDao: GoalDao) {}
  async getGoals(userId: string): Promise<Goal[]> {
    return await this.goalDao.getGoalsByUserId(userId);
  }

  async getGoal(id: string, userId: string): Promise<Goal | null> {
    return await this.goalDao.getGoalByIdAndUserId(id, userId);
  }

  async createGoal(
    userId: string,
    createGoalDto: CreateGoalDto,
  ): Promise<Goal> {
    return await this.goalDao.addGoal(userId, createGoalDto);
  }

  async updateGoal(
    id: string,
    userId: string,
    updateGoalDto: UpdateGoalDto,
  ): Promise<Goal | null> {
    return await this.goalDao.updateGoal(id, userId, updateGoalDto);
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    return await this.goalDao.deleteGoal(id, userId);
  }
}
