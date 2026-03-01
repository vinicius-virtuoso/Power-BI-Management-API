import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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

    const powerBiToken = await this.powerBiRepository.authenticate();

    if ('statusCode' in powerBiToken) {
      throw new UnauthorizedException(
        `Failed to authenticate with Power BI: ${powerBiToken.statusCode}`,
      );
    }

    return this.powerBiRepository.generateEmbedToken(
      powerBiToken.access_token,
      report.externalId,
    );
  }
}
