import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { ScheduleReportView } from '../entities/schedule-report.entity';
import type { ScheduleReportsRepository } from '../repositories/schedule-reports.repository';
import { SCHEDULE_REPORTS_REPOSITORY } from '../schedule-reports.providers';

@Injectable()
export class FindByReportIdUseCase {
  constructor(
    @Inject(SCHEDULE_REPORTS_REPOSITORY)
    private readonly scheduleRepository: ScheduleReportsRepository,
  ) {}

  async execute(
    reportId: string,
    loggedUser: LoggedUserProps,
  ): Promise<ScheduleReportView> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException();
    }

    const schedule = await this.scheduleRepository.findByReportId(reportId);

    if (!schedule) {
      throw new NotFoundException('No schedule found for this report');
    }

    return schedule.toView();
  }
}
