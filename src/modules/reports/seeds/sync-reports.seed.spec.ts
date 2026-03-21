import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SyncReportsPowerBIUseCase } from '../use-cases/sync-reports-for-power-bi.use-case';
import { SyncReportsSeed } from './sync-reports.seed';

describe('SyncReportsSeed', () => {
  let seed: SyncReportsSeed;
  let syncReportsUseCase: SyncReportsPowerBIUseCase;

  const loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  const loggerErrorSpy = jest
    .spyOn(Logger.prototype, 'error')
    .mockImplementation();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncReportsSeed,
        {
          provide: SyncReportsPowerBIUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    seed = module.get<SyncReportsSeed>(SyncReportsSeed);
    syncReportsUseCase = module.get<SyncReportsPowerBIUseCase>(
      SyncReportsPowerBIUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(seed).toBeDefined();
  });

  it('deve executar a sincronização com sucesso no onModuleInit', async () => {
    const mockResult = { total: 10, reports: [] };
    const executeSpy = jest
      .spyOn(syncReportsUseCase, 'execute')
      .mockResolvedValue(mockResult as any);

    await seed.onModuleInit();

    expect(executeSpy).toHaveBeenCalledWith({
      id: 'system-auto-sync',
      role: 'ADMIN',
    });
    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Iniciando sincronização'),
    );
    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Sincronização concluída com sucesso! Total de relatórios: 10',
      ),
    );
  });

  it('deve capturar e logar um erro se a sincronização falhar', async () => {
    const errorMessage = 'Erro de conexão com Power BI';
    jest
      .spyOn(syncReportsUseCase, 'execute')
      .mockRejectedValue(new Error(errorMessage));

    await expect(seed.onModuleInit()).resolves.not.toThrow();

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `Falha na sincronização automática: ${errorMessage}`,
      ),
      expect.any(String),
    );
  });
});
