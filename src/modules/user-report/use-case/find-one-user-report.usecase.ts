import { Inject, Injectable } from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { PowerBiRepository } from '../../power-bi/power-bi.repository';
import type { ReportView } from '../../reports/entities/report.entity';
import { POWER_BI_REPOSITORY } from '../../reports/reports.providers';
import { ReportAccessService } from '../service/report-access/report-access.service';
import { PowerBiEmbedTokenResponse } from './../../power-bi/power-bi.types';

export type FindOneUserReportUseCaseResponse = ReportView &
  PowerBiEmbedTokenResponse;

@Injectable()
export class FindOneUserReportUseCase {
  constructor(
    private readonly reportAccessService: ReportAccessService,

    @Inject(POWER_BI_REPOSITORY)
    private readonly powerBiRepository: PowerBiRepository,
  ) {}

  async execute(
    reportId: string,
    loggedUser: LoggedUserProps,
  ): Promise<FindOneUserReportUseCaseResponse> {
    const report = await this.reportAccessService.validateAccess(
      reportId,
      loggedUser,
    );

    const accessToken = await this.powerBiRepository.authenticate();

    const embedConfig = await this.powerBiRepository.generateEmbedToken(
      accessToken,
      report.externalId,
    );

    return {
      ...report,
      ...embedConfig,
    };
  }
}
