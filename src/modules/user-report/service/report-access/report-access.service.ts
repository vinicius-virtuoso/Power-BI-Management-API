import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../../shared/types/logged-user.types';
import type { ReportView } from '../../../reports/entities/report.entity';
import { REPORTS_REPOSITORY } from '../../../reports/reports.providers';
import type { ReportsRepository } from '../../../reports/repositories/reports.repository';
import type { UserReportRepository } from '../../repositories/user-report.repository';
import { USER_REPORT_REPOSITORY } from '../../user-report.provider';

@Injectable()
export class ReportAccessService {
  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepository,

    @Inject(USER_REPORT_REPOSITORY)
    private readonly userReportsRepository: UserReportRepository,
  ) {}

  async validateAccess(
    reportId: string,
    loggedUser: LoggedUserProps,
  ): Promise<ReportView> {
    const report = await this.reportsRepository.findById(reportId);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (loggedUser.role === 'ADMIN') {
      return report.toView();
    }

    if (report && !report.isActive) {
      throw new ForbiddenException('Report inactive');
    }

    const hasPermission = await this.userReportsRepository.findByUserReport(
      loggedUser.id,
      reportId,
    );

    if (!hasPermission) {
      throw new ForbiddenException();
    }

    return report.toView();
  }
}
