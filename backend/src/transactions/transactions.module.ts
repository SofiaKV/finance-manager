import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { DataModule } from '../data/data.module';

import {
  TransactionsService,
  createTransactionsService,
  TX_REPO,
  GOAL_REPO,
} from '@fm/transactions';

import { GoalContributionOnDeletePolicy } from './policies/goal-contribution.policy';
import { TransactionRepositoryAdapter } from './adapters/transactions-repo.adapter';
import { GoalRepoFromGoalDao } from './adapters/goal-repo.adapter';

@Module({
  controllers: [TransactionsController],
  imports: [DataModule],
  providers: [
    TransactionRepositoryAdapter,
    GoalRepoFromGoalDao,
    GoalContributionOnDeletePolicy,

    { provide: TX_REPO, useExisting: TransactionRepositoryAdapter },
    { provide: GOAL_REPO, useExisting: GoalRepoFromGoalDao },

    {
      provide: TransactionsService,
      useFactory: (
        txRepo: TransactionRepositoryAdapter,
        goalRepo: GoalRepoFromGoalDao,
        policy: GoalContributionOnDeletePolicy,
      ) =>
        createTransactionsService({
          txRepo,
          goalRepo,
          onDeletedPolicy: policy,
        }),
      inject: [
        TransactionRepositoryAdapter,
        GoalRepoFromGoalDao,
        GoalContributionOnDeletePolicy,
      ],
    },
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
