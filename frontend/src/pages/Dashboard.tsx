import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { apiClient } from '../services/api';
import { DashboardSummary, CategorySummary, TransactionType } from '../types';
import './Dashboard.css';

const EXPENSE_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
];
const INCOME_COLORS = [
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
];

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');

  const getDateFilters = () => {
    const now = new Date();
    if (period === 'month') {
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: now,
      };
    } else if (period === 'year') {
      return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: now,
      };
    }
    return {};
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const filters = getDateFilters();
      const data = await apiClient.getDashboard(filters);
      setDashboard(data);

      // Load categories filtered by transaction type
      const categoryData = await apiClient.getByCategory({
        ...filters,
        type:
          chartType === 'expense'
            ? TransactionType.EXPENSE
            : TransactionType.INCOME,
      });
      setCategories(categoryData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, chartType]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  if (!dashboard) {
    return <div className="error">Помилка завантаження даних</div>;
  }

  const pieData = categories.slice(0, 6).map((cat) => ({
    name: cat.category,
    value: cat.total,
  }));

  const chartColors = chartType === 'expense' ? EXPENSE_COLORS : INCOME_COLORS;
  const chartIndex = chartType === 'expense' ? 0 : 1;

  const periodIndex = period === 'month' ? 0 : period === 'year' ? 1 : 2;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Головна панель</h1>
        <div className="period-selector">
          <div className={`segmented-indicator position-${periodIndex}`} />
          <button
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            Місяць
          </button>
          <button
            className={period === 'year' ? 'active' : ''}
            onClick={() => setPeriod('year')}
          >
            Рік
          </button>
          <button
            className={period === 'all' ? 'active' : ''}
            onClick={() => setPeriod('all')}
          >
            Все
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Доходи</div>
            <div className="stat-value">
              {dashboard.totalIncome.toLocaleString('uk-UA')} ₴
            </div>
          </div>
        </div>

        <div className="stat-card expenses">
          <div className="stat-icon">📉</div>
          <div className="stat-content">
            <div className="stat-label">Витрати</div>
            <div className="stat-value">
              {dashboard.totalExpenses.toLocaleString('uk-UA')} ₴
            </div>
          </div>
        </div>

        <div className="stat-card balance">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Баланс</div>
            <div className="stat-value">
              {dashboard.balance.toLocaleString('uk-UA')} ₴
            </div>
          </div>
        </div>

        <div className="stat-card transactions">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Транзакції</div>
            <div className="stat-value">{dashboard.transactionsCount}</div>
          </div>
        </div>
      </div>

      <div className="charts-header">
        <h2>Аналітика по категоріях</h2>
        <div className="chart-type-selector">
          <div className={`segmented-indicator position-${chartIndex}`} />
          <button
            className={chartType === 'expense' ? 'active' : ''}
            onClick={() => setChartType('expense')}
          >
            Витрати
          </button>
          <button
            className={chartType === 'income' ? 'active' : ''}
            onClick={() => setChartType('income')}
          >
            Доходи
          </button>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>
            {chartType === 'expense' ? 'Витрати' : 'Доходи'} по категоріях
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Немає даних</p>
          )}
        </div>

        <div className="chart-card">
          <h3>Топ категорій</h3>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categories.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="total"
                  fill={chartType === 'expense' ? '#ef4444' : '#10b981'}
                  name="Сума"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Немає даних</p>
          )}
        </div>
      </div>

      <div className="recent-transactions">
        <h2>Останні транзакції</h2>
        {dashboard.recentTransactions.length > 0 ? (
          <div className="transactions-list">
            {dashboard.recentTransactions.map((txn) => (
              <div key={txn.id} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-category">{txn.category}</div>
                  <div className="transaction-description">
                    {txn.description}
                  </div>
                  <div className="transaction-date">
                    {new Date(txn.date).toLocaleDateString('uk-UA')}
                  </div>
                </div>
                <div className={`transaction-amount ${txn.type.toLowerCase()}`}>
                  {txn.type === 'INCOME' ? '+' : '-'}
                  {txn.amount.toLocaleString('uk-UA')} ₴
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Немає транзакцій</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
