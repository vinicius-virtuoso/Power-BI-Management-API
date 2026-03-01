import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import { PowerBiRepository } from '../../power-bi/power-bi.repository';
import {
  POWER_BI_REPOSITORY,
  REPORTS_REPOSITORY,
} from '../../reports/reports.providers';
import { ReportsRepository } from './../../reports/repositories/reports.repository';

@Injectable()
export class RefreshDatasetReportUseCase {
  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepository,

    @Inject(POWER_BI_REPOSITORY)
    private readonly powerBiRepository: PowerBiRepository,
  ) {}

  async execute(reportId: string, loggedUser: LoggedUserProps): Promise<void> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException();
    }

    const reportFound = await this.reportsRepository.findById(reportId);

    if (!reportFound || !reportFound.activate) {
      throw new NotFoundException('Report not found or inactive');
    }

    const powerBiToken = await this.powerBiRepository.authenticate();

    if (!powerBiToken) {
      throw new UnauthorizedException();
    }

    const refreshReport = await this.powerBiRepository.triggerDatasetRefresh(
      powerBiToken,
      reportFound.datasetId,
    );

    if (refreshReport.statusCode === 400) {
      throw new BadRequestException(
        'Another refresh request is already executing',
      );
    }
  }
}
