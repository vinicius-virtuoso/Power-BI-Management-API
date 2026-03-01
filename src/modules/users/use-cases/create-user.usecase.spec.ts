import { ConflictException, ForbiddenException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { CreateUserRole } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import type { UsersRepository } from '../repositories/users.repository';
import { CreateUserUseCase } from './create-user.usecase';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    usersRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as any;
    useCase = new CreateUserUseCase(usersRepository);
  });

  it('deve criar um usuário quando o usuário logado for ADMIN', async () => {
    const dto = {
      name: 'Test User',
      email: 'test@email.com',
      password: '123456',
      role: CreateUserRole.USER,
    };

    const loggedUser = {
      id: 'admin-id',
      role: CreateUserRole.ADMIN,
    };

    (hash as jest.Mock).mockResolvedValue('hashed-password');
    usersRepository.findByEmail.mockResolvedValue(null);

    const persistedUser = User.fromPersistence({
      id: 'user-id',
      name: dto.name,
      email: dto.email,
      password: 'hashed-password',
      role: dto.role,
      isActive: true,
      lastAccess: null,
      createdAt: new Date(),
      updatedAt: null,
    });

    usersRepository.save.mockResolvedValue(persistedUser);

    const result = await useCase.execute(dto, loggedUser);

    expect(usersRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(usersRepository.save).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      id: 'user-id',
      name: dto.name,
      email: dto.email,
      role: dto.role,
      isActive: true,
      lastAccess: null,
      createdAt: expect.any(Date),
      updatedAt: null,
    });
  });

  it('deve lançar ForbiddenException se o usuário não for ADMIN', async () => {
    const dto = {
      name: 'User',
      email: 'user@email.com',
      password: '123',
      role: CreateUserRole.USER,
    };

    const loggedUser = {
      id: 'user-id',
      role: CreateUserRole.USER,
    };

    await expect(useCase.execute(dto, loggedUser)).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(usersRepository.findByEmail).not.toHaveBeenCalled();
    expect(usersRepository.save).not.toHaveBeenCalled();
  });

  it('deve lançar ConflictException se o email já existir', async () => {
    const dto = {
      name: 'User',
      email: 'duplicado@email.com',
      password: '123',
      role: CreateUserRole.USER,
    };

    const loggedUser = {
      id: 'admin-id',
      role: CreateUserRole.ADMIN,
    };

    const existingUser = User.fromPersistence({
      id: 'existing-id',
      name: 'Existing',
      email: dto.email,
      password: 'hashed',
      role: 'USER',
      isActive: true,
      lastAccess: null,
      createdAt: new Date(),
      updatedAt: null,
    });

    usersRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(useCase.execute(dto, loggedUser)).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(usersRepository.save).not.toHaveBeenCalled();
  });
});
