import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  POWER_BI_REPOSITORY,
  REPORTS_REPOSITORY,
} from '../../reports/reports.providers';
import { CheckReportRefreshStatusUseCase } from './check-report-refresh-status.usecase';

describe('CheckReportRefreshStatusUseCase', () => {
  let useCase: CheckReportRefreshStatusUseCase;
  let reportsRepo: any;
  let pbiRepo: any;

  // Fábrica de Mocks para manter o estado limpo entre testes
  const createMockReport = (overrides = {}) => ({
    id: 'report-123',
    datasetId: 'dataset-456',
    activate: true,
    lastUpdateEnd: jest.fn().mockReturnThis(),
    toView: jest.fn().mockReturnValue({ id: 'report-123', status: 'View' }),
    ...overrides,
  });

  const ADMIN = { id: 'u1', role: 'ADMIN' };
  const USER = { id: 'u2', role: 'USER' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckReportRefreshStatusUseCase,
        {
          provide: REPORTS_REPOSITORY,
          useValue: { findById: jest.fn(), update: jest.fn() },
        },
        {
          provide: POWER_BI_REPOSITORY,
          useValue: {
            authenticate: jest.fn(),
            getLatestRefreshStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(CheckReportRefreshStatusUseCase);
    reportsRepo = module.get(REPORTS_REPOSITORY);
    pbiRepo = module.get(POWER_BI_REPOSITORY);
  });

  // Helper para setup rápido de sucesso
  const setupSuccessPath = (report = createMockReport()) => {
    reportsRepo.findById.mockResolvedValue(report);
    pbiRepo.authenticate.mockResolvedValue({ access_token: 'valid-tk' });
    return report;
  };

  describe('Permissões e Validações Iniciais', () => {
    it('deve barrar usuários não-ADMIN', async () => {
      await expect(useCase.execute('id', USER as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve falhar se relatório não existir ou estiver inativo', async () => {
      reportsRepo.findById
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createMockReport({ activate: false }));

      await expect(useCase.execute('id', ADMIN as any)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute('id', ADMIN as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Integração Power BI', () => {
    it('deve lançar Unauthorized se a autenticação falhar', async () => {
      reportsRepo.findById.mockResolvedValue(createMockReport());
      pbiRepo.authenticate.mockResolvedValue({ statusCode: 401 });

      await expect(useCase.execute('id', ADMIN as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve tratar erro 404 (Dataset não encontrado) do Power BI', async () => {
      setupSuccessPath();
      pbiRepo.getLatestRefreshStatus.mockResolvedValue({ statusCode: 404 });

      await expect(useCase.execute('id', ADMIN as any)).rejects.toThrow(
        new NotFoundException(
          'Conjunto de dados não encontrado no espaço de trabalho do Power BI',
        ),
      );
    });

    it('deve retornar View original se a API do Power BI retornar erro 500', async () => {
      const report = setupSuccessPath();
      pbiRepo.getLatestRefreshStatus.mockResolvedValue({ statusCode: 500 });

      const result = await useCase.execute('id', ADMIN as any);
      expect(result).toEqual(report.toView());
      expect(reportsRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('Lógica de Atualização de Refresh', () => {
    const testCases = [
      { status: 'Completed', shouldUpdate: true },
      { status: 'Failed', shouldUpdate: true, error: 'API Error' },
      { status: 'Unknown', shouldUpdate: false },
    ];

    test.each(testCases)(
      'quando status for "$status", deve atualizar=$shouldUpdate',
      async ({ status, shouldUpdate, error }) => {
        const report = setupSuccessPath();
        const endTime = new Date().toISOString();
        pbiRepo.getLatestRefreshStatus.mockResolvedValue({
          status,
          endTime,
          error: error || null,
        });

        const result = await useCase.execute('id', ADMIN as any);

        if (shouldUpdate) {
          expect(report.lastUpdateEnd).toHaveBeenCalledWith(
            endTime,
            error || null,
          );
          expect(reportsRepo.update).toHaveBeenCalled();
        } else {
          expect(reportsRepo.update).not.toHaveBeenCalled();
        }
        expect(result).toEqual(report.toView());
      },
    );
  });
});
