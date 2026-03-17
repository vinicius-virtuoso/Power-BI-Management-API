import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { type ReportView } from '../../reports/entities/report.entity';
import { REPORTS_REPOSITORY } from '../../reports/reports.providers';
import type { ReportsRepository } from '../../reports/repositories/reports.repository';
import type { UsersRepository } from '../../users/repositories/users.repository';
import { USERS_REPOSITORY } from '../../users/users.providers';
import type { UserReportRepository } from '../repositories/user-report.repository';
import { USER_REPORT_REPOSITORY } from '../user-report.provider';

export type PaginatedResult = {
  total: number;
  reports: ReportView[];
};

@Injectable()
export class FindAllReportsUseCase {
  constructor(
    @Inject(USER_REPORT_REPOSITORY)
    private readonly userReportsRepository: UserReportRepository,

    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepository,

    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(userId: string): Promise<PaginatedResult> {
    if (!userId) {
      throw new UnauthorizedException('Não autorizado ou a sessão expirou');
    }

    const userFound = await this.usersRepository.findById(userId);

    if (!userFound) {
      throw new UnauthorizedException('Não autorizado ou a sessão expirou');
    }

    if (userFound.role !== 'ADMIN') {
      const userReports = await this.userReportsRepository.findByUser(userId);

      if (userReports.length === 0) {
        return { total: 0, reports: [] };
      }

      const reportIds = userReports.map((ur) => ur.reportId);
      const reports = await this.reportsRepository.findByIds(reportIds);
      const onlyActive = reports
        .map((r) => r.toView())
        .filter((report) => report.isActive === true);

      return {
        total: onlyActive.length,
        reports: onlyActive,
      };
    }

    const reportAll = await this.reportsRepository.findAll();

    return {
      total: reportAll.length,
      reports: reportAll.map((report) => report.toView()),
    };
  }
}
