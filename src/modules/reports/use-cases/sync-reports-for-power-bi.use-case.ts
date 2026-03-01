import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { PowerBiRepository } from '../../power-bi/power-bi.repository';
import { Report, type ReportView } from '../entities/report.entity';
import { POWER_BI_REPOSITORY, REPORTS_REPOSITORY } from '../reports.providers';
import type { ReportsRepository } from '../repositories/reports.repository';

export type PaginatedResult = {
  total: number;
  reports: ReportView[];
};

@Injectable()
export class SyncReportsPowerBIUseCase {
  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepository,

    @Inject(POWER_BI_REPOSITORY)
    private readonly powerBiRepository: PowerBiRepository,
  ) {}

  async execute(loggedUser: LoggedUserProps): Promise<PaginatedResult> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException();
    }

    const authenticatedToken = await this.powerBiRepository.authenticate();

    if (!authenticatedToken) {
      throw new UnauthorizedException(
        'Error authenticating with the Power BI API',
      );
    }

    const powerBiReports =
      await this.powerBiRepository.listReports(authenticatedToken);

    let dbReports = await this.reportsRepository.findAll();

    const powerBiExternalIds = new Set(
      powerBiReports.map((report) => report.externalId),
    );

    for (const externalReport of powerBiReports) {
      const reportFound = await this.reportsRepository.findByExternalId(
        externalReport.externalId,
      );

      if (!reportFound) {
        const report = Report.create({
          externalId: externalReport.externalId,
          name: externalReport.name,
          embedUrl: externalReport.embedUrl,
          datasetId: externalReport.datasetId,
          workspaceId: externalReport.workspaceId,
          webUrl: externalReport.webUrl,
          isActive: true,
        });

        await this.reportsRepository.save(report);
        continue;
      }
    }

    for (const dbReport of dbReports) {
      if (dbReport.isActive && !powerBiExternalIds.has(dbReport.externalId)) {
        await this.reportsRepository.deactivate(dbReport.deactivate());
      }
    }

    dbReports = await this.reportsRepository.findAll();

    return {
      total: dbReports.length,
      reports: dbReports.map((report) => report.toView()),
    };
  }
}
