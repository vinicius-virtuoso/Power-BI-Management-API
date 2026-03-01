// src\modules\schedule-reports\jobs\refresh-scheduler.job.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshDatasetReportUseCase } from '../../refresh-dataset/use-cases/refresh-dataset-report.usecase';
import { REPORTS_REPOSITORY } from '../../reports/reports.providers';
import type { ReportsRepository } from '../../reports/repositories/reports.repository';
import { ClosingDays, Hours } from '../entities/schedule-report.entity';
import { FindAllScheduleUseCase } from '../use-cases/find-all-schedule.usecase';

@Injectable()
export class RefreshSchedulerJob {
  private readonly logger = new Logger(RefreshSchedulerJob.name);

  constructor(
    private readonly findAllSchedules: FindAllScheduleUseCase,
    private readonly refreshDatasetUseCase: RefreshDatasetReportUseCase,
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepository, // Injetado para checar o estado atual do report
  ) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'Atualização de relatórios',
    timeZone: 'America/Sao_Paulo',
  })
  async handleRefreshAggregation() {
    this.logger.log('Verificando agendamentos de atualização...');

    const schedulesResult = await this.findAllSchedules.execute({
      id: 'system-cron',
      role: 'ADMIN',
    });

    const now = new Date();
    const currentDay = now.getDate().toString().padStart(2, '0') as ClosingDays;
    const currentHour = now.getHours().toString().padStart(2, '0') as Hours;

    for (const schedule of schedulesResult.schedules) {
      if (!schedule.isActive) continue;

      const isClosingDay =
        schedule.isClosingDays && schedule.closingDays.includes(currentDay);
      const targetHours = isClosingDay
        ? schedule.hoursClosingDays
        : schedule.hoursCommon;

      if (targetHours.includes(currentHour)) {
        const report = await this.reportsRepository.findById(schedule.reportId);

        if (!report || !report.isActive) {
          this.logger.warn(
            `Schedule skipped: Report ${schedule.reportId} is inactive or not found.`,
          );
          continue;
        }

        if (report?.lastUpdate) {
          const lastUpdate = new Date(report.lastUpdate);

          const alreadyUpdatedThisHour =
            lastUpdate.getHours() === now.getHours() &&
            lastUpdate.getDate() === now.getDate() &&
            lastUpdate.getMonth() === now.getMonth();

          if (alreadyUpdatedThisHour) {
            this.logger.warn(
              `Job duplicado ignorado: Report ${report.name} já atualizado nesta hora.`,
            );
            continue;
          }
        }

        this.logger.log(
          `Iniciando atualização automática: Report ${schedule.reportId}`,
        );

        try {
          await this.refreshDatasetUseCase.execute(schedule.reportId, {
            id: 'system-cron',
            role: 'ADMIN',
          });
        } catch (error) {
          this.logger.error(
            `Erro ao atualizar report ${schedule.reportId}:`,
            error.message,
          );
        }
      }
    }
  }
}
