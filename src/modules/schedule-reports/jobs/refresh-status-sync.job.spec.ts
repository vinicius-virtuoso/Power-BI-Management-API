import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CheckReportRefreshStatusUseCase } from '../../refresh-dataset/use-cases/check-report-refresh-status.usecase';
import { REPORTS_REPOSITORY } from '../../reports/reports.providers';
import { RefreshStatusSyncJob } from './refresh-status-sync.job';

describe('RefreshStatusSyncJob', () => {
  let job: RefreshStatusSyncJob;
  let reportsRepository: any;
  let checkStatusUseCase: CheckReportRefreshStatusUseCase;

  const mockActiveReports = [
    { id: 'report-1', name: 'Relatório Financeiro', activate: true },
    { id: 'report-2', name: 'Relatório de Vendas', activate: true },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshStatusSyncJob,
        {
          provide: REPORTS_REPOSITORY,
          useValue: {
            findAllActive: jest.fn(),
          },
        },
        {
          provide: CheckReportRefreshStatusUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    job = module.get<RefreshStatusSyncJob>(RefreshStatusSyncJob);
    reportsRepository = module.get(REPORTS_REPOSITORY);
    checkStatusUseCase = module.get(CheckReportRefreshStatusUseCase);
  });

  it('deve ser definido', () => {
    expect(job).toBeDefined();
  });

  it('deve sincronizar o status de todos os relatórios ativos retornados', async () => {
    reportsRepository.findAllActive.mockResolvedValue(mockActiveReports);

    await job.handleStatusSync();

    expect(reportsRepository.findAllActive).toHaveBeenCalled();
    expect(checkStatusUseCase.execute).toHaveBeenCalledTimes(2);

    expect(checkStatusUseCase.execute).toHaveBeenCalledWith('report-1', {
      id: 'system-sync',
      role: 'ADMIN',
    });
    expect(checkStatusUseCase.execute).toHaveBeenCalledWith('report-2', {
      id: 'system-sync',
      role: 'ADMIN',
    });
  });

  it('deve continuar o processamento mesmo se a sincronização de um relatório falhar', async () => {
    reportsRepository.findAllActive.mockResolvedValue(mockActiveReports);

    (checkStatusUseCase.execute as jest.Mock)
      .mockRejectedValueOnce(new Error('Power BI API error'))
      .mockResolvedValueOnce({});

    const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

    await job.handleStatusSync();

    expect(checkStatusUseCase.execute).toHaveBeenCalledTimes(2);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Error syncing report report-1: Power BI API error',
      ),
    );
  });

  it('não deve chamar o use case se não houver relatórios ativos', async () => {
    reportsRepository.findAllActive.mockResolvedValue([]);

    await job.handleStatusSync();

    expect(checkStatusUseCase.execute).not.toHaveBeenCalled();
  });
});
