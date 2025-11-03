import {
  Controller,
  Get,
  Query,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  DashboardSummary,
  CategorySummary,
  PeriodSummary,
  TransactionType,
} from '../types';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  async getDashboard(
    @Headers('authorization') authorization: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<DashboardSummary> {
    const userId = this.extractUserId(authorization);

    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.reportsService.getDashboard(userId, filters);
  }

  @Get('by-category')
  async getByCategory(
    @Headers('authorization') authorization: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: TransactionType,
  ): Promise<CategorySummary[]> {
    const userId = this.extractUserId(authorization);

    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type,
    };

    return this.reportsService.getByCategory(userId, filters);
  }

  @Get('by-period')
  async getByPeriod(
    @Headers('authorization') authorization: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'month',
  ): Promise<PeriodSummary[]> {
    const userId = this.extractUserId(authorization);

    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.reportsService.getByPeriod(userId, filters, groupBy);
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
