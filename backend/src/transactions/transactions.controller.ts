import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionType,
} from '../types';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(
    @Headers('authorization') authorization: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
    @Query('type') type?: TransactionType,
  ): Promise<Transaction[]> {
    const userId = this.extractUserId(authorization);

    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      category,
      type,
    };

    return this.transactionsService.getTransactions(userId, filters);
  }

  @Get(':id')
  async getTransaction(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ): Promise<Transaction> {
    const userId = this.extractUserId(authorization);
    const transaction = await this.transactionsService.getTransaction(
      id,
      userId,
    );

    if (!transaction) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }

    return transaction;
  }

  @Post()
  async createTransaction(
    @Headers('authorization') authorization: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const userId = this.extractUserId(authorization);
    return this.transactionsService.createTransaction(
      userId,
      createTransactionDto,
    );
  }

  @Put(':id')
  async updateTransaction(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const userId = this.extractUserId(authorization);
    const transaction = await this.transactionsService.updateTransaction(
      id,
      userId,
      updateTransactionDto,
    );

    if (!transaction) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }

    return transaction;
  }

  @Delete(':id')
  async deleteTransaction(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const userId = this.extractUserId(authorization);
    const deleted = await this.transactionsService.deleteTransaction(
      id,
      userId,
    );

    if (!deleted) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Transaction deleted successfully' };
  }

  private extractUserId(authorization: string): string {
    if (!authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const token = authorization.replace('Bearer ', '');
    if (!token.startsWith('user-')) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return token;
  }
}
