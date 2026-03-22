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
      throw new ForbiddenException(
        'Você não tem permissão para acessa este recurso',
      );
    }

    const authResponse = await this.powerBiRepository.authenticate();

    if ('statusCode' in authResponse) {
      throw new UnauthorizedException(
        `Falha na autenticação: ${authResponse.statusCode}`,
      );
    }

    const [powerBiReports, dbReports] = await Promise.all([
      this.powerBiRepository.listReports(authResponse.access_token),
      this.reportsRepository.findAll(),
    ]);

    const dbExternalIds = new Set(dbReports.map((r) => r.externalId));
    const pbiExternalIds = new Set(powerBiReports.map((r) => r.externalId));

    const reportsToCreate = powerBiReports
      .filter((pbi) => !dbExternalIds.has(pbi.externalId))
      .map((pbi) => Report.create({ ...pbi, isActive: true }));

    const reportsToDeactivate = dbReports
      .filter((db) => db.isActive && !pbiExternalIds.has(db.externalId))
      .map((db) => db.deactivate());

    await Promise.all([
      ...reportsToCreate.map((r) => this.reportsRepository.save(r)),
      ...reportsToDeactivate.map((r) => this.reportsRepository.deactivate(r)),
    ]);

    const finalReports = await this.reportsRepository.findAll();

    return {
      total: finalReports.length,
      reports: finalReports.map((r) => r.toView()),
    };
  }
}
