import { User } from '../types';
import { FileStorage } from '../utils/file-storage';

const initialUsers: User[] = [
  {
    id: 'user-1',
    email: 'demo@example.com',
    password: 'password123', // In real app, this would be hashed
    name: 'Demo User',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'user-2',
    email: 'user@test.com',
    password: 'test123',
    name: 'Test User',
    createdAt: new Date('2025-01-15'),
  },
];

let users: User[] = [];

// Load users from file on module initialization
void (async () => {
  users = await FileStorage.load('users', initialUsers);
})();

const saveUsers = () => {
  FileStorage.saveSync('users', users);
};

// Helper function to find user by email
export const findUserByEmail = (email: string): User | undefined => {
  return users.find((user) => user.email === email);
};

// Helper function to find user by id
export const findUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};

// Helper function to add new user
export const addUser = (user: User): User => {
  users.push(user);
  saveUsers();
  return user;
};

// Helper function to update user
export const updateUser = (
  id: string,
  updates: Partial<User>,
): User | undefined => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers();
    return users[index];
  }
  return undefined;
};
