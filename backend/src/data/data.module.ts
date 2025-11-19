import { Module } from '@nestjs/common';
import { Connection } from './connection.service';
import { BudgetDao } from './budgets.data';
import { GoalDao } from './goals.data';
import { TransactionDao } from './transactions.data';
import { UserDao } from './users.data';
import { ConfigModule } from '@nestjs/config';
import { CategoryDao } from './categories.data';

@Module({
  controllers: [],
  imports: [ConfigModule],
  providers: [
    Connection,
    BudgetDao,
    GoalDao,
    TransactionDao,
    UserDao,
    CategoryDao,
  ],
  exports: [BudgetDao, GoalDao, TransactionDao, UserDao, CategoryDao],
})
export class DataModule {}
