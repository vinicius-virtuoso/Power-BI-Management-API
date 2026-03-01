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

  const mockLoggedUser = { id: 'admin-id', role: 'ADMIN' };

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

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks(); // Limpa o estado dos mocks entre os testes
  });

  it('deve delegar a busca do usuário logado (me) para o use case', async () => {
    const mockView = { id: 'user-1', name: 'John Doe', email: 'john@john.com' };
    findUserLoggedUseCase.execute.mockResolvedValue(mockView);

    const result = await controller.findUserLogged(mockLoggedUser as any);

    expect(findUserLoggedUseCase.execute).toHaveBeenCalledWith(mockLoggedUser);
    expect(result).toEqual(mockView);
  });

  it('deve delegar a criação de usuário para o use case', async () => {
    createUserUseCase.execute.mockResolvedValue({ id: '1' });
    const dto = {
      name: 'User',
      email: 'a@a.com',
      password: '123',
      role: 'USER',
    };

    const result = await controller.create(dto as any, mockLoggedUser as any);

    expect(createUserUseCase.execute).toHaveBeenCalledWith(dto, mockLoggedUser);
    expect(result.id).toBe('1');
  });

  it('deve delegar a listagem de usuários para o use case', async () => {
    findAllUsersUseCase.execute.mockResolvedValue([]);

    const result = await controller.findAll(mockLoggedUser as any);

    expect(findAllUsersUseCase.execute).toHaveBeenCalledWith(mockLoggedUser);
    expect(result).toEqual([]);
  });

  it('deve delegar a busca de um usuário específico para o use case', async () => {
    findOneUserUseCase.execute.mockResolvedValue({ id: 'user-1' });

    const result = await controller.findOne('user-1', mockLoggedUser as any);

    expect(findOneUserUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      mockLoggedUser,
    );
    expect(result.id).toBe('user-1');
  });

  it('deve delegar a atualização de usuário para o use case', async () => {
    updateUserUseCase.execute.mockResolvedValue({ id: 'user-1' });
    const dto = { name: 'Updated' };

    const result = await controller.update(
      dto as any,
      'user-1',
      mockLoggedUser as any,
    );

    expect(updateUserUseCase.execute).toHaveBeenCalledWith(
      dto,
      'user-1',
      mockLoggedUser,
    );
    expect(result.id).toBe('user-1');
  });

  it('deve delegar a ativação de usuário para o use case', async () => {
    activateUserUseCase.execute.mockResolvedValue({ id: '1' });

    const result = await controller.activate('1', mockLoggedUser as any);

    expect(activateUserUseCase.execute).toHaveBeenCalledWith(
      '1',
      mockLoggedUser,
    );
    expect(result.id).toBe('1');
  });

  it('deve delegar a desativação de usuário para o use case', async () => {
    deactivateUserUseCase.execute.mockResolvedValue({ id: '1' });

    const result = await controller.deactivate('1', mockLoggedUser as any);

    expect(deactivateUserUseCase.execute).toHaveBeenCalledWith(
      '1',
      mockLoggedUser,
    );
    expect(result.id).toBe('1');
  });

  it('deve delegar a exclusão de usuário para o use case', async () => {
    deleteUserUseCase.execute.mockResolvedValue(undefined);

    await controller.delete('1', mockLoggedUser as any);

    expect(deleteUserUseCase.execute).toHaveBeenCalledWith('1', mockLoggedUser);
  });
});
