import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PowerBiModule } from '../power-bi/power-bi.module';
import { ReportsController } from './reports.controller';
import { REPORTS_REPOSITORY } from './reports.providers';
import { InMemoryReportsRepository } from './repositories/in-memory-reports.repository';
import { PrismaReportsRepository } from './repositories/prisma-reports.repository';
import { SyncReportsSeed } from './seeds/sync-reports.seed';
import { ActivateReportUseCase } from './use-cases/activate-report.usecase';
import { DeactivateReportUseCase } from './use-cases/deactivate-report.usecase';
import { DeleteReportUseCase } from './use-cases/delete-report.usecase';
import { SyncReportsPowerBIUseCase } from './use-cases/sync-reports-for-power-bi.use-case';

@Module({
  imports: [
    PowerBiModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [ReportsController],
  providers: [
    SyncReportsPowerBIUseCase,
    ActivateReportUseCase,
    DeactivateReportUseCase,
    DeleteReportUseCase,
    SyncReportsSeed,
    {
      provide: REPORTS_REPOSITORY,
      useClass:
        process.env.NODE_ENV !== 'test'
          ? PrismaReportsRepository
          : InMemoryReportsRepository,
    },
  ],
  exports: [REPORTS_REPOSITORY],
})
export class ReportsModule {}
