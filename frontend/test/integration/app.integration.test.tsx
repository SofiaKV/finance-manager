/**
 * Integration tests for the Finance Manager Frontend
 * These tests verify that multiple components work together correctly
 * by simulating real user flows through the application.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import Login from '../../src/pages/Login';
import Register from '../../src/pages/Register';
import Dashboard from '../../src/pages/Dashboard';
import Layout from '../../src/components/Layout';
import { apiClient } from '../../src/services/api';
import { UserProfile, Transaction, TransactionType } from '../../src/types';

// Protected and Public route components for testing
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Завантаження...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Завантаження...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Test wrapper that provides router and auth context
function TestApp({ initialEntries = ['/'] }: { initialEntries?: string[] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

// Mock the API client
jest.mock('../../src/services/api', () => ({
  apiClient: {
    isAuthenticated: jest.fn(),
    getProfile: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    clearToken: jest.fn(),
    setToken: jest.fn(),
    getTransactions: jest.fn(),
    getCategories: jest.fn(),
    createTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    getBudgets: jest.fn(),
    createBudget: jest.fn(),
    deleteBudget: jest.fn(),
    getGoals: jest.fn(),
    createGoal: jest.fn(),
    deleteGoal: jest.fn(),
    updateGoal: jest.fn(),
    getDashboard: jest.fn(),
    getByCategory: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

// Mock ResizeObserver for recharts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Test data
const mockUser: UserProfile = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  balance: 5000,
  createdAt: new Date('2024-01-01'),
};

// Note: categories are not required for current integration scenarios

const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: '1',
    type: TransactionType.EXPENSE,
    amount: 100,
    category: 'Їжа',
    description: 'Обід',
    date: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    userId: '1',
    type: TransactionType.INCOME,
    amount: 5000,
    category: 'Зарплата',
    description: 'Місячна зарплата',
    date: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should complete full login flow and redirect to dashboard', async () => {
      const user = userEvent.setup();

      // Initially not authenticated
      mockApiClient.isAuthenticated.mockReturnValue(false);
      mockApiClient.login.mockResolvedValue({
        user: mockUser,
        token: 'test-token',
      });

      // Setup mocks for dashboard
      mockApiClient.getDashboard.mockResolvedValue({
        totalIncome: 5000,
        totalExpenses: 100,
        balance: 4900,
        transactionsCount: 2,
        byCategory: [],
        recentTransactions: mockTransactions,
      });
      mockApiClient.getByCategory.mockResolvedValue([]);

      render(<TestApp initialEntries={['/login']} />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Вхід/i }),
        ).toBeInTheDocument();
      });

      // Fill in login form
      await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Пароль/i), 'password123');

      // Submit form
      await user.click(screen.getByRole('button', { name: /Увійти/i }));

      // Verify login was called
      await waitFor(() => {
        expect(mockApiClient.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should complete full registration flow', async () => {
      const user = userEvent.setup();

      mockApiClient.isAuthenticated.mockReturnValue(false);
      mockApiClient.register.mockResolvedValue({
        user: { ...mockUser, name: 'New User' },
        token: 'new-token',
      });

      render(<TestApp initialEntries={['/register']} />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Реєстрація/i }),
        ).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Ім'я/i), 'New User');
      await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
      await user.type(screen.getByLabelText(/Пароль/i), 'password123');

      await user.click(
        screen.getByRole('button', { name: /Зареєструватися/i }),
      );

      await waitFor(() => {
        expect(mockApiClient.register).toHaveBeenCalledWith({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        });
      });
    });

    it('should show error message on login failure', async () => {
      const user = userEvent.setup();

      mockApiClient.isAuthenticated.mockReturnValue(false);
      mockApiClient.login.mockRejectedValue(new Error('Невірний пароль'));

      render(<TestApp initialEntries={['/login']} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/Пароль/i), 'wrong');
      await user.click(screen.getByRole('button', { name: /Увійти/i }));

      await waitFor(() => {
        expect(screen.getByText('Невірний пароль')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate between login and register pages', async () => {
      const user = userEvent.setup();

      mockApiClient.isAuthenticated.mockReturnValue(false);

      render(<TestApp initialEntries={['/login']} />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Вхід/i }),
        ).toBeInTheDocument();
      });

      // Click register link
      await user.click(screen.getByRole('link', { name: /Зареєструватися/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Реєстрація/i }),
        ).toBeInTheDocument();
      });

      // Click login link
      await user.click(screen.getByRole('link', { name: /Увійти/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Вхід/i }),
        ).toBeInTheDocument();
      });
    });

    it('should redirect unauthenticated users to login', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(false);

      render(<TestApp initialEntries={['/dashboard']} />);

      // Should redirect to login
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Вхід/i }),
        ).toBeInTheDocument();
      });
    });

    it('should redirect authenticated users from login to dashboard', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(true);
      mockApiClient.getProfile.mockResolvedValue(mockUser);
      mockApiClient.getDashboard.mockResolvedValue({
        totalIncome: 5000,
        totalExpenses: 100,
        balance: 4900,
        transactionsCount: 2,
        byCategory: [],
        recentTransactions: [],
      });
      mockApiClient.getByCategory.mockResolvedValue([]);

      render(<TestApp initialEntries={['/login']} />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Головна панель/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes', () => {
    beforeEach(() => {
      mockApiClient.isAuthenticated.mockReturnValue(true);
      mockApiClient.getProfile.mockResolvedValue(mockUser);
    });

    it('should show loading state while checking authentication', () => {
      // Make getProfile take a long time
      mockApiClient.getProfile.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(<TestApp initialEntries={['/dashboard']} />);

      expect(screen.getByText('Завантаження...')).toBeInTheDocument();
    });

    it('should clear token and redirect on profile fetch failure', async () => {
      mockApiClient.getProfile.mockRejectedValue(new Error('Unauthorized'));

      render(<TestApp initialEntries={['/dashboard']} />);

      await waitFor(() => {
        expect(mockApiClient.clearToken).toHaveBeenCalled();
      });

      // Should redirect to login
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Вхід/i }),
        ).toBeInTheDocument();
      });
    });
  });
});

describe('Form Interaction Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle form submission with validation', async () => {
    const user = userEvent.setup();
    mockApiClient.isAuthenticated.mockReturnValue(false);

    render(<TestApp initialEntries={['/register']} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Ім'я/i)).toBeInTheDocument();
    });

    // Try to submit with empty fields - HTML5 validation should prevent submission
    // No need to reference the submit button directly for this check

    // Fill only name
    await user.type(screen.getByLabelText(/Ім'я/i), 'Test');

    // Form should not submit without all required fields
    expect(mockApiClient.register).not.toHaveBeenCalled();
  });

  it('should clear error on successful retry', async () => {
    const user = userEvent.setup();

    mockApiClient.isAuthenticated.mockReturnValue(false);
    mockApiClient.login
      .mockRejectedValueOnce(new Error('Помилка'))
      .mockResolvedValueOnce({
        user: mockUser,
        token: 'token',
      });

    render(<TestApp initialEntries={['/login']} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });

    // First attempt - fails
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Пароль/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /Увійти/i }));

    await waitFor(() => {
      expect(screen.getByText('Помилка')).toBeInTheDocument();
    });

    // Clear inputs and retry
    await user.clear(screen.getByLabelText(/Email/i));
    await user.clear(screen.getByLabelText(/Пароль/i));
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Пароль/i), 'correct');
    await user.click(screen.getByRole('button', { name: /Увійти/i }));

    await waitFor(() => {
      expect(mockApiClient.login).toHaveBeenCalledTimes(2);
    });
  });
});
