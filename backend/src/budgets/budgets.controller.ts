import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { Budget, CreateBudgetDto, UpdateBudgetDto } from '../types';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  async getBudgets(
    @Headers('authorization') authorization: string,
  ): Promise<Budget[]> {
    const userId = this.extractUserId(authorization);
    return this.budgetsService.getBudgets(userId);
  }

  @Get(':id')
  async getBudget(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ): Promise<Budget> {
    const userId = this.extractUserId(authorization);
    const budget = await this.budgetsService.getBudget(id, userId);

    if (!budget) {
      throw new HttpException('Budget not found', HttpStatus.NOT_FOUND);
    }

    return budget;
  }

  @Post()
  async createBudget(
    @Headers('authorization') authorization: string,
    @Body() createBudgetDto: CreateBudgetDto,
  ): Promise<Budget> {
    const userId = this.extractUserId(authorization);
    return this.budgetsService.createBudget(userId, createBudgetDto);
  }

  @Put(':id')
  async updateBudget(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ): Promise<Budget> {
    const userId = this.extractUserId(authorization);
    const budget = await this.budgetsService.updateBudget(
      id,
      userId,
      updateBudgetDto,
    );

    if (!budget) {
      throw new HttpException('Budget not found', HttpStatus.NOT_FOUND);
    }

    return budget;
  }

  @Delete(':id')
  async deleteBudget(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const userId = this.extractUserId(authorization);
    const deleted = await this.budgetsService.deleteBudget(id, userId);

    if (!deleted) {
      throw new HttpException('Budget not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Budget deleted successfully' };
  }

  private extractUserId(authorization: string): string {
    if (!authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const token = authorization.replace('Bearer ', '');
    if (!token) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return token;
  }
}
