import type { User } from '../entities/user.entity';

export interface UsersRepository {
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findById(userId: string): Promise<User | null>;
  activate(user: User): Promise<User | null>;
  deactivate(user: User): Promise<User | null>;
  update(user: User): Promise<User | null>;
  delete(userId: string): Promise<boolean>;
  findUsersInactiveSince(date: Date): Promise<User[]>;
  deleteMany(ids: string[]): Promise<void>;
  updateMany(users: User[]): Promise<void>;
}
