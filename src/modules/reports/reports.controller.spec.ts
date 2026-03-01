import { ForbiddenException } from '@nestjs/common';
import type { LoggedUserProps } from '../../shared/types/logged-user.types';
import { Report } from './entities/report.entity';
import { ReportsController } from './reports.controller';
import { ActivateReportUseCase } from './use-cases/activate-report.usecase';
import { DeactivateReportUseCase } from './use-cases/deactivate-report.usecase';
import { DeleteReportUseCase } from './use-cases/delete-report.usecase';
import { SyncReportsPowerBIUseCase } from './use-cases/sync-reports-for-power-bi.use-case';

describe('ReportsController', () => {
  let controller: ReportsController;
  let syncReportsUseCase: jest.Mocked<SyncReportsPowerBIUseCase>;
  let activateReportUseCase: jest.Mocked<ActivateReportUseCase>;
  let deactivateReportUseCase: jest.Mocked<DeactivateReportUseCase>;
  let deleteReportUseCase: jest.Mocked<DeleteReportUseCase>;

  const loggedUser: LoggedUserProps = { id: 'admin', role: 'ADMIN' };

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

    deleteReportUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeleteReportUseCase>;

    controller = new ReportsController(
      syncReportsUseCase,
      activateReportUseCase,
      deactivateReportUseCase,
      deleteReportUseCase,
    );
  });

  it('deve chamar o use case de sincronização ao chamar create', async () => {
    const mockResult = { total: 2, reports: [] };
    syncReportsUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.create(loggedUser);

    expect(syncReportsUseCase.execute).toHaveBeenCalledWith(loggedUser);
    expect(result).toBe(mockResult);
  });

  it('deve chamar o use case de ativação ao chamar activate', async () => {
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

  it('deve chamar o use case de exclusão ao chamar delete', async () => {
    const reportId = 'report-delete';
    deleteReportUseCase.execute.mockResolvedValue(undefined);

    await controller.delete(reportId, loggedUser);

    expect(deleteReportUseCase.execute).toHaveBeenCalledWith(
      reportId,
      loggedUser,
    );
  });

  it('deve propagar exceção se o usuário não for ADMIN', async () => {
    const commonUser: LoggedUserProps = { id: 'user-1', role: 'USER' };
    syncReportsUseCase.execute.mockRejectedValue(new ForbiddenException());

    await expect(controller.create(commonUser)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
