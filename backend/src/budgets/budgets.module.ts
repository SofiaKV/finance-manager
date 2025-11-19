import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { DataModule } from 'src/data/data.module';

@Module({
  controllers: [BudgetsController],
  imports: [DataModule],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
