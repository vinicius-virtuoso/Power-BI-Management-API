import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckReportRefreshStatusUseCase } from '../../refresh-dataset/use-cases/check-report-refresh-status.usecase';
import { REPORTS_REPOSITORY } from '../../reports/reports.providers';
import { ReportsRepository } from '../../reports/repositories/reports.repository';

@Injectable()
export class RefreshStatusSyncJob {
  private readonly logger = new Logger(RefreshStatusSyncJob.name);

  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepository,

    private readonly checkStatusUseCase: CheckReportRefreshStatusUseCase,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'Report Status Sync',
    timeZone: 'America/Sao_Paulo',
  })
  async handleStatusSync() {
    this.logger.log('Sincronizando status de relatórios ativos...');

    const reports = await this.reportsRepository.findAllActive();

    for (const report of reports) {
      try {
        await this.checkStatusUseCase.execute(report.id, {
          id: 'system-sync',
          role: 'ADMIN',
          email: 'system-sync@example.com',
        });
      } catch (error) {
        this.logger.error(
          `Erro ao sincronizar relatório ${report.id}: ${error.message}`,
        );
      }
    }
  }
}
