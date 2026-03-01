import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import type { UsersRepository } from '../repositories/users.repository';
import { DeactivateUserUseCase } from './deactivate-user.usecase';

describe('DeactivateUserUseCase', () => {
  let useCase: DeactivateUserUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    usersRepository = {
      findById: jest.fn(),
      deactivate: jest.fn(),
    } as any;
    useCase = new DeactivateUserUseCase(usersRepository);
  });

  it('deve desativar um usuário quando o usuário logado for ADMIN', async () => {
    const loggedUser = {
      id: 'admin-id',
      role: 'ADMIN' as const,
    };

    const activeUser = User.fromPersistence({
      id: 'user-id',
      name: 'Test User',
      email: 'test@email.com',
      password: 'hashed-password',
      role: 'USER',
      isActive: true,
      lastAccess: null,
      createdAt: new Date(),
      updatedAt: null,
    });

    const deactivatedUser = activeUser.deactivate();

    usersRepository.findById.mockResolvedValue(activeUser);
    usersRepository.deactivate.mockResolvedValue(deactivatedUser);

    const result = await useCase.execute('user-id', loggedUser);

    expect(usersRepository.findById).toHaveBeenCalledWith('user-id');
    expect(usersRepository.deactivate).toHaveBeenCalledTimes(1);
    expect(result.isActive).toBe(false);
  });

  it('deve lançar ForbiddenException se o usuário logado não for ADMIN', async () => {
    const loggedUser = {
      id: 'user-id',
      role: 'USER' as const,
    };

    await expect(useCase.execute('user-id', loggedUser)).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(usersRepository.findById).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se o usuário não existir', async () => {
    const loggedUser = {
      id: 'admin-id',
      role: 'ADMIN' as const,
    };

    usersRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-id', loggedUser)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(usersRepository.deactivate).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException se a desativação falhar', async () => {
    const loggedUser = {
      id: 'admin-id',
      role: 'ADMIN' as const,
    };

    const activeUser = User.fromPersistence({
      id: 'user-id',
      name: 'Test User',
      email: 'test@email.com',
      password: 'hashed-password',
      role: 'USER',
      isActive: true,
      lastAccess: null,
      createdAt: new Date(),
      updatedAt: null,
    });

    usersRepository.findById.mockResolvedValue(activeUser);
    usersRepository.deactivate.mockResolvedValue(null as any);

    await expect(useCase.execute('user-id', loggedUser)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
