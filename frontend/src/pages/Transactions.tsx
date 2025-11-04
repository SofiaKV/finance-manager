import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import {
  Transaction,
  Category,
  TransactionType,
  CreateTransactionDto,
} from '../types';
import './Transactions.css';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

function Transactions() {
  const { refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<TransactionType | 'ALL'>('ALL');

  const [formData, setFormData] = useState({
    type: TransactionType.EXPENSE,
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txns, cats] = await Promise.all([
        apiClient.getTransactions(),
        apiClient.getCategories(),
      ]);
      setTransactions(txns);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dto: CreateTransactionDto = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date),
      };
      await apiClient.createTransaction(dto);
      await loadData();
      await refreshProfile(); // Refresh user balance
      setShowForm(false);
      setFormData({
        type: TransactionType.EXPENSE,
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Видалити транзакцію?')) {
      try {
        await apiClient.deleteTransaction(id);
        await loadData();
        await refreshProfile(); // Refresh user balance
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  const filteredTransactions = transactions.filter((txn) =>
    filter === 'ALL' ? true : txn.type === filter,
  );

  const filterIndex =
    filter === 'ALL' ? 0 : filter === TransactionType.INCOME ? 1 : 2;

  const availableCategories = categories.filter((cat) =>
    formData.type === TransactionType.INCOME
      ? cat.type === TransactionType.INCOME
      : cat.type === TransactionType.EXPENSE,
  );

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Транзакції</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Скасувати' : '+ Додати транзакцію'}
        </Button>
      </div>

      {showForm && (
        <div className="form-card animate-in fade-in-50 slide-in-from-top-2">
          <h2>Нова транзакція</h2>
          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="form-row">
              <div className="form-group">
                <label>Тип</label>
                <select
                  className="select"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as TransactionType,
                      category: '',
                    })
                  }
                  required
                >
                  <option value={TransactionType.EXPENSE}>Витрата</option>
                  <option value={TransactionType.INCOME}>Дохід</option>
                </select>
              </div>

              <div className="form-group">
                <label>Категорія</label>
                <select
                  className="select"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Оберіть категорію</option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Сума (₴)</label>
                <Input
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
                <label>Дата</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Опис</label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                placeholder="Введіть опис транзакції"
              />
            </div>

            <Button type="submit">Зберегти</Button>
          </form>
        </div>
      )}

      <div className="filter-buttons">
        <div
          className="segmented-indicator"
          style={{ transform: `translateX(${filterIndex * 100}%)` }}
        />
        <button
          className={filter === 'ALL' ? 'active' : ''}
          onClick={() => setFilter('ALL')}
        >
          Всі
        </button>
        <button
          className={filter === TransactionType.INCOME ? 'active' : ''}
          onClick={() => setFilter(TransactionType.INCOME)}
        >
          Доходи
        </button>
        <button
          className={filter === TransactionType.EXPENSE ? 'active' : ''}
          onClick={() => setFilter(TransactionType.EXPENSE)}
        >
          Витрати
        </button>
      </div>

      <div className="transactions-list">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((txn) => (
            <div key={txn.id} className="transaction-card">
              <div className="transaction-main">
                <div className="transaction-category">{txn.category}</div>
                <div className="transaction-description">{txn.description}</div>
                <div className="transaction-date">
                  {new Date(txn.date).toLocaleDateString('uk-UA')}
                </div>
              </div>
              <div className="transaction-right">
                <div className={`transaction-amount ${txn.type.toLowerCase()}`}>
                  {txn.type === 'INCOME' ? '+' : '-'}
                  {txn.amount.toLocaleString('uk-UA')} ₴
                </div>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(txn.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">Немає транзакцій</p>
        )}
      </div>
    </div>
  );
}

export default Transactions;
