import { Category, TransactionType } from '../types';

export const categories: Category[] = [
  // Income categories
  { id: 'cat-1', name: 'Зарплата', type: TransactionType.INCOME, icon: '💰' },
  { id: 'cat-2', name: 'Фріланс', type: TransactionType.INCOME, icon: '💼' },
  { id: 'cat-3', name: 'Інвестиції', type: TransactionType.INCOME, icon: '📈' },
  { id: 'cat-4', name: 'Подарунки', type: TransactionType.INCOME, icon: '🎁' },
  {
    id: 'cat-5',
    name: 'Коригування балансу',
    type: TransactionType.INCOME,
    icon: '⚖️',
  },
  {
    id: 'cat-6',
    name: 'Інше (дохід)',
    type: TransactionType.INCOME,
    icon: '➕',
  },

  // Expense categories
  { id: 'cat-7', name: 'Їжа', type: TransactionType.EXPENSE, icon: '🍔' },
  { id: 'cat-8', name: 'Транспорт', type: TransactionType.EXPENSE, icon: '🚗' },
  { id: 'cat-9', name: 'Розваги', type: TransactionType.EXPENSE, icon: '🎉' },
  { id: 'cat-10', name: 'Житло', type: TransactionType.EXPENSE, icon: '🏠' },
  {
    id: 'cat-11',
    name: 'Комунальні',
    type: TransactionType.EXPENSE,
    icon: '💡',
  },
  { id: 'cat-12', name: "Здоров'я", type: TransactionType.EXPENSE, icon: '⚕️' },
  { id: 'cat-13', name: 'Освіта', type: TransactionType.EXPENSE, icon: '📚' },
  { id: 'cat-14', name: 'Одяг', type: TransactionType.EXPENSE, icon: '👔' },
  { id: 'cat-15', name: 'Подорожі', type: TransactionType.EXPENSE, icon: '✈️' },
  {
    id: 'cat-16',
    name: 'Коригування балансу',
    type: TransactionType.EXPENSE,
    icon: '⚖️',
  },
  {
    id: 'cat-17',
    name: 'Інше (витрати)',
    type: TransactionType.EXPENSE,
    icon: '➖',
  },
];
