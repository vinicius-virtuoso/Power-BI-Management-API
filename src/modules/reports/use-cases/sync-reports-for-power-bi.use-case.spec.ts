import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Report } from '../entities/report.entity';
import { SyncReportsPowerBIUseCase } from './sync-reports-for-power-bi.use-case';

describe('SyncReportsPowerBIUseCase', () => {
  let useCase: SyncReportsPowerBIUseCase;
  let reportsRepository: any;
  let powerBiRepository: any;

  const createReportMock = (overrides: Partial<any> = {}) => {
    return Report.create({
      externalId: 'ext-default',
      name: 'Default Name',
      embedUrl: 'http://embed',
      datasetId: 'ds-default',
      workspaceId: 'ws-default',
      webUrl: 'http://web',
      isActive: true,
      ...overrides, // Permite mudar apenas o que importa no teste
    });
  };

  beforeEach(() => {
    reportsRepository = {
      findAll: jest.fn(),
      findByExternalId: jest.fn(),
      save: jest.fn(),
      deactivate: jest.fn(),
    };

    powerBiRepository = {
      authenticate: jest.fn(),
      listReports: jest.fn(),
    };

    useCase = new SyncReportsPowerBIUseCase(
      reportsRepository,
      powerBiRepository,
    );
  });

  it('deve lançar ForbiddenException se o usuário não for ADMIN', async () => {
    await expect(useCase.execute({ id: '1', role: 'USER' })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('deve lançar UnauthorizedException se autenticação falhar', async () => {
    // CORREÇÃO: O mock deve retornar um objeto com statusCode para não quebrar o operador 'in'
    powerBiRepository.authenticate.mockResolvedValue({ statusCode: 401 });

    await expect(
      useCase.execute({ id: 'admin', role: 'ADMIN' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve sincronizar os relatórios corretamente', async () => {
    powerBiRepository.authenticate.mockResolvedValue({
      access_token: 'tk-123',
    });
    powerBiRepository.listReports.mockResolvedValue([
      {
        externalId: 'ext-1',
        name: 'R1',
        embedUrl: 'u1',
        datasetId: 'd1',
        workspaceId: 'w1',
        webUrl: 'web1',
      },
      {
        externalId: 'ext-2',
        name: 'R2',
        embedUrl: 'u2',
        datasetId: 'd2',
        workspaceId: 'w2',
        webUrl: 'web2',
      },
    ]);

    const dbReport1 = createReportMock({ externalId: 'ext-1', isActive: true });
    const dbReport3 = createReportMock({ externalId: 'ext-3', isActive: true });

    reportsRepository.findAll.mockResolvedValueOnce([dbReport1, dbReport3]);
    reportsRepository.findByExternalId.mockImplementation((id: string) =>
      id === 'ext-1' ? Promise.resolve(dbReport1) : Promise.resolve(null),
    );

    reportsRepository.findAll.mockResolvedValue([dbReport1, dbReport3]);

    await useCase.execute({ id: 'admin', role: 'ADMIN' });

    expect(reportsRepository.save).toHaveBeenCalled();
    expect(reportsRepository.deactivate).toHaveBeenCalled();
  });
});
