import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Goal, CreateGoalDto, TransactionType } from '../types';
import './Goals.css';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';

function Goals() {
  const { refreshProfile } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [addFundsGoalId, setAddFundsGoalId] = useState<string | null>(null);
  const [fundsAmount, setFundsAmount] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dto: CreateGoalDto = {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        deadline: new Date(formData.deadline),
      };

      await apiClient.createGoal(dto);
      await loadGoals();
      setShowForm(false);
      setFormData({ name: '', targetAmount: '', deadline: '' });
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Видалити ціль?')) {
      try {
        await apiClient.deleteGoal(id);
        await loadGoals();
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  const handleAddFunds = async (goal: Goal) => {
    setAddFundsGoalId(goal.id);
    setFundsAmount('');
  };

  const handleSubmitFunds = async (goal: Goal) => {
    const amount = parseFloat(fundsAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Будь ласка, введіть правильну суму');
      return;
    }

    try {
      // Create a transaction for the goal contribution
      await apiClient.createTransaction({
        type: TransactionType.EXPENSE,
        amount: amount,
        category: 'Ціль',
        description: `Внесок у ціль: ${goal.name}`,
        date: new Date(),
      });

      // Update the goal's current amount
      await apiClient.updateGoal(goal.id, {
        currentAmount: goal.currentAmount + amount,
      });

      // Reload goals and refresh user balance
      await loadGoals();
      await refreshProfile();

      setAddFundsGoalId(null);
      setFundsAmount('');
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleCancelAddFunds = () => {
    setAddFundsGoalId(null);
    setFundsAmount('');
  };

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="goals-page">
      <div className="page-header">
        <h1>Фінансові цілі</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Скасувати' : '+ Додати ціль'}
        </Button>
      </div>

      {showForm && (
        <div className="form-card animate-in fade-in-50 slide-in-from-top-2">
          <h2>Нова ціль</h2>
          <form onSubmit={handleSubmit} className="goal-form">
            <div className="form-group">
              <label>Назва цілі</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Наприклад: Відпустка, Новий автомобіль"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Цільова сума (₴)</label>
                <Input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAmount: e.target.value })
                  }
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Термін досягнення</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <Button type="submit">Створити</Button>
          </form>
        </div>
      )}

      <div className="goals-grid">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = Math.ceil(
              (new Date(goal.deadline).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            );

            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <h3>{goal.name}</h3>
                  <button
                    className="btn-delete-small"
                    onClick={() => handleDelete(goal.id)}
                  >
                    🗑️
                  </button>
                </div>

                <div className="goal-amounts">
                  <div className="amount-current">
                    <span className="label">Накопичено:</span>
                    <span className="value">
                      {goal.currentAmount
                        ? goal.currentAmount.toLocaleString('uk-UA')
                        : '0'}{' '}
                      ₴
                    </span>
                  </div>
                  <div className="amount-target">
                    <span className="label">Ціль:</span>
                    <span className="value">
                      {goal.targetAmount.toLocaleString('uk-UA')} ₴
                    </span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="goal-footer">
                  <span className="percentage">
                    {percentage.toFixed(0)}% досягнуто
                  </span>
                  <span
                    className={`days-left ${daysLeft < 30 ? 'urgent' : ''}`}
                  >
                    {daysLeft > 0
                      ? `${daysLeft} днів залишилось`
                      : 'Термін минув'}
                  </span>
                </div>

                {addFundsGoalId === goal.id ? (
                  <div className="add-funds-form">
                    <Input
                      type="number"
                      value={fundsAmount}
                      onChange={(e) => setFundsAmount(e.target.value)}
                      placeholder="Введіть суму"
                      min="0"
                      step="0.01"
                      autoFocus
                    />
                    <div className="add-funds-actions">
                      <Button onClick={() => handleSubmitFunds(goal)} size="sm">
                        Додати
                      </Button>
                      <Button
                        onClick={handleCancelAddFunds}
                        variant="outline"
                        size="sm"
                      >
                        Скасувати
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn-add-funds"
                    onClick={() => handleAddFunds(goal)}
                  >
                    + Додати кошти
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p className="no-data">Немає фінансових цілей</p>
        )}
      </div>
    </div>
  );
}

export default Goals;
