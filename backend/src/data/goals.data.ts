import { Goal } from '../types';
import { FileStorage } from '../utils/file-storage';

const initialGoals: Goal[] = [
  {
    id: 'goal-1',
    userId: 'user-1',
    name: 'Відпустка в Європі',
    targetAmount: 50000,
    currentAmount: 15000,
    deadline: new Date('2025-07-01'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-10-15'),
  },
  {
    id: 'goal-2',
    userId: 'user-1',
    name: 'Новий ноутбук',
    targetAmount: 30000,
    currentAmount: 8000,
    deadline: new Date('2025-12-31'),
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-10-22'),
  },
  {
    id: 'goal-3',
    userId: 'user-1',
    name: 'Резервний фонд',
    targetAmount: 100000,
    currentAmount: 25000,
    deadline: new Date('2026-06-01'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-11-01'),
  },
];

let goals: Goal[] = [];

// Load goals from file on module initialization
void (async () => {
  goals = await FileStorage.load('goals', initialGoals);
})();

const saveGoals = () => {
  FileStorage.saveSync('goals', goals);
};

// Helper functions
export const getGoalsByUserId = (userId: string): Goal[] => {
  return goals.filter((goal) => goal.userId === userId);
};

export const getGoalById = (id: string): Goal | undefined => {
  return goals.find((goal) => goal.id === id);
};

export const addGoal = (goal: Goal): Goal => {
  goals.push(goal);
  saveGoals();
  return goal;
};

export const updateGoal = (
  id: string,
  updates: Partial<Goal>,
): Goal | undefined => {
  const index = goals.findIndex((goal) => goal.id === id);
  if (index !== -1) {
    goals[index] = {
      ...goals[index],
      ...updates,
      updatedAt: new Date(),
    };
    saveGoals();
    return goals[index];
  }
  return undefined;
};

export const deleteGoal = (id: string): boolean => {
  const index = goals.findIndex((goal) => goal.id === id);
  if (index !== -1) {
    goals.splice(index, 1);
    saveGoals();
    return true;
  }
  return false;
};
