import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { UsersRepository } from '../repositories/users.repository';
import { UpdateUserUseCase } from './update-user.usecase';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    usersRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new UpdateUserUseCase(usersRepository);
  });

  it('deve atualizar o usuário quando o ator for ADMIN', async () => {
    const actor = { id: 'admin', role: 'ADMIN' };

    const target = {
      id: '1',
      email: 'old@email.com',
      updateByAdmin: jest.fn().mockReturnValue({ id: '1' }),
    };

    const persisted = {
      toView: jest.fn().mockReturnValue({
        id: '1',
        email: 'new@email.com',
        name: 'User',
        role: 'USER',
        isActive: true,
        lastAccess: null,
      }),
    };

    usersRepository.findById
      .mockResolvedValueOnce(actor as any)
      .mockResolvedValueOnce(target as any);

    usersRepository.findByEmail.mockResolvedValue(null);
    usersRepository.update.mockResolvedValue(persisted as any);

    const result = await useCase.execute(
      { email: 'new@email.com', password: '123' },
      '1',
      { id: 'admin', role: 'ADMIN' },
    );

    expect(target.updateByAdmin).toHaveBeenCalled();
    expect(usersRepository.update).toHaveBeenCalled();
    expect(result.email).toBe('new@email.com');
  });

  it('deve atualizar o próprio usuário quando o ator não for ADMIN', async () => {
    const actor = {
      id: '1',
      role: 'USER',
      updateProfile: jest.fn().mockReturnValue({ id: '1' }),
    };

    const target = actor;

    const persisted = {
      toView: jest.fn().mockReturnValue({
        id: '1',
        email: 'user@email.com',
        name: 'Updated',
        role: 'USER',
        isActive: true,
        lastAccess: null,
      }),
    };

    usersRepository.findById
      .mockResolvedValueOnce(actor as any)
      .mockResolvedValueOnce(target as any);

    usersRepository.update.mockResolvedValue(persisted as any);

    const result = await useCase.execute({ name: 'Updated' }, '1', {
      id: '1',
      role: 'USER',
    });

    expect(actor.updateProfile).toHaveBeenCalled();
    expect(result.name).toBe('Updated');
  });

  it('deve lançar ForbiddenException quando o usuário tentar atualizar outro usuário', async () => {
    const actor = { id: '1', role: 'USER' };
    const target = { id: '2' };

    usersRepository.findById
      .mockResolvedValueOnce(actor as any)
      .mockResolvedValueOnce(target as any);

    await expect(
      useCase.execute({ name: 'Hack' }, '2', { id: '1', role: 'USER' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('deve lançar BadRequestException quando o email já existir', async () => {
    const actor = { id: 'admin', role: 'ADMIN' };
    const target = { id: '1', email: 'old@email.com' };
    const emailOwner = { id: '2' };

    usersRepository.findById
      .mockResolvedValueOnce(actor as any)
      .mockResolvedValueOnce(target as any);

    usersRepository.findByEmail.mockResolvedValue(emailOwner as any);

    await expect(
      useCase.execute({ email: 'taken@email.com' }, '1', {
        id: 'admin',
        role: 'ADMIN',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deve lançar NotFoundException quando o ator não existir', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ name: 'Test' }, '1', { id: 'x', role: 'ADMIN' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deve lançar NotFoundException quando o usuário alvo não existir', async () => {
    const actor = { id: 'admin', role: 'ADMIN' };

    usersRepository.findById
      .mockResolvedValueOnce(actor as any)
      .mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ name: 'Test' }, '1', { id: 'admin', role: 'ADMIN' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deve lançar BadRequestException quando o update falhar', async () => {
    const actor = { id: 'admin', role: 'ADMIN' };
    const target = {
      id: '1',
      updateByAdmin: jest.fn().mockReturnValue({ id: '1' }),
    };

    usersRepository.findById
      .mockResolvedValueOnce(actor as any)
      .mockResolvedValueOnce(target as any);

    usersRepository.update.mockResolvedValue(null);

    await expect(
      useCase.execute({ name: 'Fail' }, '1', { id: 'admin', role: 'ADMIN' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
