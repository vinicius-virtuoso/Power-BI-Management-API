import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import { REPORTS_REPOSITORY } from '../../reports/reports.providers';
import type { ReportsRepository } from '../../reports/repositories/reports.repository';
import type { CreateScheduleReportDto } from '../dto/create-schedule-report.dto';
import {
  ScheduleReport,
  type ScheduleReportView,
} from '../entities/schedule-report.entity';
import type { ScheduleReportsRepository } from '../repositories/schedule-reports.repository';
import { SCHEDULE_REPORTS_REPOSITORY } from '../schedule-reports.providers';

@Injectable()
export class CreateScheduleUseCase {
  constructor(
    @Inject(SCHEDULE_REPORTS_REPOSITORY)
    private readonly scheduleReportsRepository: ScheduleReportsRepository,

    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepository,
  ) {}

  async execute(
    data: CreateScheduleReportDto,
    loggedUser: LoggedUserProps,
  ): Promise<ScheduleReportView> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Você não tem permissão para acessa este recurso',
      );
    }

    const reportFound = await this.reportsRepository.findById(data.reportId);

    if (!reportFound) {
      throw new NotFoundException('Relatório não encontrado');
    }

    const existingSchedule =
      await this.scheduleReportsRepository.findByReportId(data.reportId);

    if (existingSchedule) {
      throw new ConflictException(
        'Já existe um agendamento configurado para este relatório',
      );
    }

    const scheduleReport = ScheduleReport.create({
      reportId: data.reportId,
      hoursCommon: data.hoursCommon,
      isClosingDays: data.isClosingDays,
      closingDays: data.closingDays,
      hoursClosingDays: data.hoursClosingDays,
    });

    const createdSchedule =
      await this.scheduleReportsRepository.save(scheduleReport);

    return createdSchedule.toView();
  }
}
