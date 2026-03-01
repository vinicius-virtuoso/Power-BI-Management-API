import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import { Report } from '../entities/report.entity';
import type { ReportsRepository } from '../repositories/reports.repository';
import { DeactivateReportUseCase } from './deactivate-report.usecase';

describe('DeactivateReportUseCase', () => {
  let useCase: DeactivateReportUseCase;
  let reportsRepository: jest.Mocked<ReportsRepository>;

  beforeEach(() => {
    reportsRepository = {
      findById: jest.fn(),
      deactivate: jest.fn(),
    } as unknown as jest.Mocked<ReportsRepository>;

    useCase = new DeactivateReportUseCase(reportsRepository);
  });

  it('deve desativar o relatório quando o usuário for ADMIN', async () => {
    const report = Report.create({
      externalId: 'ext-1',
      name: 'Relatório 1',
      webUrl: 'webUrl',
      embedUrl: 'embedUrl',
      datasetId: 'ds-1',
      workspaceId: 'ws-1',
      isActive: true,
    });

    reportsRepository.findById.mockResolvedValue(report);
    reportsRepository.deactivate.mockResolvedValue(report.deactivate());

    const admin: LoggedUserProps = { id: 'admin', role: 'ADMIN' };
    const resultado = await useCase.execute('report-id', admin);

    expect(reportsRepository.findById).toHaveBeenCalledWith('report-id');
    expect(reportsRepository.deactivate).toHaveBeenCalled();
    expect(resultado.isActive).toBe(false);
  });

  it('deve lançar ForbiddenException se o usuário não for ADMIN', async () => {
    const user: LoggedUserProps = { id: 'user', role: 'USER' };
    await expect(useCase.execute('report-id', user)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('deve lançar NotFoundException se o relatório não for encontrado', async () => {
    reportsRepository.findById.mockResolvedValue(null);
    const admin: LoggedUserProps = { id: 'admin', role: 'ADMIN' };
    await expect(useCase.execute('report-id', admin)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deve lançar BadRequestException se ocorrer erro na desativação', async () => {
    const report = Report.create({
      externalId: 'ext-1',
      name: 'Relatório 1',
      webUrl: 'webUrl',
      embedUrl: 'embedUrl',
      datasetId: 'ds-1',
      workspaceId: 'ws-1',
      isActive: true,
    });

    reportsRepository.findById.mockResolvedValue(report);
    reportsRepository.deactivate.mockResolvedValue(null);

    const admin: LoggedUserProps = { id: 'admin', role: 'ADMIN' };
    await expect(useCase.execute('report-id', admin)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
