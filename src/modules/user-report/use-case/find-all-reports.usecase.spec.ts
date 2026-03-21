import { UnauthorizedException } from '@nestjs/common';
import { Report } from '../../reports/entities/report.entity';
import { UserReport } from '../entities/user-report.entity';
import { FindAllReportsUseCase } from './find-all-reports.usecase';

describe('FindAllReportsUseCase', () => {
  let useCase: FindAllReportsUseCase;
  let userReportRepository: any;
  let reportsRepository: any;
  let usersRepository: any;

  beforeEach(() => {
    userReportRepository = { findByUser: jest.fn() };
    reportsRepository = {
      findAll: jest.fn(),
      findByIds: jest.fn(),
      findById: jest.fn(),
    };
    usersRepository = { findById: jest.fn() };
    useCase = new FindAllReportsUseCase(
      userReportRepository,
      reportsRepository,
      usersRepository,
    );
  });

  it('deve retornar total zero quando USER não possui relatórios vinculados', async () => {
    usersRepository.findById.mockResolvedValue({ id: 'u-1', role: 'USER' });
    userReportRepository.findByUser.mockResolvedValue([]);

    const result = await useCase.execute('u-1');

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

    usersRepository.findById.mockResolvedValue({ id: 'u-1', role: 'USER' });
    userReportRepository.findByUser.mockResolvedValue(userReports);
    reportsRepository.findByIds.mockResolvedValue(reports);

    const result = await useCase.execute('u-1');

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

    usersRepository.findById.mockResolvedValue({
      id: 'admin-id',
      role: 'ADMIN',
    });
    reportsRepository.findAll.mockResolvedValue(reports);

    const result = await useCase.execute('admin-id');

    expect(result.total).toBe(2);
    expect(result.reports).toHaveLength(2);
  });

  it('deve lançar UnauthorizedException se o userId não for fornecido', async () => {
    await expect(useCase.execute('')).rejects.toThrow(UnauthorizedException);
    await expect(useCase.execute(null as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('deve lançar UnauthorizedException se o usuário não for encontrado no banco', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('id-inexistente')).rejects.toThrow(
      'Não autorizado ou a sessão expirou',
    );
  });
});
