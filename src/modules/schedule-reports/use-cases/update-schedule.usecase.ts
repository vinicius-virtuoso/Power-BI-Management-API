import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { UpdateScheduleReportDto } from '../dto/update-schedule-report.dto';
import { type ScheduleReportView } from '../entities/schedule-report.entity';
import type { ScheduleReportsRepository } from '../repositories/schedule-reports.repository';
import { SCHEDULE_REPORTS_REPOSITORY } from '../schedule-reports.providers';

@Injectable()
export class UpdateScheduleUseCase {
  constructor(
    @Inject(SCHEDULE_REPORTS_REPOSITORY)
    private readonly scheduleReportsRepository: ScheduleReportsRepository,
  ) {}

  async execute(
    id: string,
    data: UpdateScheduleReportDto,
    loggedUser: LoggedUserProps,
  ): Promise<ScheduleReportView> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException();
    }

    const scheduleFound = await this.scheduleReportsRepository.findById(id);

    if (!scheduleFound) {
      throw new NotFoundException('Schedule not found');
    }

    let updatedSchedule = scheduleFound.update({
      hoursCommon: data.hoursCommon,
      isClosingDays: data.isClosingDays,
      closingDays: data.closingDays,
      hoursClosingDays: data.hoursClosingDays,
    });

    if (data.isActive !== undefined) {
      updatedSchedule = data.isActive
        ? updatedSchedule.activate()
        : updatedSchedule.deactivate();
    }

    const savedSchedule =
      await this.scheduleReportsRepository.update(updatedSchedule);

    return savedSchedule.toView();
  }
}
