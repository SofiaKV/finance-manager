import { Inject, Injectable } from '@nestjs/common';
import type {
  OnTransactionDeletedPolicy,
  Transaction,
  GoalRepository,
} from '@fm/transactions';
import { GOAL_REPO } from '@fm/transactions';

@Injectable()
export class GoalContributionOnDeletePolicy
  implements OnTransactionDeletedPolicy
{
  constructor(@Inject(GOAL_REPO) private readonly goals: GoalRepository) {}

  async onDeleted(tx: Transaction): Promise<void> {
    if (tx.category !== 'Ціль') return;
    if (!tx.description?.startsWith('Внесок у ціль:')) return;

    const goalName = tx.description.replace('Внесок у ціль: ', '');
    const goal = await this.goals.findByName(tx.userId, goalName);
    if (!goal) return;

    const newAmount = Math.max(0, goal.currentAmount - tx.amount);
    await this.goals.updateCurrentAmount(goal.id, tx.userId, newAmount);
  }
}
