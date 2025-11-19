import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { DataModule } from '../data/data.module';

@Module({
  controllers: [TransactionsController],
  imports: [DataModule],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
