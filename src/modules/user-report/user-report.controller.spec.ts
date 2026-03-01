import type { LoggedUserProps } from '../../shared/types/logged-user.types';
import { CreateUserReportUseCase } from './use-case/create-user-report.usecase';
import { DeleteUserReportUseCase } from './use-case/delete-user-report.usecase';
import { FindAllReportsUseCase } from './use-case/find-all-reports.usecase';
import { FindOneUserReportUseCase } from './use-case/find-one-user-report.usecase';
import { GenerateTokenEmbedUseCase } from './use-case/generate-token-embed.usecase';
import { UserReportController } from './user-report.controller';

describe('UserReportController', () => {
  let controller: UserReportController;
  let createUserReportUseCase: jest.Mocked<CreateUserReportUseCase>;
  let deleteUserReportUseCase: jest.Mocked<DeleteUserReportUseCase>;
  let findAllReportsUseCase: jest.Mocked<FindAllReportsUseCase>;
  let findOneUserReportUseCase: jest.Mocked<FindOneUserReportUseCase>;
  let generateTokenEmbedUseCase: jest.Mocked<GenerateTokenEmbedUseCase>;

  beforeEach(() => {
    createUserReportUseCase = { execute: jest.fn() } as any;
    deleteUserReportUseCase = { execute: jest.fn() } as any;
    findAllReportsUseCase = { execute: jest.fn() } as any;
    findOneUserReportUseCase = { execute: jest.fn() } as any;
    generateTokenEmbedUseCase = { execute: jest.fn() } as any;

    controller = new UserReportController(
      createUserReportUseCase,
      findAllReportsUseCase,
      findOneUserReportUseCase,
      generateTokenEmbedUseCase,
      deleteUserReportUseCase,
    );
  });

  it('deve criar um relacionamento usuário-relatório', async () => {
    const loggedUser: LoggedUserProps = { id: '1', role: 'ADMIN' };
    const dto = { userId: '2', reportId: '10' };
    const result = { id: '100', ...dto };

    createUserReportUseCase.execute.mockResolvedValue(result);

    await expect(controller.create(dto, loggedUser)).resolves.toEqual(result);
    expect(createUserReportUseCase.execute).toHaveBeenCalledWith(
      dto,
      loggedUser,
    );
  });

  it('deve gerar token embed para um relatório', async () => {
    const loggedUser: LoggedUserProps = { id: '1', role: 'USER' };
    const reportId = '10';
    const result = { token: 'embed-token', expiration: '2026-01-01' };

    generateTokenEmbedUseCase.execute.mockResolvedValue(result);

    await expect(
      controller.generateToken(reportId, loggedUser),
    ).resolves.toEqual(result);
    expect(generateTokenEmbedUseCase.execute).toHaveBeenCalledWith(
      reportId,
      loggedUser,
    );
  });

  it('deve retornar todos os relatórios do usuário', async () => {
    const loggedUser: LoggedUserProps = { id: '1', role: 'USER' };
    const result = {
      total: 2,
      reports: [
        {
          id: '10',
          name: 'Relatório 1',
          externalId: 'ext-10',
          embedUrl: 'https://embed1.url',
          datasetId: 'ds-10',
          webUrl: 'https://web1.url',
          workspaceId: 'ws-10',
          isActive: true,
          lastUpdate: null,
          errors: null,
        },
        {
          id: '11',
          name: 'Relatório 2',
          externalId: 'ext-11',
          embedUrl: 'https://embed2.url',
          datasetId: 'ds-11',
          webUrl: 'https://web2.url',
          workspaceId: 'ws-11',
          isActive: true,
          lastUpdate: null,
          errors: null,
        },
      ],
    };

    findAllReportsUseCase.execute.mockResolvedValue(result);

    await expect(controller.findAll(loggedUser)).resolves.toEqual(result);
    expect(findAllReportsUseCase.execute).toHaveBeenCalledWith(loggedUser);
  });

  it('deve retornar um relatório específico', async () => {
    const loggedUser: LoggedUserProps = { id: '1', role: 'USER' };
    const reportId = '10';
    const result = {
      id: '10',
      name: 'Relatório Teste',
      externalId: 'ext-10',
      embedUrl: 'https://embed1.url',
      datasetId: 'ds-10',
      webUrl: 'https://web1.url',
      workspaceId: 'ws-10',
      isActive: true,
      lastUpdate: null,
      errors: null,
      token: 'embed-token',
      expiration: '2026-01-01T00:00:00Z',
    };

    findOneUserReportUseCase.execute.mockResolvedValue(result);

    await expect(controller.findOne(reportId, loggedUser)).resolves.toEqual(
      result,
    );
    expect(findOneUserReportUseCase.execute).toHaveBeenCalledWith(
      reportId,
      loggedUser,
    );
  });

  it('deve excluir um relacionamento usuário-relatório', async () => {
    const loggedUser: LoggedUserProps = { id: '1', role: 'ADMIN' };
    const dto = { userReportId: '100' };

    deleteUserReportUseCase.execute.mockResolvedValue(undefined);

    await expect(controller.delete(dto, loggedUser)).resolves.toBeUndefined();
    expect(deleteUserReportUseCase.execute).toHaveBeenCalledWith(
      dto,
      loggedUser,
    );
  });
});
