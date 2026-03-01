import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { USERS_REPOSITORY } from '../users.providers';
import { AdminSeed } from './admin.seed';

jest.mock('bcrypt');

describe('AdminSeed', () => {
  let adminSeed: AdminSeed;
  let usersRepository: any;
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminSeed,
        {
          provide: USERS_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    adminSeed = module.get<AdminSeed>(AdminSeed);
    usersRepository = module.get(USERS_REPOSITORY);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('deve interromper o seed se ADMIN_EMAIL ou ADMIN_PASSWORD não estiverem definidos', async () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;

    await adminSeed.onApplicationBootstrap();

    expect(usersRepository.findByEmail).not.toHaveBeenCalled();
    expect(usersRepository.save).not.toHaveBeenCalled();
  });

  it('deve ignorar o seed se o administrador já existir no banco', async () => {
    process.env.ADMIN_EMAIL = 'admin@teste.com';
    process.env.ADMIN_PASSWORD = 'password123';

    usersRepository.findByEmail.mockResolvedValue({ id: 'existing-id' });

    await adminSeed.onApplicationBootstrap();

    expect(usersRepository.findByEmail).toHaveBeenCalledWith('admin@teste.com');
    expect(usersRepository.save).not.toHaveBeenCalled();
  });

  it('deve criar o administrador com sucesso quando não existir', async () => {
    process.env.ADMIN_EMAIL = 'new-admin@teste.com';
    process.env.ADMIN_PASSWORD = 'password123';
    process.env.ADMIN_NAME = 'Super Admin';

    usersRepository.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

    const userCreateSpy = jest.spyOn(User, 'create');

    await adminSeed.onApplicationBootstrap();

    expect(usersRepository.findByEmail).toHaveBeenCalledWith(
      'new-admin@teste.com',
    );
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(userCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new-admin@teste.com',
        name: 'Super Admin',
        role: 'ADMIN',
      }),
    );
    expect(usersRepository.save).toHaveBeenCalled();
  });

  it('deve usar o nome padrão "Administrator" se ADMIN_NAME não for fornecido', async () => {
    process.env.ADMIN_EMAIL = 'admin@teste.com';
    process.env.ADMIN_PASSWORD = 'password123';
    delete process.env.ADMIN_NAME;

    usersRepository.findByEmail.mockResolvedValue(null);
    const userCreateSpy = jest.spyOn(User, 'create');

    await adminSeed.onApplicationBootstrap();

    expect(userCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Administrator',
      }),
    );
  });
});
