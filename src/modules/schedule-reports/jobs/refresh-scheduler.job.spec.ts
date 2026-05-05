import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RefreshDatasetReportUseCase } from '../../refresh-dataset/use-cases/refresh-dataset-report.usecase';
import { REPORTS_REPOSITORY } from '../../reports/reports.providers';
import { RefreshSchedulerJob } from '../jobs/refresh-scheduler.job';
import { FindAllScheduleUseCase } from '../use-cases/find-all-schedule.usecase';

describe('RefreshSchedulerJob', () => {
  let job: RefreshSchedulerJob;
  let findAllSchedules: jest.Mocked<FindAllScheduleUseCase>;
  let refreshDatasetUseCase: jest.Mocked<RefreshDatasetReportUseCase>;
  let reportsRepository: any;

  const mockSchedule = {
    reportId: 'report-1',
    isActive: true,
    isClosingDays: false,
    hoursCommon: ['09:00', '14:00'],
    hoursClosingDays: ['18:00'],
    closingDays: ['05'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshSchedulerJob,
        {
          provide: FindAllScheduleUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RefreshDatasetReportUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: REPORTS_REPOSITORY,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    job = module.get<RefreshSchedulerJob>(RefreshSchedulerJob);
    findAllSchedules = module.get(FindAllScheduleUseCase) as any;
    refreshDatasetUseCase = module.get(RefreshDatasetReportUseCase) as any;
    reportsRepository = module.get(REPORTS_REPOSITORY);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('deve disparar atualização se a hora atual estiver nos agendamentos comuns', async () => {
    const fakeNow = new Date(2026, 0, 1, 9, 0, 0);
    jest.useFakeTimers().setSystemTime(fakeNow);

    findAllSchedules.execute.mockResolvedValue({
      schedules: [mockSchedule],
    } as any);

    reportsRepository.findById.mockResolvedValue({
      id: 'report-1',
      isActive: true,
      lastUpdate: new Date(2026, 0, 1, 7, 0, 0),
    });

    await job.handleRefreshAggregation();

    expect(refreshDatasetUseCase.execute).toHaveBeenCalledWith('report-1', {
      id: 'system-cron',
      role: 'ADMIN',
      email: 'system-cron@example.com',
    });
  });

  it('deve usar as horas de fechamento se for dia de fechamento', async () => {
    const fakeNow = new Date(2026, 0, 5, 18, 0, 0);
    jest.useFakeTimers().setSystemTime(fakeNow);

    const closingSchedule = {
      ...mockSchedule,
      isClosingDays: true,
      closingDays: ['05'],
      hoursClosingDays: ['18:00'],
    };

    findAllSchedules.execute.mockResolvedValue({
      schedules: [closingSchedule],
    } as any);

    reportsRepository.findById.mockResolvedValue({
      id: 'report-1',
      isActive: true,
      lastUpdate: new Date(2026, 0, 4, 18, 0, 0),
    });

    await job.handleRefreshAggregation();

    expect(refreshDatasetUseCase.execute).toHaveBeenCalledWith('report-1', {
      id: 'system-cron',
      role: 'ADMIN',
      email: 'system-cron@example.com',
    });
  });

  it('deve ignorar o disparo se a última atualização foi no mesmo slot (HH:mm)', async () => {
    const fakeNow = new Date(2026, 0, 1, 9, 0, 0);
    jest.useFakeTimers().setSystemTime(fakeNow);

    findAllSchedules.execute.mockResolvedValue({
      schedules: [mockSchedule],
    } as any);

    reportsRepository.findById.mockResolvedValue({
      id: 'report-1',
      isActive: true,
      lastUpdate: new Date(2026, 0, 1, 9, 0, 0),
    });

    await job.handleRefreshAggregation();

    expect(refreshDatasetUseCase.execute).not.toHaveBeenCalled();
  });

  it('deve disparar no slot :30 quando o horário estiver agendado', async () => {
    const fakeNow = new Date(2026, 0, 1, 9, 30, 0);
    jest.useFakeTimers().setSystemTime(fakeNow);

    const halfHourSchedule = {
      ...mockSchedule,
      hoursCommon: ['09:30'],
    };

    findAllSchedules.execute.mockResolvedValue({
      schedules: [halfHourSchedule],
    } as any);

    reportsRepository.findById.mockResolvedValue({
      id: 'report-1',
      isActive: true,
      lastUpdate: new Date(2026, 0, 1, 8, 0, 0),
    });

    await job.handleRefreshAggregation();

    expect(refreshDatasetUseCase.execute).toHaveBeenCalledWith('report-1', {
      id: 'system-cron',
      role: 'ADMIN',
      email: 'system-cron@example.com',
    });
  });
  it('deve ignorar o agendamento se o relatório estiver desativado no repositório', async () => {
    const fakeNow = new Date(2026, 0, 1, 9, 0, 0);
    jest.useFakeTimers().setSystemTime(fakeNow);

    findAllSchedules.execute.mockResolvedValue({
      schedules: [mockSchedule],
    } as any);

    reportsRepository.findById.mockResolvedValue({
      id: 'report-1',
      isActive: false,
    });

    await job.handleRefreshAggregation();

    expect(refreshDatasetUseCase.execute).not.toHaveBeenCalled();
  });

  it('deve ignorar se a hora atual não estiver inclusa nos horários agendados', async () => {
    const fakeNow = new Date(2026, 0, 1, 10, 0, 0);
    jest.useFakeTimers().setSystemTime(fakeNow);

    findAllSchedules.execute.mockResolvedValue({
      schedules: [mockSchedule],
    } as any);

    await job.handleRefreshAggregation();

    expect(reportsRepository.findById).not.toHaveBeenCalled();
    expect(refreshDatasetUseCase.execute).not.toHaveBeenCalled();
  });

  it('deve capturar e logar erro se o RefreshDatasetReportUseCase falhar', async () => {
    const fakeNow = new Date(2026, 0, 1, 9, 0, 0);
    jest.useFakeTimers().setSystemTime(fakeNow);

    findAllSchedules.execute.mockResolvedValue({
      schedules: [mockSchedule],
    } as any);

    reportsRepository.findById.mockResolvedValue({
      id: 'report-1',
      isActive: true,
    });

    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    refreshDatasetUseCase.execute.mockRejectedValue(new Error('API Offline'));

    await job.handleRefreshAggregation();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Erro ao atualizar relatório report-1: API Offline',
      ),
    );
  });

  it('deve pular o agendamento se ele estiver inativo (Linha 38)', async () => {
    const fakeNow = new Date(2026, 0, 1, 9, 0, 0);
    jest.useFakeTimers().setSystemTime(fakeNow);

    const inactiveSchedule = { ...mockSchedule, isActive: false };

    findAllSchedules.execute.mockResolvedValue({
      schedules: [inactiveSchedule],
    } as any);

    await job.handleRefreshAggregation();

    expect(reportsRepository.findById).not.toHaveBeenCalled();
    expect(refreshDatasetUseCase.execute).not.toHaveBeenCalled();
  });

  it('deve logar aviso e pular se o relatório não for encontrado (null)', async () => {
    const fakeNow = new Date(2026, 0, 1, 9, 0, 0);
    jest.useFakeTimers().setSystemTime(fakeNow);

    findAllSchedules.execute.mockResolvedValue({
      schedules: [mockSchedule],
    } as any);

    reportsRepository.findById.mockResolvedValue(null);
    const warnSpy = jest.spyOn(Logger.prototype, 'warn');

    await job.handleRefreshAggregation();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Agendamento pulado: Relatório report-1 inativo ou não encontrado.',
      ),
    );
    expect(refreshDatasetUseCase.execute).not.toHaveBeenCalled();
  });

  it('deve disparar atualização se for a mesma hora e dia mas MESES diferentes', async () => {
    const fakeNow = new Date(2026, 1, 1, 9, 0, 0);
    jest.useFakeTimers().setSystemTime(fakeNow);

    findAllSchedules.execute.mockResolvedValue({
      schedules: [mockSchedule],
    } as any);

    reportsRepository.findById.mockResolvedValue({
      id: 'report-1',
      isActive: true,
      lastUpdate: new Date(2026, 0, 1, 9, 0, 0),
    });

    await job.handleRefreshAggregation();

    expect(refreshDatasetUseCase.execute).toHaveBeenCalled();
  });
});
