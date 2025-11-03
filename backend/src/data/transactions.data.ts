import { Transaction, TransactionType } from '../types';
import { FileStorage } from '../utils/file-storage';

const initialTransactions: Transaction[] = [
  {
    id: 'txn-1',
    userId: 'user-1',
    type: TransactionType.INCOME,
    amount: 50000,
    category: 'Зарплата',
    description: 'Зарплата за жовтень',
    date: new Date('2025-10-01'),
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01'),
  },
  {
    id: 'txn-2',
    userId: 'user-1',
    type: TransactionType.EXPENSE,
    amount: 3500,
    category: 'Їжа',
    description: 'Покупки в супермаркеті',
    date: new Date('2025-10-05'),
    createdAt: new Date('2025-10-05'),
    updatedAt: new Date('2025-10-05'),
  },
  {
    id: 'txn-3',
    userId: 'user-1',
    type: TransactionType.EXPENSE,
    amount: 1200,
    category: 'Транспорт',
    description: 'Проїзд за тиждень',
    date: new Date('2025-10-07'),
    createdAt: new Date('2025-10-07'),
    updatedAt: new Date('2025-10-07'),
  },
  {
    id: 'txn-4',
    userId: 'user-1',
    type: TransactionType.EXPENSE,
    amount: 5000,
    category: 'Комунальні',
    description: 'Електрика і вода',
    date: new Date('2025-10-10'),
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-10'),
  },
  {
    id: 'txn-5',
    userId: 'user-1',
    type: TransactionType.INCOME,
    amount: 8000,
    category: 'Фріланс',
    description: 'Веб-розробка проект',
    date: new Date('2025-10-15'),
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-15'),
  },
  {
    id: 'txn-6',
    userId: 'user-1',
    type: TransactionType.EXPENSE,
    amount: 2500,
    category: 'Розваги',
    description: 'Кіно і ресторан',
    date: new Date('2025-10-18'),
    createdAt: new Date('2025-10-18'),
    updatedAt: new Date('2025-10-18'),
  },
  {
    id: 'txn-7',
    userId: 'user-1',
    type: TransactionType.EXPENSE,
    amount: 15000,
    category: 'Житло',
    description: 'Оренда квартири',
    date: new Date('2025-10-20'),
    createdAt: new Date('2025-10-20'),
    updatedAt: new Date('2025-10-20'),
  },
  {
    id: 'txn-8',
    userId: 'user-1',
    type: TransactionType.EXPENSE,
    amount: 800,
    category: "Здоров'я",
    description: 'Аптека',
    date: new Date('2025-10-22'),
    createdAt: new Date('2025-10-22'),
    updatedAt: new Date('2025-10-22'),
  },
  {
    id: 'txn-9',
    userId: 'user-1',
    type: TransactionType.INCOME,
    amount: 50000,
    category: 'Зарплата',
    description: 'Зарплата за листопад',
    date: new Date('2025-11-01'),
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-01'),
  },
  {
    id: 'txn-10',
    userId: 'user-1',
    type: TransactionType.EXPENSE,
    amount: 4200,
    category: 'Їжа',
    description: 'Продукти',
    date: new Date('2025-11-02'),
    createdAt: new Date('2025-11-02'),
    updatedAt: new Date('2025-11-02'),
  },
];

let transactions: Transaction[] = [];

// Load transactions from file on module initialization
void (async () => {
  transactions = await FileStorage.load('transactions', initialTransactions);
})();

const saveTransactions = () => {
  FileStorage.saveSync('transactions', transactions);
};

// Helper functions
export const getTransactionsByUserId = (userId: string): Transaction[] => {
  return transactions.filter((txn) => txn.userId === userId);
};

export const getTransactionById = (id: string): Transaction | undefined => {
  return transactions.find((txn) => txn.id === id);
};

export const addTransaction = (transaction: Transaction): Transaction => {
  transactions.push(transaction);
  saveTransactions();
  return transaction;
};

export const updateTransaction = (
  id: string,
  updates: Partial<Transaction>,
): Transaction | undefined => {
  const index = transactions.findIndex((txn) => txn.id === id);
  if (index !== -1) {
    transactions[index] = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date(),
    };
    saveTransactions();
    return transactions[index];
  }
  return undefined;
};

export const deleteTransaction = (id: string): boolean => {
  const index = transactions.findIndex((txn) => txn.id === id);
  if (index !== -1) {
    transactions.splice(index, 1);
    saveTransactions();
    return true;
  }
  return false;
};
