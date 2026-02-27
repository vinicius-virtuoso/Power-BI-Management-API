import { Test, TestingModule } from '@nestjs/testing';
import { ActivateUserUseCase } from './use-cases/activate-user.usecase';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { DeactivateUserUseCase } from './use-cases/deactivate-user.usecase';
import { DeleteUserUseCase } from './use-cases/delete-user.usecase';
import { FindAllUsersUseCase } from './use-cases/find-all-users.usecase';
import { FindOneUserUseCase } from './use-cases/find-one-user.usecase';
import { FindUserLoggedUseCase } from './use-cases/find-user-logged.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  const createUserUseCase = { execute: jest.fn() };
  const findUserLoggedUseCase = { execute: jest.fn() };
  const findAllUsersUseCase = { execute: jest.fn() };
  const findOneUserUseCase = { execute: jest.fn() };
  const updateUserUseCase = { execute: jest.fn() };
  const activateUserUseCase = { execute: jest.fn() };
  const deactivateUserUseCase = { execute: jest.fn() };
  const deleteUserUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CreateUserUseCase, useValue: createUserUseCase },
        { provide: FindUserLoggedUseCase, useValue: findUserLoggedUseCase },
        { provide: FindAllUsersUseCase, useValue: findAllUsersUseCase },
        { provide: FindOneUserUseCase, useValue: findOneUserUseCase },
        { provide: UpdateUserUseCase, useValue: updateUserUseCase },
        { provide: ActivateUserUseCase, useValue: activateUserUseCase },
        { provide: DeactivateUserUseCase, useValue: deactivateUserUseCase },
        { provide: DeleteUserUseCase, useValue: deleteUserUseCase },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  it('deve delegar a criação de usuário para o use case', async () => {
    createUserUseCase.execute.mockResolvedValue({ id: '1' });

    const result = await controller.create(
      { name: 'User', email: 'a@a.com', password: '123', role: 'USER' } as any,
      { id: 'admin', role: 'ADMIN' },
    );

    expect(createUserUseCase.execute).toHaveBeenCalled();
    expect(result.id).toBe('1');
  });

  it('deve delegar a listagem de usuários para o use case', async () => {
    findAllUsersUseCase.execute.mockResolvedValue([]);

    const result = await controller.findAll({ id: 'admin', role: 'ADMIN' });

    expect(findAllUsersUseCase.execute).toHaveBeenCalledWith({
      id: 'admin',
      role: 'ADMIN',
    });
    expect(result).toEqual([]);
  });

  it('deve delegar a busca de um usuário para o use case', async () => {
    findOneUserUseCase.execute.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1', {
      id: 'admin',
      role: 'ADMIN',
    });

    expect(findOneUserUseCase.execute).toHaveBeenCalledWith('1', {
      id: 'admin',
      role: 'ADMIN',
    });
    expect(result.id).toBe('1');
  });

  it('deve delegar a atualização de usuário para o use case', async () => {
    updateUserUseCase.execute.mockResolvedValue({ id: '1' });

    const result = await controller.update({ name: 'Updated' } as any, '1', {
      id: 'admin',
      role: 'ADMIN',
    });

    expect(updateUserUseCase.execute).toHaveBeenCalled();
    expect(result.id).toBe('1');
  });

  it('deve delegar a ativação de usuário para o use case', async () => {
    activateUserUseCase.execute.mockResolvedValue({ id: '1' });

    const result = await controller.activate('1', {
      id: 'admin',
      role: 'ADMIN',
    });

    expect(activateUserUseCase.execute).toHaveBeenCalledWith('1', {
      id: 'admin',
      role: 'ADMIN',
    });
    expect(result.id).toBe('1');
  });

  it('deve delegar a desativação de usuário para o use case', async () => {
    deactivateUserUseCase.execute.mockResolvedValue({ id: '1' });

    const result = await controller.deactivate('1', {
      id: 'admin',
      role: 'ADMIN',
    });

    expect(deactivateUserUseCase.execute).toHaveBeenCalledWith('1', {
      id: 'admin',
      role: 'ADMIN',
    });
    expect(result.id).toBe('1');
  });

  it('deve delegar a exclusão de usuário para o use case', async () => {
    deleteUserUseCase.execute.mockResolvedValue(undefined);

    await controller.delete('1', {
      id: 'admin',
      role: 'ADMIN',
    });

    expect(deleteUserUseCase.execute).toHaveBeenCalledWith('1', {
      id: 'admin',
      role: 'ADMIN',
    });
  });
});
