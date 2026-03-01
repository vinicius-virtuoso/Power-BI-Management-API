import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import type { UsersRepository } from '../repositories/users.repository';
import { DeleteUserUseCase } from './delete-user.usecase';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    usersRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as any;
    useCase = new DeleteUserUseCase(usersRepository);
  });

  it('deve deletar um usuário quando o usuário logado for ADMIN', async () => {
    const loggedUser = {
      id: 'admin-id',
      role: 'ADMIN' as const,
    };

    const user = User.fromPersistence({
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

    usersRepository.findById.mockResolvedValue(user);
    usersRepository.delete.mockResolvedValue(true as any);

    await expect(useCase.execute('user-id', loggedUser)).resolves.not.toThrow();

    expect(usersRepository.findById).toHaveBeenCalledWith('user-id');
    expect(usersRepository.delete).toHaveBeenCalledWith('user-id');
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

    expect(usersRepository.delete).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException se a exclusão falhar', async () => {
    const loggedUser = {
      id: 'admin-id',
      role: 'ADMIN' as const,
    };

    const user = User.fromPersistence({
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

    usersRepository.findById.mockResolvedValue(user);
    usersRepository.delete.mockResolvedValue(false as any);

    await expect(useCase.execute('user-id', loggedUser)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
