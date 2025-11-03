import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Goal, CreateGoalDto } from '../types';
import './Goals.css';

function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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
    const amount = prompt('Скільки додати до цілі?');
    if (amount) {
      try {
        await apiClient.updateGoal(goal.id, {
          currentAmount: goal.currentAmount + parseFloat(amount),
        });
        await loadGoals();
      } catch (error) {
        console.error('Failed to update goal:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="goals-page">
      <div className="page-header">
        <h1>Фінансові цілі</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Скасувати' : '+ Додати ціль'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Нова ціль</h2>
          <form onSubmit={handleSubmit} className="goal-form">
            <div className="form-group">
              <label>Назва цілі</label>
              <input
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
                <input
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
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Створити
            </button>
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

                <button
                  className="btn-add-funds"
                  onClick={() => handleAddFunds(goal)}
                >
                  + Додати кошти
                </button>
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
