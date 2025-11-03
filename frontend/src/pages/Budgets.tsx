import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Budget, CreateBudgetDto, Category, TransactionType } from '../types';
import './Budgets.css';

function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'MONTHLY' as 'MONTHLY' | 'WEEKLY' | 'YEARLY',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [budgetsData, categoriesData] = await Promise.all([
        apiClient.getBudgets(),
        apiClient.getCategories(),
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const dto: CreateBudgetDto = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
        startDate,
        endDate,
      };

      await apiClient.createBudget(dto);
      await loadData();
      setShowForm(false);
      setFormData({ category: '', amount: '', period: 'MONTHLY' });
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Видалити бюджет?')) {
      try {
        await apiClient.deleteBudget(id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete budget:', error);
      }
    }
  };

  const expenseCategories = categories.filter(
    (cat) => cat.type === TransactionType.EXPENSE,
  );

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="budgets-page">
      <div className="page-header">
        <h1>Бюджети</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Скасувати' : '+ Додати бюджет'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Новий бюджет</h2>
          <form onSubmit={handleSubmit} className="budget-form">
            <div className="form-group">
              <label>Категорія</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="">Оберіть категорію</option>
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Сума (₴)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Період</label>
              <select
                value={formData.period}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    period: e.target.value as 'MONTHLY' | 'WEEKLY' | 'YEARLY',
                  })
                }
                required
              >
                <option value="MONTHLY">Місячний</option>
                <option value="WEEKLY">Тижневий</option>
                <option value="YEARLY">Річний</option>
              </select>
            </div>

            <button type="submit" className="btn-primary">
              Створити
            </button>
          </form>
        </div>
      )}

      <div className="budgets-grid">
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const isOverBudget = percentage > 100;

            return (
              <div key={budget.id} className="budget-card">
                <div className="budget-header">
                  <h3>{budget.category}</h3>
                  <button
                    className="btn-delete-small"
                    onClick={() => handleDelete(budget.id)}
                  >
                    🗑️
                  </button>
                </div>

                <div className="budget-amounts">
                  <div className="amount-spent">
                    <span className="label">Витрачено:</span>
                    <span className={isOverBudget ? 'over-budget' : ''}>
                      {budget.spent.toLocaleString('uk-UA')} ₴
                    </span>
                  </div>
                  <div className="amount-limit">
                    <span className="label">Ліміт:</span>
                    <span>{budget.amount.toLocaleString('uk-UA')} ₴</span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div
                    className={`progress-fill ${isOverBudget ? 'over' : ''}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="budget-footer">
                  <span className="percentage">
                    {percentage.toFixed(0)}% використано
                  </span>
                  <span className="remaining">
                    Залишилось:{' '}
                    {Math.max(budget.amount - budget.spent, 0).toLocaleString(
                      'uk-UA',
                    )}{' '}
                    ₴
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-data">Немає бюджетів</p>
        )}
      </div>
    </div>
  );
}

export default Budgets;
