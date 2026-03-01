import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { ScheduleReportsRepository } from '../repositories/schedule-reports.repository';
import { SCHEDULE_REPORTS_REPOSITORY } from '../schedule-reports.providers';

@Injectable()
export class DeleteScheduleUseCase {
  constructor(
    @Inject(SCHEDULE_REPORTS_REPOSITORY)
    private readonly scheduleRepository: ScheduleReportsRepository,
  ) {}

  async execute(id: string, loggedUser: LoggedUserProps): Promise<void> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException();
    }

    const scheduleExists = await this.scheduleRepository.findById(id);

    if (!scheduleExists) {
      throw new NotFoundException('Schedule not found');
    }

    await this.scheduleRepository.delete(id);
  }
}
