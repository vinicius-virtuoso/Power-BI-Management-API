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
    private readonly reportsRepository: ReportsRepository,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, {
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

    const minutesSlot = (Math.floor(now.getMinutes() / 15) * 15)
      .toString()
      .padStart(2, '0');
    const currentTimeSlot =
      `${now.getHours().toString().padStart(2, '0')}:${minutesSlot}` as Hours;

    for (const schedule of schedulesResult.schedules) {
      if (!schedule.isActive) continue;

      const isClosingDay =
        schedule.isClosingDays && schedule.closingDays.includes(currentDay);
      const targetHours = isClosingDay
        ? schedule.hoursClosingDays
        : schedule.hoursCommon;

      if (targetHours.includes(currentTimeSlot)) {
        const report = await this.reportsRepository.findById(schedule.reportId);

        if (!report || !report.isActive) {
          this.logger.warn(
            `Agendamento pulado: Relatório ${schedule.reportId} inativo ou não encontrado.`,
          );
          continue;
        }

        if (report.lastUpdate) {
          const lastUpdate = new Date(report.lastUpdate);
          const diffInMilliseconds = now.getTime() - lastUpdate.getTime();
          const diffInMinutes = diffInMilliseconds / (1000 * 60);

          if (diffInMinutes < 29) {
            this.logger.warn(
              `Job ignorado: Relatório ${report.name} já foi atualizado há ${Math.round(diffInMinutes)} minutos (limite de 29 min).`,
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
            `Erro ao atualizar relatório ${schedule.reportId}: ${error.message}`,
          );
        }
      }
    }
  }
}
