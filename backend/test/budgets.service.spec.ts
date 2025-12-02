// test/budgets.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsService } from '../src/budgets/budgets.service';
import { BudgetDao } from '../src/data/budgets.data';
import { TransactionDao } from '../src/data/transactions.data';
import {
  TransactionType,
  CreateBudgetDto,
  Budget,
  UpdateBudgetDto,
  Transaction,
} from '../src/types';

describe('BudgetsService', () => {
  let service: BudgetsService;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  const budgetDaoMock: Omit<BudgetDao, 'connection' | 'mapRowToBudget'> = {
    getBudgetsByUserId: jest.fn(),
    getBudgetById: jest.fn(),
    addBudget: jest.fn(),
    updateBudget: jest.fn(),
    deleteBudget: jest.fn(),
  };

  const transactionDaoMock: Omit<
    TransactionDao,
    'connection' | 'mapRowToTransaction'
  > = {
    getTransactionsByUserId: jest.fn(),
    ensureCategoryId: jest.fn(),
    normalizeTransactionType: jest.fn(),
    ensureDefaultAccountId: jest.fn(),
    getTransactionById: jest.fn(),
    addTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        { provide: BudgetDao, useValue: budgetDaoMock },
        { provide: TransactionDao, useValue: transactionDaoMock },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
    jest.clearAllMocks();
  });

  describe('getBudgets', () => {
    it('рахує поле spent на основі транзакцій користувача', async () => {
      const userId = 'user-1';

      const budgets: Budget[] = [
        {
          id: 'b1',
          userId,
          category: 'Food',
          amount: 1000,
          period: 'MONTHLY',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          spent: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const transactions: Transaction[] = [
        {
          id: 't1',
          userId,
          type: TransactionType.EXPENSE,
          category: 'Food',
          amount: 200,
          date: new Date('2025-01-10'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },

        {
          id: 't2',
          userId,
          type: TransactionType.EXPENSE,
          category: 'Transport',
          amount: 300,
          date: new Date('2025-01-10'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },

        {
          id: 't3',
          userId,
          type: TransactionType.EXPENSE,
          category: 'Food',
          amount: 100,
          date: new Date('2024-12-31'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },

        {
          id: 't4',
          userId,
          type: TransactionType.INCOME,
          category: 'Food',
          amount: 500,
          date: new Date('2025-01-15'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },
      ];

      jest
        .spyOn(budgetDaoMock, 'getBudgetsByUserId')
        .mockResolvedValueOnce(budgets);
      jest
        .spyOn(transactionDaoMock, 'getTransactionsByUserId')
        .mockResolvedValueOnce(transactions);

      const result = await service.getBudgets(userId);

      expect(budgetDaoMock.getBudgetsByUserId).toHaveBeenCalledWith(userId);
      expect(transactionDaoMock.getTransactionsByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result[0].spent).toBe(200);
    });

    it('включає транзакції на межах періоду і виключає до startDate та після endDate', async () => {
      const userId = 'user-1';

      const budgets: Budget[] = [
        {
          id: 'b1',
          userId,
          category: 'Food',
          amount: 1000,
          period: 'MONTHLY',
          startDate: new Date('2025-01-10'),
          endDate: new Date('2025-01-20'),
          spent: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const transactions: Transaction[] = [
        // == startDate
        {
          id: 't1',
          userId,
          type: TransactionType.EXPENSE,
          category: 'Food',
          amount: 10,
          date: new Date('2025-01-10'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },
        // == endDate
        {
          id: 't2',
          userId,
          type: TransactionType.EXPENSE,
          category: 'Food',
          amount: 20,
          date: new Date('2025-01-20'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },
        // < startDate
        {
          id: 't3',
          userId,
          type: TransactionType.EXPENSE,
          category: 'Food',
          amount: 999,
          date: new Date('2025-01-09'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },

        {
          id: 't4',
          userId,
          type: TransactionType.EXPENSE,
          category: 'Food',
          amount: 999,
          date: new Date('2025-01-21'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },
      ];

      jest
        .spyOn(budgetDaoMock, 'getBudgetsByUserId')
        .mockResolvedValueOnce(budgets);
      jest
        .spyOn(transactionDaoMock, 'getTransactionsByUserId')
        .mockResolvedValueOnce(transactions);

      const result = await service.getBudgets(userId);

      expect(result[0].spent).toBe(30);
    });
  });

  describe('getBudget', () => {
    it('повертає бюджет з розрахованим spent, якщо userId співпадає', async () => {
      const userId = 'user-1';

      const budget: Budget = {
        id: 'b1',
        userId,
        category: 'Food',
        amount: 1000,
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(budgetDaoMock, 'getBudgetById').mockResolvedValueOnce(budget);
      jest
        .spyOn(transactionDaoMock, 'getTransactionsByUserId')
        .mockResolvedValue([
          {
            id: 't1',
            userId,
            type: TransactionType.EXPENSE,
            category: 'Food',
            amount: 150,
            date: new Date('2025-01-05'),
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            description: 'Description',
          },
        ]);

      const result = await service.getBudget('b1', userId);

      expect(result).not.toBeNull();
      expect(result!.id).toBe('b1');
      expect(result!.spent).toBe(150);
    });

    it('фільтрує транзакції за типом, категорією та діапазоном дат', async () => {
      const userId = 'user-1';

      const budget: Budget = {
        id: 'b1',
        userId,
        category: 'Food',
        amount: 1000,
        period: 'MONTHLY',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-20'),
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(budgetDaoMock, 'getBudgetById').mockResolvedValueOnce(budget);

      const txs: Transaction[] = [
        {
          id: 't1',
          userId,
          type: TransactionType.EXPENSE,
          category: 'Food',
          amount: 10,
          date: new Date('2025-01-15'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },

        {
          id: 't2',
          userId,
          type: TransactionType.INCOME,
          category: 'Food',
          amount: 1000,
          date: new Date('2025-01-15'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },

        {
          id: 't3',
          userId,
          type: TransactionType.EXPENSE,
          category: 'Transport',
          amount: 1000,
          date: new Date('2025-01-15'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },

        {
          id: 't4',
          userId,
          type: TransactionType.EXPENSE,
          category: 'Food',
          amount: 1000,
          date: new Date('2025-01-09'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },

        {
          id: 't5',
          userId,
          type: TransactionType.EXPENSE,
          category: 'Food',
          amount: 1000,
          date: new Date('2025-01-21'),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          description: 'Description',
        },
      ];

      jest
        .spyOn(transactionDaoMock, 'getTransactionsByUserId')
        .mockResolvedValueOnce(txs);

      const result = await service.getBudget('b1', userId);

      expect(result).not.toBeNull();
      expect(result!.spent).toBe(10);
    });

    it('коректно рахує spent з урахуванням меж періоду', async () => {
      const userId = 'user-1';

      const budget: Budget = {
        id: 'b1',
        userId,
        category: 'Food',
        amount: 1000,
        period: 'MONTHLY',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-20'),
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(budgetDaoMock, 'getBudgetById').mockResolvedValueOnce(budget);
      jest
        .spyOn(transactionDaoMock, 'getTransactionsByUserId')
        .mockResolvedValue([
          {
            id: 't1',
            userId,
            type: TransactionType.EXPENSE,
            category: 'Food',
            amount: 10,
            date: new Date('2025-01-10'),
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            description: 'Description',
          },
          {
            id: 't2',
            userId,
            type: TransactionType.EXPENSE,
            category: 'Food',
            amount: 20,
            date: new Date('2025-01-20'),
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            description: 'Description',
          },
          {
            id: 't3',
            userId,
            type: TransactionType.EXPENSE,
            category: 'Food',
            amount: 999,
            date: new Date('2025-01-09'),
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            description: 'Description',
          },
          {
            id: 't4',
            userId,
            type: TransactionType.EXPENSE,
            category: 'Food',
            amount: 999,
            date: new Date('2025-01-21'),
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            description: 'Description',
          },
        ]);

      const result = await service.getBudget('b1', userId);

      expect(result).not.toBeNull();
      expect(result!.spent).toBe(30);
    });

    it('повертає undefined, якщо бюджет не існує або не належить користувачу', async () => {
      jest
        .spyOn(budgetDaoMock, 'getBudgetById')
        .mockResolvedValueOnce(undefined);

      const r1 = await service.getBudget('b1', 'user-1');
      expect(r1).toBeNull();

      jest.spyOn(budgetDaoMock, 'getBudgetById').mockResolvedValueOnce({
        id: 'b1',
        userId: 'other-user',
      } as Budget);

      const r2 = await service.getBudget('b1', 'user-1');
      expect(r2).toBeNull();
    });
  });

  describe('createBudget', () => {
    it('створює новий бюджет з правильними полями та викликає addBudget', async () => {
      const userId = 'user-1';

      const dto: CreateBudgetDto = {
        category: 'Food',
        amount: 500,
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      };

      const addBudgetMock = jest
        .spyOn(budgetDaoMock, 'addBudget')
        .mockResolvedValueOnce({
          ...dto,
          id: '123',
          spent: 42,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const result = await service.createBudget(userId, dto);

      expect(budgetDaoMock.addBudget).toHaveBeenCalledTimes(1);
      const saved = addBudgetMock.mock.calls[0][0];

      expect(saved.userId).toBe(userId);
      expect(saved.category).toBe(dto.category);
      expect(saved.amount).toBe(dto.amount);
      expect(saved.startDate instanceof Date).toBe(true);
      expect(saved.endDate instanceof Date).toBe(true);

      expect(typeof saved.id).toBe('string');
      expect(saved.id).toMatch(/^budget-\d+$/);

      expect(result).toMatchObject({
        userId,
        category: dto.category,
        amount: dto.amount,
      });
    });
  });

  describe('updateBudget', () => {
    it('повертає null, якщо бюджет не існує або не належить користувачу', async () => {
      jest
        .spyOn(budgetDaoMock, 'getBudgetById')
        .mockResolvedValueOnce(undefined);

      const r1 = await service.updateBudget('b1', 'user-1', { amount: 200 });
      expect(r1).toBeNull();
      expect(budgetDaoMock.updateBudget).not.toHaveBeenCalled();

      jest.spyOn(budgetDaoMock, 'getBudgetById').mockResolvedValueOnce({
        id: 'b1',
        userId: 'other-user',
      } as Budget);

      const r2 = await service.updateBudget('b1', 'user-1', { amount: 200 });
      expect(r2).toBeNull();
      expect(budgetDaoMock.updateBudget).not.toHaveBeenCalled();
    });

    it('оновлює бюджет і повертає результат, якщо userId співпадає', async () => {
      const budget = {
        id: 'b1',
        userId: 'user-1',
        amount: 100,
      } as Budget;

      jest.spyOn(budgetDaoMock, 'getBudgetById').mockResolvedValueOnce(budget);

      const updatedBudget = { ...budget, amount: 999 };
      jest
        .spyOn(budgetDaoMock, 'updateBudget')
        .mockResolvedValueOnce(updatedBudget);

      const dto: UpdateBudgetDto = { amount: 999 };
      const result = await service.updateBudget('b1', 'user-1', dto);

      expect(budgetDaoMock.updateBudget).toHaveBeenCalledWith(
        'b1',
        expect.objectContaining(dto),
      );
      expect(result).toEqual(updatedBudget);
    });

    it('оновлює тільки поля, які явно передані, й ігнорує undefined', async () => {
      const existingBudget: Budget = {
        id: 'b1',
        userId: 'user-1',
        category: 'Old',
        amount: 100,
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(budgetDaoMock, 'getBudgetById')
        .mockResolvedValueOnce(existingBudget);

      const dto: UpdateBudgetDto = {
        category: 'New',
        amount: undefined,
        period: 'YEARLY',
        startDate: undefined,
        endDate: new Date('2025-02-01'),
      };

      const updated: Budget = {
        ...existingBudget,
        category: 'New',
        period: 'YEARLY',
        endDate: new Date('2025-02-01'),
      };

      const updateBudgetMock = jest
        .spyOn(budgetDaoMock, 'updateBudget')
        .mockResolvedValueOnce(updated);

      const result = await service.updateBudget('b1', 'user-1', dto);

      expect(budgetDaoMock.updateBudget).toHaveBeenCalledTimes(1);
      const updatesArg = updateBudgetMock.mock.calls[0][1];

      expect(updatesArg.category).toBe('New');
      expect(updatesArg.period).toBe('YEARLY');
      expect(updatesArg.endDate).toEqual(dto.endDate);

      expect(updatesArg).not.toHaveProperty('amount');
      expect(updatesArg).not.toHaveProperty('startDate');

      expect(result).toEqual(updated);
    });

    it('не оновлює period, якщо DTO.period === undefined', async () => {
      const existingBudget: Budget = {
        id: 'b1',
        userId: 'user-1',
        category: 'Food',
        amount: 100,
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(budgetDaoMock, 'getBudgetById')
        .mockResolvedValueOnce(existingBudget);

      const dto: UpdateBudgetDto = {
        period: undefined,
      };

      const updated: Budget = { ...existingBudget };
      const updateBudgetMock = jest
        .spyOn(budgetDaoMock, 'updateBudget')
        .mockResolvedValueOnce(updated);

      const result = await service.updateBudget('b1', 'user-1', dto);

      const updatesArg = updateBudgetMock.mock.calls[0][1];

      expect(updatesArg).not.toHaveProperty('period');
      expect(result!.period).toBe(existingBudget.period);
    });

    it('не оновлює category, якщо DTO.category === undefined', async () => {
      const existingBudget: Budget = {
        id: 'b1',
        userId: 'user-1',
        category: 'Food',
        amount: 100,
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(budgetDaoMock, 'getBudgetById')
        .mockResolvedValueOnce(existingBudget);

      const dto: UpdateBudgetDto = {
        category: undefined,
      };

      const updated: Budget = { ...existingBudget };
      const updateBudgetMock = jest
        .spyOn(budgetDaoMock, 'updateBudget')
        .mockResolvedValueOnce(updated);

      const result = await service.updateBudget('b1', 'user-1', dto);

      const updatesArg = updateBudgetMock.mock.calls[0][1];

      expect(updatesArg).not.toHaveProperty('category');
      expect(result!.category).toBe(existingBudget.category);
    });

    it('не оновлює endDate, якщо DTO.endDate === undefined', async () => {
      const existingBudget: Budget = {
        id: 'b1',
        userId: 'user-1',
        category: 'Food',
        amount: 100,
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(budgetDaoMock, 'getBudgetById')
        .mockResolvedValueOnce(existingBudget);

      const dto: UpdateBudgetDto = {
        endDate: undefined,
      };

      const updated: Budget = { ...existingBudget };
      const updateBudgetMock = jest
        .spyOn(budgetDaoMock, 'updateBudget')
        .mockResolvedValueOnce(updated);

      const result = await service.updateBudget('b1', 'user-1', dto);

      const updatesArg = updateBudgetMock.mock.calls[0][1];

      expect(updatesArg).not.toHaveProperty('endDate');
      expect(result!.endDate.getTime()).toBe(existingBudget.endDate.getTime());
    });

    it('оновлює дати, якщо вони передані, та зберігає їх як Date', async () => {
      const existingBudget: Budget = {
        id: 'b1',
        userId: 'user-1',
        category: 'Food',
        amount: 100,
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(budgetDaoMock, 'getBudgetById')
        .mockResolvedValueOnce(existingBudget);

      const newStart = new Date('2025-02-01');
      const newEnd = new Date('2025-02-28');

      const dto: UpdateBudgetDto = {
        startDate: newStart,
        endDate: newEnd,
      };

      const updated: Budget = {
        ...existingBudget,
        startDate: newStart,
        endDate: newEnd,
      };

      const updateBudgetMock = jest
        .spyOn(budgetDaoMock, 'updateBudget')
        .mockResolvedValueOnce(updated);

      const result = await service.updateBudget('b1', 'user-1', dto);

      const updatesArg = updateBudgetMock.mock.calls[0][1];

      expect(updatesArg.startDate).toBeInstanceOf(Date);
      expect(updatesArg.endDate).toBeInstanceOf(Date);
      expect(updatesArg.startDate?.getTime()).toBe(newStart.getTime());
      expect(updatesArg.endDate?.getTime()).toBe(newEnd.getTime());

      expect(result).toEqual(updated);
    });
  });

  describe('deleteBudget', () => {
    it('повертає false, якщо бюджет не існує або не належить користувачу', async () => {
      jest
        .spyOn(budgetDaoMock, 'getBudgetById')
        .mockResolvedValueOnce(undefined);

      const r1 = await service.deleteBudget('b1', 'user-1');
      expect(r1).toBe(false);
      expect(budgetDaoMock.deleteBudget).not.toHaveBeenCalled();

      jest.spyOn(budgetDaoMock, 'getBudgetById').mockResolvedValueOnce({
        id: 'b1',
        userId: 'other-user',
      } as Budget);

      const r2 = await service.deleteBudget('b1', 'user-1');
      expect(r2).toBe(false);
      expect(budgetDaoMock.deleteBudget).not.toHaveBeenCalled();
    });

    it('видаляє бюджет та повертає true, якщо userId співпадає', async () => {
      jest.spyOn(budgetDaoMock, 'getBudgetById').mockResolvedValueOnce({
        id: 'b1',
        userId: 'user-1',
      } as Budget);

      const deleteBudgetMock = jest
        .spyOn(budgetDaoMock, 'deleteBudget')
        .mockResolvedValueOnce(true);

      const result = await service.deleteBudget('b1', 'user-1');

      expect(deleteBudgetMock).toHaveBeenCalledWith('b1');
      expect(result).toBe(true);
    });
  });
});
