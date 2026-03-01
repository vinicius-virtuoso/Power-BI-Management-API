import { Module } from '@nestjs/common';
import { PowerBiModule } from '../power-bi/power-bi.module';
import { ReportsModule } from '../reports/reports.module';
import { RefreshDatasetController } from './refresh-dataset.controller';
import { CheckReportRefreshStatusUseCase } from './use-cases/check-report-refresh-status.usecase';
import { RefreshDatasetReportUseCase } from './use-cases/refresh-dataset-report.usecase';

@Module({
  imports: [ReportsModule, PowerBiModule],
  controllers: [RefreshDatasetController],
  providers: [RefreshDatasetReportUseCase, CheckReportRefreshStatusUseCase],
  exports: [RefreshDatasetReportUseCase, CheckReportRefreshStatusUseCase],
})
export class RefreshDatasetModule {}
