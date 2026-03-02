import { randomUUID } from 'node:crypto';
import { User } from '../entities/user.entity';
import type { UsersRepository } from './users.repository';

export class InMemoryUsersRepository implements UsersRepository {
  private users: User[] = [];

  async save(user: User): Promise<User> {
    const userPersisted = User.fromPersistence({
      id: user.id ?? randomUUID(),
      createdAt: new Date(Date.now()),
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      lastAccess: null,
      updatedAt: null,
    });
    this.users.push(userPersisted);

    return userPersisted;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userFound = this.users.find((user) => user.email === email);

    if (!userFound) return null;

    return userFound;
  }

  async findAll(): Promise<User[]> {
    const users = this.users;

    return users;
  }

  async findById(userId: string): Promise<User | null> {
    const userFound = this.users.find((user) => user.id === userId);

    if (!userFound) return null;

    return userFound;
  }

  async activate(user: User): Promise<User | null> {
    const userFoundIndex = this.users.findIndex(
      (userIndex) => userIndex.id === user.id,
    );

    if (userFoundIndex === -1) {
      return null;
    }

    this.users[userFoundIndex] = user;

    return user;
  }

  async deactivate(user: User): Promise<User | null> {
    const userFoundIndex = this.users.findIndex(
      (userIndex) => userIndex.id === user.id,
    );

    if (userFoundIndex === -1) {
      return null;
    }

    this.users[userFoundIndex] = user;

    return user;
  }

  async update(user: User): Promise<User | null> {
    const index = this.users.findIndex((u) => u.id === user.id);

    if (index === -1) {
      return null;
    }

    this.users[index] = user;

    return user;
  }

  async delete(userId: string): Promise<boolean> {
    const userFound = this.users.find((user) => user.id === userId);

    if (!userFound) return false;

    const usersFiltered = this.users.filter((user) => user.id !== userId);
    this.users = usersFiltered;

    return true;
  }

  async findUsersInactiveSince(date: Date): Promise<User[]> {
    return this.users.filter(
      (user) =>
        user.lastAccess && user.lastAccess < date && user.role === 'USER',
    );
  }

  async deleteMany(ids: string[]): Promise<void> {
    this.users = this.users.filter((user) => !ids.includes(user.id!));
  }

  async updateMany(users: User[]): Promise<void> {
    const idsToUpdate = new Set(users.map((u) => u.id).filter(Boolean));

    this.users = this.users.map((user) => {
      if (idsToUpdate.has(user.id)) {
        return user.deactivate();
      }
      return user;
    });
  }
}
