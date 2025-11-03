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
import { DashboardSummary } from '../types';
import './Dashboard.css';

const COLORS = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#4facfe',
  '#43e97b',
  '#fa709a',
];

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');

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
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  if (!dashboard) {
    return <div className="error">Помилка завантаження даних</div>;
  }

  const pieData = dashboard.byCategory.slice(0, 6).map((cat) => ({
    name: cat.category,
    value: cat.total,
  }));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Головна панель</h1>
        <div className="period-selector">
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

      <div className="charts-row">
        <div className="chart-card">
          <h2>Витрати по категоріях</h2>
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
                      fill={COLORS[index % COLORS.length]}
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
          <h2>Топ категорій</h2>
          {dashboard.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.byCategory.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#667eea" name="Сума" />
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
