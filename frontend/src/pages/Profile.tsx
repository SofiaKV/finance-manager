import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import {
  UpdateProfileDto,
  CreateTransactionDto,
  TransactionType,
} from '../types';
import './Profile.css';

function Profile() {
  const { user, updateUser, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showBalanceAdjust, setShowBalanceAdjust] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [balanceAdjustment, setBalanceAdjustment] = useState({
    amount: '',
    description: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const dto: UpdateProfileDto = {
        name: formData.name,
        email: formData.email,
      };

      const updatedProfile = await apiClient.updateProfile(dto);
      updateUser(updatedProfile);
      setIsEditing(false);
      setSuccess('Профіль успішно оновлено!');
    } catch (err) {
      setError((err as Error).message || 'Помилка оновлення профілю');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setError('');
  };

  const handleBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const dto: CreateTransactionDto = {
        type:
          balanceAdjustment.type === 'INCOME'
            ? TransactionType.INCOME
            : TransactionType.EXPENSE,
        amount: parseFloat(balanceAdjustment.amount),
        category: 'Коригування балансу',
        description:
          balanceAdjustment.description || 'Коригування початкового балансу',
        date: new Date(),
      };

      await apiClient.createTransaction(dto);
      await refreshProfile();
      setShowBalanceAdjust(false);
      setBalanceAdjustment({
        amount: '',
        description: '',
        type: 'INCOME',
      });
      setSuccess('Баланс успішно скориговано!');
    } catch (err) {
      setError((err as Error).message || 'Помилка коригування балансу');
    }
  };

  const cancelBalanceAdjust = () => {
    setShowBalanceAdjust(false);
    setBalanceAdjustment({
      amount: '',
      description: '',
      type: 'INCOME',
    });
    setError('');
  };

  if (!user) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="profile-page">
      <h1>Профіль користувача</h1>

      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showBalanceAdjust ? (
          <div className="balance-adjust-form">
            <h3>Коригування балансу</h3>
            <form onSubmit={handleBalanceAdjustment}>
              <div className="form-group">
                <label>Тип</label>
                <select
                  value={balanceAdjustment.type}
                  onChange={(e) =>
                    setBalanceAdjustment({
                      ...balanceAdjustment,
                      type: e.target.value as 'INCOME' | 'EXPENSE',
                    })
                  }
                  required
                >
                  <option value="INCOME">Збільшити баланс</option>
                  <option value="EXPENSE">Зменшити баланс</option>
                </select>
              </div>

              <div className="form-group">
                <label>Сума (₴)</label>
                <input
                  type="number"
                  value={balanceAdjustment.amount}
                  onChange={(e) =>
                    setBalanceAdjustment({
                      ...balanceAdjustment,
                      amount: e.target.value,
                    })
                  }
                  required
                  min="0"
                  step="0.01"
                  placeholder="Введіть суму"
                />
              </div>

              <div className="form-group">
                <label>Опис (необов'язково)</label>
                <input
                  type="text"
                  value={balanceAdjustment.description}
                  onChange={(e) =>
                    setBalanceAdjustment({
                      ...balanceAdjustment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Причина коригування"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Підтвердити
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cancelBalanceAdjust}
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        ) : isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Ім'я</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Зберегти
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Скасувати
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Ім'я:</span>
              <span className="info-value">{user.name}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Поточний баланс:</span>
              <span className="info-value balance">
                {user.balance.toLocaleString('uk-UA')} ₴
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Дата реєстрації:</span>
              <span className="info-value">
                {new Date(user.createdAt).toLocaleDateString('uk-UA')}
              </span>
            </div>

            <button className="btn-primary" onClick={() => setIsEditing(true)}>
              Редагувати профіль
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowBalanceAdjust(true)}
              style={{ marginTop: '10px' }}
            >
              Коригувати баланс
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
