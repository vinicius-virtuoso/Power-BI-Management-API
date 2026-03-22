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

export class ActivateReportUseCase {
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

    const reportActivated = await this.reportsRepository.activate(
      reportFound.activate(),
    );

    if (!reportActivated) {
      throw new BadRequestException('Erro ao ativar o relatório');
    }

    return reportActivated?.toView();
  }
}
