import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { DataModule } from '../data/data.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  controllers: [ReportsController],
  imports: [DataModule, TransactionsModule],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
