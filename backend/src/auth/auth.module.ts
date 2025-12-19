import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DataModule } from '../data/data.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  controllers: [AuthController],
  imports: [DataModule, TransactionsModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
