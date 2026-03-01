import { Report } from '../../reports/entities/report.entity';
import { UserReport } from '../entities/user-report.entity';
import { FindAllReportsUseCase } from './find-all-reports.usecase';

describe('FindAllReportsUseCase', () => {
  let useCase: FindAllReportsUseCase;
  let userReportRepository: any;
  let reportsRepository: any;

  beforeEach(() => {
    userReportRepository = { findByUser: jest.fn() };
    reportsRepository = { findAll: jest.fn(), findByIds: jest.fn() };
    useCase = new FindAllReportsUseCase(
      userReportRepository,
      reportsRepository,
    );
  });

  it('deve retornar total zero quando USER não possui relatórios vinculados', async () => {
    userReportRepository.findByUser.mockResolvedValue([]);

    const result = await useCase.execute({ id: 'u-1', role: 'USER' });

    expect(result).toEqual({ total: 0, reports: [] });
  });

  it('deve filtrar inativos e ajustar o total quando for USER', async () => {
    const userReports = [
      UserReport.fromPersistence({
        id: 'ur-1',
        userId: 'u-1',
        reportId: 'r-1',
      }),
      UserReport.fromPersistence({
        id: 'ur-2',
        userId: 'u-1',
        reportId: 'r-2',
      }),
    ];

    const reports = [
      Report.fromPersistence({
        id: 'r-1',
        name: 'Ativo',
        isActive: true,
        externalId: 'e1',
        webUrl: 'w1',
        embedUrl: 'em1',
        datasetId: 'd1',
        workspaceId: 'ws1',
      }),
      Report.fromPersistence({
        id: 'r-2',
        name: 'Inativo',
        isActive: false,
        externalId: 'e2',
        webUrl: 'w2',
        embedUrl: 'em2',
        datasetId: 'd2',
        workspaceId: 'ws1',
      }),
    ];

    userReportRepository.findByUser.mockResolvedValue(userReports);
    reportsRepository.findByIds.mockResolvedValue(reports);

    const result = await useCase.execute({ id: 'u-1', role: 'USER' });

    expect(result.total).toBe(1);
    expect(result.reports).toHaveLength(1);
    expect(result.reports[0].id).toBe('r-1');
  });

  it('deve retornar todos os relatórios sem filtro de atividade quando for ADMIN', async () => {
    const reports = [
      Report.fromPersistence({
        id: 'r-1',
        name: 'Ativo',
        isActive: true,
        externalId: 'e1',
        webUrl: 'w1',
        embedUrl: 'em1',
        datasetId: 'd1',
        workspaceId: 'ws1',
      }),
      Report.fromPersistence({
        id: 'r-2',
        name: 'Inativo',
        isActive: false,
        externalId: 'e2',
        webUrl: 'w2',
        embedUrl: 'em2',
        datasetId: 'd2',
        workspaceId: 'ws1',
      }),
    ];

    reportsRepository.findAll.mockResolvedValue(reports);

    const result = await useCase.execute({ id: 'admin-id', role: 'ADMIN' });

    expect(result.total).toBe(2);
    expect(result.reports).toHaveLength(2);
  });
});
