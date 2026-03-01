import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import type { UsersRepository } from '../repositories/users.repository';
import { ActivateUserUseCase } from './activate-user.usecase';

describe('ActivateUserUseCase', () => {
  let useCase: ActivateUserUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    usersRepository = {
      findById: jest.fn(),
      activate: jest.fn(),
    } as any;

    useCase = new ActivateUserUseCase(usersRepository);
  });

  it('deve ativar um usuário quando o usuário logado for ADMIN', async () => {
    const loggedUser = {
      id: 'admin-id',
      role: 'ADMIN' as const,
    };

    const inactiveUser = User.fromPersistence({
      id: 'user-id',
      name: 'Test User',
      email: 'test@email.com',
      password: 'hashed-password',
      role: 'USER',
      isActive: false,
      lastAccess: null,
      createdAt: new Date(),
      updatedAt: null,
    });

    const activatedUser = inactiveUser.activate();

    usersRepository.findById.mockResolvedValue(inactiveUser);
    usersRepository.activate.mockResolvedValue(activatedUser);

    const result = await useCase.execute('user-id', loggedUser);

    expect(usersRepository.findById).toHaveBeenCalledWith('user-id');
    expect(usersRepository.activate).toHaveBeenCalledTimes(1);
    expect(result.isActive).toBe(true);
    // Validação extra para garantir que a Entity gerou a data de atualização
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('deve lançar ForbiddenException se o usuário logado não for ADMIN', async () => {
    const loggedUser = {
      id: 'user-id',
      role: 'USER' as const,
    };

    await expect(useCase.execute('user-id', loggedUser)).rejects.toThrow(
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

    await expect(useCase.execute('user-id', loggedUser)).rejects.toThrow(
      new NotFoundException('User not found'),
    );

    expect(usersRepository.activate).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException se a ativação falhar no repositório', async () => {
    const loggedUser = {
      id: 'admin-id',
      role: 'ADMIN' as const,
    };

    const inactiveUser = User.fromPersistence({
      id: 'user-id',
      name: 'Test User',
      email: 'test@email.com',
      password: 'hashed-password',
      role: 'USER',
      isActive: false,
      lastAccess: null,
      createdAt: new Date(),
      updatedAt: null,
    });

    usersRepository.findById.mockResolvedValue(inactiveUser);
    usersRepository.activate.mockResolvedValue(null as any);

    await expect(useCase.execute('user-id', loggedUser)).rejects.toThrow(
      new BadRequestException('Error on activate user'),
    );
  });
});
