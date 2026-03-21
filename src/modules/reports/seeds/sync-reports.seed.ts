import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SyncReportsPowerBIUseCase } from '../use-cases/sync-reports-for-power-bi.use-case';

@Injectable()
export class SyncReportsSeed implements OnModuleInit {
  private readonly logger = new Logger(SyncReportsSeed.name);

  constructor(private readonly syncReportsUseCase: SyncReportsPowerBIUseCase) {}

  async onModuleInit() {
    this.logger.log(
      'Iniciando sincronização automática de relatórios Power BI...',
    );

    try {
      const systemUser = {
        id: 'system-auto-sync',
        role: 'ADMIN',
      };

      const result = await this.syncReportsUseCase.execute(systemUser as any);

      this.logger.log(
        `Sincronização concluída com sucesso! Total de relatórios: ${result.total}`,
      );
    } catch (error) {
      this.logger.error(
        `Falha na sincronização automática: ${error.message}`,
        error.stack,
      );
    }
  }
}
