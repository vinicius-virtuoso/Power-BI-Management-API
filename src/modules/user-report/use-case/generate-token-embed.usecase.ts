import { Inject, Injectable } from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { PowerBiRepository } from '../../power-bi/power-bi.repository';
import type { PowerBiEmbedTokenResponse } from '../../power-bi/power-bi.types';
import { POWER_BI_REPOSITORY } from '../../reports/reports.providers';
import { ReportAccessService } from '../service/report-access/report-access.service';

@Injectable()
export class GenerateTokenEmbedUseCase {
  constructor(
    private readonly reportAccessService: ReportAccessService,

    @Inject(POWER_BI_REPOSITORY)
    private readonly powerBiRepository: PowerBiRepository,
  ) {}

  async execute(
    reportId: string,
    loggedUser: LoggedUserProps,
  ): Promise<PowerBiEmbedTokenResponse> {
    const report = await this.reportAccessService.validateAccess(
      reportId,
      loggedUser,
    );

    const accessToken = await this.powerBiRepository.authenticate();

    return this.powerBiRepository.generateEmbedToken(
      accessToken,
      report.externalId,
    );
  }
}
