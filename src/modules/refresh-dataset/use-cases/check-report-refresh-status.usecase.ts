import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { PowerBiRepository } from '../../power-bi/power-bi.repository';
import type { ReportView } from '../../reports/entities/report.entity';
import {
  POWER_BI_REPOSITORY,
  REPORTS_REPOSITORY,
} from '../../reports/reports.providers';
import type { ReportsRepository } from '../../reports/repositories/reports.repository';

@Injectable()
export class CheckReportRefreshStatusUseCase {
  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepository,

    @Inject(POWER_BI_REPOSITORY)
    private readonly powerBiRepository: PowerBiRepository,
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

    if (!reportFound || !reportFound.activate) {
      throw new NotFoundException('Relatório não encontrado ou inativo');
    }

    const powerBiToken = await this.powerBiRepository.authenticate();

    if ('statusCode' in powerBiToken) {
      throw new UnauthorizedException(
        `Falha na autenticação com o Power BI: ${powerBiToken.statusCode}`,
      );
    }

    const remoteStatus = await this.powerBiRepository.getLatestRefreshStatus(
      powerBiToken.access_token,
      reportFound.datasetId,
    );

    if ('statusCode' in remoteStatus) {
      if (remoteStatus.statusCode === 404) {
        throw new NotFoundException(
          'Conjunto de dados não encontrado no espaço de trabalho do Power BI',
        );
      }

      return reportFound.toView();
    }

    if (
      remoteStatus.error ||
      remoteStatus.status === 'Completed' ||
      remoteStatus.status === 'Failed'
    ) {
      const endTime = remoteStatus.endTime;
      const reportUpdated = reportFound.lastUpdateEnd(
        endTime,
        remoteStatus.error ?? null,
      );
      await this.reportsRepository.update(reportUpdated);
      return reportUpdated.toView();
    } else {
      return reportFound.toView();
    }
  }
}
