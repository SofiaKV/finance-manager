import { Injectable } from '@nestjs/common';
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  AuthResponse,
  UserProfile,
  User,
  TransactionType,
} from '../types';
import {
  findUserByEmail,
  findUserById,
  addUser,
  updateUser,
} from '../data/users.data';
import { getTransactionsByUserId } from '../data/transactions.data';

/* eslint-disable @typescript-eslint/require-await */

@Injectable()
export class AuthService {
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password, // In real app, hash this
      name,
      createdAt: new Date(),
    };

    addUser(newUser);

    const userProfile = this.createUserProfile(newUser);
    const token = newUser.id; // Token is just the user ID

    return {
      user: userProfile,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    const userProfile = this.createUserProfile(user);
    const token = user.id; // Token is just the user ID

    return {
      user: userProfile,
      token,
    };
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const user = findUserById(userId);
    if (!user) {
      return null;
    }

    return this.createUserProfile(user);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfile | null> {
    const user = findUserById(userId);
    if (!user) {
      return null;
    }

    // Check if email is already taken
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = findUserByEmail(updateProfileDto.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already in use');
      }
    }

    // Update user data
    const updates: Partial<User> = {};
    if (updateProfileDto.name) updates.name = updateProfileDto.name;
    if (updateProfileDto.email) updates.email = updateProfileDto.email;

    const updatedUser = updateUser(userId, updates);
    if (!updatedUser) {
      return null;
    }

    return this.createUserProfile(updatedUser);
  }

  private createUserProfile(user: User): UserProfile {
    // Calculate balance from transactions
    const transactions = getTransactionsByUserId(user.id);
    const balance = transactions.reduce((sum, txn) => {
      return txn.type === TransactionType.INCOME
        ? sum + txn.amount
        : sum - txn.amount;
    }, 0);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      balance,
      createdAt: user.createdAt,
    };
  }
}
