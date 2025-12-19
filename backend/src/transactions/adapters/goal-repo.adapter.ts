import { Injectable } from '@nestjs/common';
import type { GoalRepository, Goal } from '@fm/transactions';
import { GoalDao } from '../../data/goals.data';

@Injectable()
export class GoalRepoFromGoalDao implements GoalRepository {
  constructor(private readonly goalDao: GoalDao) {}

  async findByName(userId: string, name: string): Promise<Goal | null> {
    const goals = await this.goalDao.getGoalsByUserId(userId);
    const g = goals.find((x) => x.name === name);
    if (!g) return null;

    return {
      id: g.id,
      userId: g.userId,
      name: g.name,
      currentAmount: g.currentAmount,
    };
  }

  async updateCurrentAmount(
    goalId: string,
    userId: string,
    currentAmount: number,
  ): Promise<void> {
    await this.goalDao.updateGoal(goalId, userId, { currentAmount });
  }
}
