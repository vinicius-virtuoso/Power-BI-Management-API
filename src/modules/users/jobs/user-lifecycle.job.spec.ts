import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entities/user.entity';
import type { UsersRepository } from '../repositories/users.repository';
import { USERS_REPOSITORY } from '../users.providers';
import { UserLifecycleJob } from './user-lifecycle.job';

describe('UserLifecycleJob', () => {
  let job: UserLifecycleJob;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLifecycleJob,
        {
          provide: USERS_REPOSITORY,
          useValue: {
            findUsersInactiveSince: jest.fn(),
            updateMany: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
      ],
    }).compile();

    job = module.get(UserLifecycleJob);
    usersRepository = module.get(USERS_REPOSITORY);

    // jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  it('deve processar corretamente usuários para desativação e deleção em uma única query', async () => {
    const now = new Date();

    const userToDeactivate = User.fromPersistence({
      id: '1',
      email: 'active@test.com',
      name: 'User 1',
      password: 'any',
      role: 'USER',
      isActive: true,
      lastAccess: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 dias
      createdAt: new Date(),
      updatedAt: null,
    });

    const userToDelete = User.fromPersistence({
      id: '2',
      email: 'old@test.com',
      name: 'User 2',
      password: 'any',
      role: 'USER',
      isActive: false,
      lastAccess: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000), // 65 dias
      createdAt: new Date(),
      updatedAt: null,
    });

    usersRepository.findUsersInactiveSince.mockResolvedValue([
      userToDeactivate,
      userToDelete,
    ]);

    await job.handle();

    expect(usersRepository.findUsersInactiveSince).toHaveBeenCalledTimes(1);
    expect(usersRepository.updateMany).toHaveBeenCalledWith([
      expect.objectContaining({ id: '1', isActive: false }),
    ]);

    expect(usersRepository.deleteMany).toHaveBeenCalledWith(['2']);
  });

  it('deve ignorar usuários que não possuem ID ou lastAccess (Branches de segurança)', async () => {
    const invalidUser = User.create({
      email: 'no-id@test.com',
      name: 'No ID',
      password: 'any',
      role: 'USER',
    });

    usersRepository.findUsersInactiveSince.mockResolvedValue([invalidUser]);

    await job.handle();

    expect(usersRepository.updateMany).not.toHaveBeenCalled();
    expect(usersRepository.deleteMany).not.toHaveBeenCalled();
  });

  it('não deve chamar métodos bulk se as listas de processamento estiverem vazias', async () => {
    usersRepository.findUsersInactiveSince.mockResolvedValue([]);

    await job.handle();

    expect(usersRepository.updateMany).not.toHaveBeenCalled();
    expect(usersRepository.deleteMany).not.toHaveBeenCalled();
  });

  it('deve ignorar usuários sem data de acesso (Linha 34)', async () => {
    const userNoAccess = User.fromPersistence({
      id: 'id-qualquer',
      email: 'no-access@test.com',
      name: 'No Access',
      password: 'any',
      role: 'USER',
      isActive: true,
      lastAccess: null as any, // Força o nulo para testar a segurança
      createdAt: new Date(),
      updatedAt: null as any,
    });

    usersRepository.findUsersInactiveSince.mockResolvedValue([userNoAccess]);

    await job.handle();

    expect(usersRepository.updateMany).not.toHaveBeenCalled();
  });

  it('deve manter o usuário intacto se ele acessou recentemente (menos de 30 dias)', async () => {
    const now = new Date();
    const recentUser = User.fromPersistence({
      id: 'recent-id',
      email: 'recent@test.com',
      name: 'Recent User',
      password: 'any',
      role: 'USER',
      isActive: true,
      lastAccess: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Apenas 5 dias atrás
      createdAt: new Date(),
      updatedAt: null as any,
    });

    usersRepository.findUsersInactiveSince.mockResolvedValue([recentUser]);

    await job.handle();

    expect(usersRepository.updateMany).not.toHaveBeenCalled();
    expect(usersRepository.deleteMany).not.toHaveBeenCalled();
  });
});
