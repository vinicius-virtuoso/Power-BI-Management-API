import { ForbiddenException } from '@nestjs/common';
import type { LoggedUserProps } from '../../shared/types/logged-user.types';
import { Report } from './entities/report.entity';
import { ReportsController } from './reports.controller';
import { ActivateReportUseCase } from './use-cases/activate-report.usecase';
import { DeactivateReportUseCase } from './use-cases/deactivate-report.usecase';
import { SyncReportsPowerBIUseCase } from './use-cases/sync-reports-for-power-bi.use-case';

describe('ReportsController', () => {
  let controller: ReportsController;
  let syncReportsUseCase: jest.Mocked<SyncReportsPowerBIUseCase>;
  let activateReportUseCase: jest.Mocked<ActivateReportUseCase>;
  let deactivateReportUseCase: jest.Mocked<DeactivateReportUseCase>;

  beforeEach(() => {
    syncReportsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SyncReportsPowerBIUseCase>;

    activateReportUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ActivateReportUseCase>;

    deactivateReportUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeactivateReportUseCase>;

    controller = new ReportsController(
      syncReportsUseCase,
      activateReportUseCase,
      deactivateReportUseCase,
    );
  });

  it('deve chamar o use case de sincronização ao chamar create', async () => {
    const loggedUser: LoggedUserProps = { id: 'admin', role: 'ADMIN' };
    const mockResult = { total: 2, reports: [] };
    syncReportsUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.create(loggedUser);

    expect(syncReportsUseCase.execute).toHaveBeenCalledWith(loggedUser);
    expect(result).toBe(mockResult);
  });

  it('deve chamar o use case de ativação ao chamar activate', async () => {
    const loggedUser: LoggedUserProps = { id: 'admin', role: 'ADMIN' };
    const reportId = 'report-1';
    const activatedReport = new Report(
      reportId,
      'ext-1',
      'Relatório 1',
      'webUrl',
      'embedUrl',
      'dataset-1',
      'workspace-1',
      true,
    );
    activateReportUseCase.execute.mockResolvedValue(activatedReport.toView());

    const result = await controller.activate(reportId, loggedUser);

    expect(activateReportUseCase.execute).toHaveBeenCalledWith(
      reportId,
      loggedUser,
    );
    expect(result).toEqual(activatedReport.toView());
  });

  it('deve chamar o use case de desativação ao chamar deactivate', async () => {
    const loggedUser: LoggedUserProps = { id: 'admin', role: 'ADMIN' };
    const reportId = 'report-2';
    const deactivatedReport = new Report(
      reportId,
      'ext-2',
      'Relatório 2',
      'webUrl',
      'embedUrl',
      'dataset-2',
      'workspace-2',
      false,
    );
    deactivateReportUseCase.execute.mockResolvedValue(
      deactivatedReport.toView(),
    );

    const result = await controller.deactivate(reportId, loggedUser);

    expect(deactivateReportUseCase.execute).toHaveBeenCalledWith(
      reportId,
      loggedUser,
    );
    expect(result).toEqual(deactivatedReport.toView());
  });

  it('deve propagar exceção se o usuário não for ADMIN', async () => {
    const loggedUser: LoggedUserProps = { id: 'user-1', role: 'USER' };
    syncReportsUseCase.execute.mockRejectedValue(new ForbiddenException());

    await expect(controller.create(loggedUser)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
