import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../lib/prisma';
import { User, type UserCreate } from '../entities/user.entity';
import type { UsersRepository } from './users.repository';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: UserCreate): Promise<User> {
    const created = await this.prisma.user.create({
      data: user,
    });

    return User.fromPersistence(created);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? User.fromPersistence(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? User.fromPersistence(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(User.fromPersistence);
  }

  async update(user: User): Promise<User | null> {
    try {
      const updated = await this.prisma.user.update({
        where: { id: user.id! },
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          isActive: user.isActive,
          lastAccess: user.lastAccess,
          updatedAt: new Date(),
        },
      });
      return User.fromPersistence(updated);
    } catch {
      return null;
    }
  }

  async activate(user: User): Promise<User | null> {
    return this.update(user.activate());
  }

  async deactivate(user: User): Promise<User | null> {
    return this.update(user.deactivate());
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.prisma.user.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async updateMany(users: User[]): Promise<void> {
    const ids = users.map((u) => u.id).filter((id): id is string => !!id);

    await this.prisma.user.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findUsersInactiveSince(date: Date): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        lastAccess: { lt: date },
        role: 'USER',
      },
    });
    return users.map(User.fromPersistence);
  }
}
