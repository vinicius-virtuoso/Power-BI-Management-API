import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PowerBiModule } from '../power-bi/power-bi.module';
import { ReportsController } from './reports.controller';
import { REPORTS_REPOSITORY } from './reports.providers';
import { PrismaReportsRepository } from './repositories/prisma-reports.repository';
import { ActivateReportUseCase } from './use-cases/activate-report.usecase';
import { DeactivateReportUseCase } from './use-cases/deactivate-report.usecase';
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
    {
      provide: REPORTS_REPOSITORY,
      useClass: PrismaReportsRepository,
    },
  ],
  exports: [REPORTS_REPOSITORY],
})
export class ReportsModule {}
