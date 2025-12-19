import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { DataModule } from 'src/data/data.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  controllers: [BudgetsController],
  imports: [DataModule, TransactionsModule],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
