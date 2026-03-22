import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { USERS_REPOSITORY } from '../users.providers';
import { FindUserLoggedUseCase } from './find-user-logged.usecase';

describe('FindUserLoggedUseCase', () => {
  let useCase: FindUserLoggedUseCase;
  let usersRepository: any;

  const mockLoggedUser = {
    id: 'uuid-user-123',
    role: 'USER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserLoggedUseCase,
        {
          provide: USERS_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<FindUserLoggedUseCase>(FindUserLoggedUseCase);
    usersRepository = module.get(USERS_REPOSITORY);
  });

  it('deve retornar a view do usuário quando ele for encontrado no repositório', async () => {
    const mockUserEntity = {
      id: mockLoggedUser.id,
      name: 'John Doe',
      email: 'john@example.com',
      toView: jest.fn().mockReturnValue({
        id: mockLoggedUser.id,
        name: 'John Doe',
        email: 'john@example.com',
      }),
    };

    usersRepository.findById.mockResolvedValue(mockUserEntity);

    const result = await useCase.execute(mockLoggedUser as any);

    expect(usersRepository.findById).toHaveBeenCalledWith(mockLoggedUser.id);
    expect(mockUserEntity.toView).toHaveBeenCalled();
    expect(result).toEqual({
      id: mockLoggedUser.id,
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('deve lançar NotFoundException quando o usuário não existir no banco', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(mockLoggedUser as any)).rejects.toThrow(
      new NotFoundException('Usuário não encontrado'),
    );

    expect(usersRepository.findById).toHaveBeenCalledWith(mockLoggedUser.id);
  });
});
