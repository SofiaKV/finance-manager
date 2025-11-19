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
import { GoalsService } from './goals.service';
import { Goal, CreateGoalDto, UpdateGoalDto } from '../types';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  async getGoals(
    @Headers('authorization') authorization: string,
  ): Promise<Goal[]> {
    const userId = this.extractUserId(authorization);
    return this.goalsService.getGoals(userId);
  }

  @Get(':id')
  async getGoal(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ): Promise<Goal> {
    const userId = this.extractUserId(authorization);
    const goal = await this.goalsService.getGoal(id, userId);

    if (!goal) {
      throw new HttpException('Goal not found', HttpStatus.NOT_FOUND);
    }

    return goal;
  }

  @Post()
  async createGoal(
    @Headers('authorization') authorization: string,
    @Body() createGoalDto: CreateGoalDto,
  ): Promise<Goal> {
    const userId = this.extractUserId(authorization);
    return this.goalsService.createGoal(userId, createGoalDto);
  }

  @Put(':id')
  async updateGoal(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ): Promise<Goal> {
    const userId = this.extractUserId(authorization);
    const goal = await this.goalsService.updateGoal(id, userId, updateGoalDto);

    if (!goal) {
      throw new HttpException('Goal not found', HttpStatus.NOT_FOUND);
    }

    return goal;
  }

  @Delete(':id')
  async deleteGoal(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const userId = this.extractUserId(authorization);
    const deleted = await this.goalsService.deleteGoal(id, userId);

    if (!deleted) {
      throw new HttpException('Goal not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Goal deleted successfully' };
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
