import { Budget } from '../types';
import { FileStorage } from '../utils/file-storage';

const initialBudgets: Budget[] = [
  {
    id: 'budget-1',
    userId: 'user-1',
    category: 'Їжа',
    amount: 10000,
    period: 'MONTHLY',
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-11-30'),
    spent: 4200,
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-02'),
  },
  {
    id: 'budget-2',
    userId: 'user-1',
    category: 'Розваги',
    amount: 5000,
    period: 'MONTHLY',
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-11-30'),
    spent: 0,
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-01'),
  },
  {
    id: 'budget-3',
    userId: 'user-1',
    category: 'Транспорт',
    amount: 3000,
    period: 'MONTHLY',
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-11-30'),
    spent: 0,
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-01'),
  },
];

let budgets: Budget[] = [];

// Load budgets from file on module initialization
void (async () => {
  budgets = await FileStorage.load('budgets', initialBudgets);
})();

const saveBudgets = () => {
  FileStorage.saveSync('budgets', budgets);
};

// Helper functions
export const getBudgetsByUserId = (userId: string): Budget[] => {
  return budgets.filter((budget) => budget.userId === userId);
};

export const getBudgetById = (id: string): Budget | undefined => {
  return budgets.find((budget) => budget.id === id);
};

export const addBudget = (budget: Budget): Budget => {
  budgets.push(budget);
  saveBudgets();
  return budget;
};

export const updateBudget = (
  id: string,
  updates: Partial<Budget>,
): Budget | undefined => {
  const index = budgets.findIndex((budget) => budget.id === id);
  if (index !== -1) {
    budgets[index] = {
      ...budgets[index],
      ...updates,
      updatedAt: new Date(),
    };
    saveBudgets();
    return budgets[index];
  }
  return undefined;
};

export const deleteBudget = (id: string): boolean => {
  const index = budgets.findIndex((budget) => budget.id === id);
  if (index !== -1) {
    budgets.splice(index, 1);
    saveBudgets();
    return true;
  }
  return false;
};
