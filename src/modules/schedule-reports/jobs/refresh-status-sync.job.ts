import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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

  // Roda a cada 15 minutos
  @Cron('0 */15 * * * *', {
    name: 'Status de Atualização de relatórios',
    timeZone: 'America/Sao_Paulo',
  })
  async handleStatusSync() {
    this.logger.log('Sincronizando status de relatórios ativos...');

    const reports = await this.reportsRepository.findAll();

    for (const report of reports) {
      try {
        await this.checkStatusUseCase.execute(report.id, {
          id: 'system-sync',
          role: 'ADMIN',
        });
      } catch (error) {
        this.logger.error(
          `Erro na sincronização do report ${report.id}: ${error.message}`,
        );
      }
    }
  }
}
