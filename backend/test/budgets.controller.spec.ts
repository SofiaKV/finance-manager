// test/budgets.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsController } from '../src/budgets/budgets.controller';
import { BudgetsService } from '../src/budgets/budgets.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateBudgetDto } from 'src/types';

describe('BudgetsController', () => {
  let controller: BudgetsController;

  const serviceMock = {
    getBudgets: jest.fn(),
    getBudget: jest.fn(),
    createBudget: jest.fn(),
    updateBudget: jest.fn(),
    deleteBudget: jest.fn(),
  };

  const authHeader = 'Bearer user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetsController],
      providers: [
        {
          provide: BudgetsService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<BudgetsController>(BudgetsController);
    jest.clearAllMocks();
  });

  it('getBudgets передає userId в сервіс', async () => {
    serviceMock.getBudgets.mockResolvedValue([]);

    const result = await controller.getBudgets(authHeader);

    expect(serviceMock.getBudgets).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([]);
  });

  it('getBudget кидає 404, якщо бюджет не знайдений', async () => {
    serviceMock.getBudget.mockResolvedValue(null);

    await expect(controller.getBudget(authHeader, 'b1')).rejects.toThrow(
      new HttpException('Budget not found', HttpStatus.NOT_FOUND),
    );
  });

  it('getBudget повертає бюджет, якщо сервіс його повертає', async () => {
    const budget = { id: 'b1', userId: 'user-1' };
    serviceMock.getBudget.mockResolvedValue(budget);

    const result = await controller.getBudget(authHeader, 'b1');

    expect(serviceMock.getBudget).toHaveBeenCalledWith('b1', 'user-1');
    expect(result).toEqual(budget);
  });

  it('createBudget викликає сервіс з правильним userId та DTO', async () => {
    const dto: CreateBudgetDto = {
      category: 'Food',
      amount: 100,
      period: 'MONTHLY',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
    };
    const created = { id: 'b1', userId: 'user-1', ...dto };
    serviceMock.createBudget.mockResolvedValue(created);

    const result = await controller.createBudget(authHeader, dto);

    expect(serviceMock.createBudget).toHaveBeenCalledWith('user-1', dto);
    expect(result).toEqual(created);
  });

  it('updateBudget кидає 404, якщо сервіс повертає null', async () => {
    serviceMock.updateBudget.mockResolvedValue(null);

    await expect(
      controller.updateBudget(authHeader, 'b1', { amount: 200 }),
    ).rejects.toThrow(
      new HttpException('Budget not found', HttpStatus.NOT_FOUND),
    );
  });

  it('updateBudget повертає оновлений бюджет', async () => {
    const updated = { id: 'b1', userId: 'user-1', amount: 200 };
    serviceMock.updateBudget.mockResolvedValue(updated);

    const result = await controller.updateBudget(authHeader, 'b1', {
      amount: 200,
    });

    expect(serviceMock.updateBudget).toHaveBeenCalledWith(
      'b1',
      'user-1',
      expect.objectContaining({ amount: 200 }),
    );
    expect(result).toEqual(updated);
  });

  it('deleteBudget повертає повідомлення при успішному видаленні', async () => {
    serviceMock.deleteBudget.mockResolvedValue(true);

    const result = await controller.deleteBudget(authHeader, 'b1');

    expect(serviceMock.deleteBudget).toHaveBeenCalledWith('b1', 'user-1');
    expect(result).toEqual({ message: 'Budget deleted successfully' });
  });

  it('deleteBudget кидає 404, якщо бюджет не знайдений', async () => {
    serviceMock.deleteBudget.mockResolvedValue(false);

    await expect(controller.deleteBudget(authHeader, 'b1')).rejects.toThrow(
      new HttpException('Budget not found', HttpStatus.NOT_FOUND),
    );
  });

  it('кидає 401, якщо немає заголовка Authorization', async () => {
    await expect(controller.getBudgets('')).rejects.toThrow(
      new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED),
    );
  });

  it('кидає 401, якщо токен некоректний', async () => {
    await expect(controller.getBudgets('Bearer ')).rejects.toThrow(
      new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
    );
  });
});
