import { TransactionType } from '../../src/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import after mocking
import { apiClient } from '../../src/services/api';

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    // Reset token in apiClient
    apiClient.clearToken();
  });

  describe('Token Management', () => {
    it('should set token and store it in localStorage', () => {
      apiClient.setToken('test-token');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'authToken',
        'test-token',
      );
      expect(apiClient.getToken()).toBe('test-token');
      expect(apiClient.isAuthenticated()).toBe(true);
    });

    it('should clear token from localStorage', () => {
      apiClient.setToken('test-token');
      apiClient.clearToken();

      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(apiClient.getToken()).toBeNull();
      expect(apiClient.isAuthenticated()).toBe(false);
    });

    it('should return false for isAuthenticated when no token', () => {
      expect(apiClient.isAuthenticated()).toBe(false);
    });
  });

  describe('Authentication Methods', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'auth-token-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });
      expect(result).toEqual(mockResponse);
      expect(apiClient.getToken()).toBe('auth-token-123');
    });

    it('should register successfully', async () => {
      const mockResponse = {
        user: { id: '1', email: 'new@example.com', name: 'New User' },
        token: 'new-auth-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        }),
      });
      expect(result).toEqual(mockResponse);
      expect(apiClient.getToken()).toBe('new-auth-token');
    });

    it('should logout and clear token', async () => {
      apiClient.setToken('existing-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.logout();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer existing-token',
        },
        body: JSON.stringify({}),
      });
      expect(apiClient.getToken()).toBeNull();
    });

    it('should get user profile', async () => {
      apiClient.setToken('auth-token');
      const mockProfile = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        balance: 1000,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      });

      const result = await apiClient.getProfile();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/profile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
      expect(result).toEqual(mockProfile);
    });

    it('should update user profile', async () => {
      apiClient.setToken('auth-token');
      const mockProfile = {
        id: '1',
        email: 'updated@example.com',
        name: 'Updated User',
        balance: 1000,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      });

      const result = await apiClient.updateProfile({
        name: 'Updated User',
        email: 'updated@example.com',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
        body: JSON.stringify({
          name: 'Updated User',
          email: 'updated@example.com',
        }),
      });
      expect(result).toEqual(mockProfile);
    });
  });

  describe('Transaction Methods', () => {
    beforeEach(() => {
      apiClient.setToken('auth-token');
    });

    it('should get all transactions', async () => {
      const mockTransactions = [
        { id: '1', type: 'EXPENSE', amount: 100, category: 'Food' },
        { id: '2', type: 'INCOME', amount: 500, category: 'Salary' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactions,
      });

      const result = await apiClient.getTransactions();

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
      expect(result).toEqual(mockTransactions);
    });

    it('should get transactions with filters', async () => {
      const mockTransactions = [
        { id: '1', type: 'EXPENSE', amount: 100, category: 'Food' },
      ];
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactions,
      });

      await apiClient.getTransactions({
        startDate,
        endDate,
        category: 'Food',
        type: TransactionType.EXPENSE,
      });

      // URL encodes colons as %3A
      const expectedUrl = `/api/transactions?startDate=${encodeURIComponent(startDate.toISOString())}&endDate=${encodeURIComponent(endDate.toISOString())}&category=Food&type=EXPENSE`;
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
    });

    it('should get single transaction', async () => {
      const mockTransaction = {
        id: '123',
        type: 'EXPENSE',
        amount: 100,
        category: 'Food',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransaction,
      });

      const result = await apiClient.getTransaction('123');

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions/123', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should create transaction', async () => {
      const newTransaction = {
        type: TransactionType.EXPENSE,
        amount: 100,
        category: 'Food',
        description: 'Lunch',
        date: new Date('2024-01-15'),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', ...newTransaction }),
      });

      const result = await apiClient.createTransaction(newTransaction);

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
        body: JSON.stringify(newTransaction),
      });
      expect(result).toHaveProperty('id');
    });

    it('should update transaction', async () => {
      const updateData = { amount: 150 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', amount: 150 }),
      });

      const result = await apiClient.updateTransaction('1', updateData);

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
        body: JSON.stringify(updateData),
      });
      expect(result.amount).toBe(150);
    });

    it('should delete transaction', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.deleteTransaction('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
        body: JSON.stringify({}),
      });
    });
  });

  describe('Budget Methods', () => {
    beforeEach(() => {
      apiClient.setToken('auth-token');
    });

    it('should get all budgets', async () => {
      const mockBudgets = [
        { id: '1', category: 'Food', amount: 500 },
        { id: '2', category: 'Transport', amount: 200 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBudgets,
      });

      const result = await apiClient.getBudgets();

      expect(mockFetch).toHaveBeenCalledWith('/api/budgets', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
      expect(result).toEqual(mockBudgets);
    });

    it('should get single budget', async () => {
      const mockBudget = { id: '1', category: 'Food', amount: 500 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBudget,
      });

      const result = await apiClient.getBudget('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/budgets/1', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
      expect(result).toEqual(mockBudget);
    });

    it('should create budget', async () => {
      const newBudget = {
        category: 'Food',
        amount: 500,
        period: 'MONTHLY' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', ...newBudget }),
      });

      const result = await apiClient.createBudget(newBudget);

      expect(mockFetch).toHaveBeenCalledWith('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
        body: JSON.stringify(newBudget),
      });
      expect(result).toHaveProperty('id');
    });

    it('should update budget', async () => {
      const updateData = { amount: 600 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', amount: 600 }),
      });

      const result = await apiClient.updateBudget('1', updateData);

      expect(mockFetch).toHaveBeenCalledWith('/api/budgets/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
        body: JSON.stringify(updateData),
      });
      expect(result.amount).toBe(600);
    });

    it('should delete budget', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.deleteBudget('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/budgets/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
        body: JSON.stringify({}),
      });
    });
  });

  describe('Goal Methods', () => {
    beforeEach(() => {
      apiClient.setToken('auth-token');
    });

    it('should get all goals', async () => {
      const mockGoals = [
        { id: '1', name: 'Vacation', targetAmount: 10000 },
        { id: '2', name: 'Car', targetAmount: 50000 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGoals,
      });

      const result = await apiClient.getGoals();

      expect(mockFetch).toHaveBeenCalledWith('/api/goals', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
      expect(result).toEqual(mockGoals);
    });

    it('should get single goal', async () => {
      const mockGoal = { id: '1', name: 'Vacation', targetAmount: 10000 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGoal,
      });

      const result = await apiClient.getGoal('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/goals/1', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
      expect(result).toEqual(mockGoal);
    });

    it('should create goal', async () => {
      const newGoal = {
        name: 'Vacation',
        targetAmount: 10000,
        deadline: new Date('2024-12-31'),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', ...newGoal }),
      });

      const result = await apiClient.createGoal(newGoal);

      expect(mockFetch).toHaveBeenCalledWith('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
        body: JSON.stringify(newGoal),
      });
      expect(result).toHaveProperty('id');
    });

    it('should update goal', async () => {
      const updateData = { currentAmount: 5000 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', currentAmount: 5000 }),
      });

      const result = await apiClient.updateGoal('1', updateData);

      expect(mockFetch).toHaveBeenCalledWith('/api/goals/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
        body: JSON.stringify(updateData),
      });
      expect(result.currentAmount).toBe(5000);
    });

    it('should delete goal', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.deleteGoal('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/goals/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
        body: JSON.stringify({}),
      });
    });
  });

  describe('Report Methods', () => {
    beforeEach(() => {
      apiClient.setToken('auth-token');
    });

    it('should get dashboard summary', async () => {
      const mockDashboard = {
        totalIncome: 10000,
        totalExpenses: 5000,
        balance: 5000,
        transactionsCount: 25,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboard,
      });

      const result = await apiClient.getDashboard();

      expect(mockFetch).toHaveBeenCalledWith('/api/reports/dashboard', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
      expect(result).toEqual(mockDashboard);
    });

    it('should get dashboard with date filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.getDashboard({ startDate, endDate });

      // URL encodes colons as %3A
      const expectedUrl = `/api/reports/dashboard?startDate=${encodeURIComponent(startDate.toISOString())}&endDate=${encodeURIComponent(endDate.toISOString())}`;
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
    });

    it('should get category summary', async () => {
      const mockCategories = [
        { category: 'Food', total: 1000, count: 10 },
        { category: 'Transport', total: 500, count: 5 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      });

      const result = await apiClient.getByCategory();

      expect(mockFetch).toHaveBeenCalledWith('/api/reports/by-category', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should get period summary', async () => {
      const mockPeriods = [
        { period: '2024-01', income: 5000, expenses: 3000 },
        { period: '2024-02', income: 6000, expenses: 4000 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPeriods,
      });

      const result = await apiClient.getByPeriod({}, 'month');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/reports/by-period?groupBy=month',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer auth-token',
          },
        },
      );
      expect(result).toEqual(mockPeriods);
    });
  });

  describe('Categories', () => {
    it('should get categories', async () => {
      apiClient.setToken('auth-token');
      const mockCategories = [
        { id: '1', name: 'Food', type: 'EXPENSE' },
        { id: '2', name: 'Salary', type: 'INCOME' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      });

      const result = await apiClient.getCategories();

      expect(mockFetch).toHaveBeenCalledWith('/api/categories', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer auth-token',
        },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('Error Handling', () => {
    it('should throw error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(
        apiClient.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow('Unauthorized');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        apiClient.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow('Network error');
    });

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(
        apiClient.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow('An error occurred');
    });
  });
});
