import { ForbiddenException } from '@nestjs/common';
import type { UsersRepository } from '../repositories/users.repository';
import { FindAllUsersUseCase } from './find-all-users.usecase';

describe('FindAllUsersUseCase', () => {
  let useCase: FindAllUsersUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    usersRepository = {
      findAll: jest.fn(),
    } as any;

    useCase = new FindAllUsersUseCase(usersRepository);
  });

  it('deve retornar todos os usuários quando o usuário logado for ADMIN', async () => {
    const users = [
      {
        toView: jest.fn().mockReturnValue({
          id: '1',
          email: 'user1@email.com',
          name: 'User 1',
          role: 'USER',
          isActive: true,
          lastAccess: null,
        }),
      },
      {
        toView: jest.fn().mockReturnValue({
          id: '2',
          email: 'user2@email.com',
          name: 'User 2',
          role: 'ADMIN',
          isActive: true,
          lastAccess: null,
        }),
      },
    ];

    usersRepository.findAll.mockResolvedValue(users as any);

    const result = await useCase.execute({
      id: 'admin',
      role: 'ADMIN',
    });

    expect(usersRepository.findAll).toHaveBeenCalled();
    expect(result.users).toHaveLength(2);
    expect(result.users[0].email).toBe('user1@email.com');
    expect(result.users[1].email).toBe('user2@email.com');
  });

  it('deve lançar ForbiddenException quando o usuário logado não for ADMIN', async () => {
    await expect(
      useCase.execute({
        id: '1',
        role: 'USER',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
