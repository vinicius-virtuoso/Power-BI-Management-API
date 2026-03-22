import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { ReportView } from '../entities/report.entity';
import { REPORTS_REPOSITORY } from '../reports.providers';
import type { ReportsRepository } from './../repositories/reports.repository';

export class DeactivateReportUseCase {
  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepository,
  ) {}

  async execute(
    reportId: string,
    loggedUser: LoggedUserProps,
  ): Promise<ReportView> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Você não tem permissão para acessa este recurso',
      );
    }

    const reportFound = await this.reportsRepository.findById(reportId);

    if (!reportFound) {
      throw new NotFoundException('Relatório não encontrado');
    }

    const reportDeactivated = await this.reportsRepository.deactivate(
      reportFound.deactivate(),
    );

    if (!reportDeactivated) {
      throw new BadRequestException('Erro ao desativar o relatório');
    }

    return reportDeactivated?.toView();
  }
}
