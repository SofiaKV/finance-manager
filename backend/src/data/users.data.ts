import { User } from '../types';
import { Injectable } from '@nestjs/common';
import { Connection } from './connection.service';
import { UserEntity } from './types';

@Injectable()
export class UserDao {
  constructor(private readonly connection: Connection) {}

  mapRowToUser(row: UserEntity): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password_hash,
      name: row.name ?? undefined,
      createdAt: row.created_at,
    };
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const row = await this.connection
      .db('users')
      .select('id', 'email', 'password_hash', 'name', 'created_at')
      .where({ email })
      .first<UserEntity>();

    if (!row) return undefined;
    return this.mapRowToUser(row);
  }

  async findUserById(id: string): Promise<User | undefined> {
    const row = await this.connection
      .db('users')
      .select('id', 'email', 'password_hash', 'name', 'created_at')
      .where({ id })
      .first<UserEntity>();

    if (!row) return undefined;
    return this.mapRowToUser(row);
  }

  async addUser(user: User): Promise<User> {
    const [row] = await this.connection
      .db('users')
      .insert({
        email: user.email,
        password_hash: user.password,
        name: user.name ?? null,
      })
      .returning<UserEntity[]>([
        'id',
        'email',
        'password_hash',
        'name',
        'created_at',
      ]);

    return this.mapRowToUser(row);
  }

  async updateUser(
    id: string,
    updates: Partial<User>,
  ): Promise<User | undefined> {
    const [row] = await this.connection
      .db<UserEntity>('users')
      .where({ id })
      .update({
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.password !== undefined
          ? { password_hash: updates.password }
          : {}),
        updated_at: this.connection.db.fn.now(),
      })
      .returning<UserEntity[]>('*');

    if (!row) return undefined;
    return this.mapRowToUser(row);
  }
}
