import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import {
  ScheduleReportView,
  type ScheduleReport,
} from '../entities/schedule-report.entity';
import type { ScheduleReportsRepository } from '../repositories/schedule-reports.repository';
import { SCHEDULE_REPORTS_REPOSITORY } from '../schedule-reports.providers';

export type PaginatedResult = {
  total: number;
  schedules: ScheduleReportView[];
};

@Injectable()
export class FindAllScheduleUseCase {
  constructor(
    @Inject(SCHEDULE_REPORTS_REPOSITORY)
    private readonly scheduleRepository: ScheduleReportsRepository,
  ) {}

  async execute(loggedUser: LoggedUserProps): Promise<PaginatedResult> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException();
    }

    const schedules = await this.scheduleRepository.findAll();

    const allSchedules = schedules.map((schedule: ScheduleReport) =>
      schedule.toView(),
    );

    return {
      total: allSchedules.length,
      schedules: allSchedules,
    };
  }
}
