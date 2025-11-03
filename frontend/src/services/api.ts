import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  UserProfile,
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  Budget,
  CreateBudgetDto,
  UpdateBudgetDto,
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  DashboardSummary,
  CategorySummary,
  PeriodSummary,
  Category,
} from '../types';

const API_BASE_URL = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('authToken');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }

  // Auth methods
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    this.clearToken();
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/profile');
  }

  async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Transaction methods
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.startDate)
      params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate)
      params.append('endDate', filters.endDate.toISOString());
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);

    const query = params.toString();
    return this.request<Transaction[]>(
      `/transactions${query ? `?${query}` : ''}`,
    );
  }

  async getTransaction(id: string): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}`);
  }

  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(
    id: string,
    data: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.request(`/transactions/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  }

  async getBudgets(): Promise<Budget[]> {
    return this.request<Budget[]>('/budgets');
  }

  async getBudget(id: string): Promise<Budget> {
    return this.request<Budget>(`/budgets/${id}`);
  }

  async createBudget(data: CreateBudgetDto): Promise<Budget> {
    return this.request<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBudget(id: string, data: UpdateBudgetDto): Promise<Budget> {
    return this.request<Budget>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBudget(id: string): Promise<void> {
    await this.request(`/budgets/${id}`, { method: 'DELETE' });
  }

  // Goal methods
  async getGoals(): Promise<Goal[]> {
    return this.request<Goal[]>('/goals');
  }

  async getGoal(id: string): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}`);
  }

  async createGoal(data: CreateGoalDto): Promise<Goal> {
    return this.request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoal(id: string, data: UpdateGoalDto): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(id: string): Promise<void> {
    await this.request<void>(`/goals/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  }

  async getDashboard(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<DashboardSummary> {
    const params = new URLSearchParams();
    if (filters?.startDate)
      params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate)
      params.append('endDate', filters.endDate.toISOString());

    const query = params.toString();
    return this.request<DashboardSummary>(
      `/reports/dashboard${query ? `?${query}` : ''}`,
    );
  }

  async getByCategory(
    filters?: TransactionFilters,
  ): Promise<CategorySummary[]> {
    const params = new URLSearchParams();
    if (filters?.startDate)
      params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate)
      params.append('endDate', filters.endDate.toISOString());
    if (filters?.type) params.append('type', filters.type);

    const query = params.toString();
    return this.request<CategorySummary[]>(
      `/reports/by-category${query ? `?${query}` : ''}`,
    );
  }

  async getByPeriod(
    filters?: { startDate?: Date; endDate?: Date },
    groupBy: 'day' | 'week' | 'month' = 'month',
  ): Promise<PeriodSummary[]> {
    const params = new URLSearchParams();
    if (filters?.startDate)
      params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate)
      params.append('endDate', filters.endDate.toISOString());
    params.append('groupBy', groupBy);

    const query = params.toString();
    return this.request<PeriodSummary[]>(
      `/reports/by-period${query ? `?${query}` : ''}`,
    );
  }

  // Categories methods
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiClient = new ApiClient();
