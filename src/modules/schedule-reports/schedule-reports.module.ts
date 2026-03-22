import { Module } from '@nestjs/common';
import { RefreshDatasetModule } from '../refresh-dataset/refresh-dataset.module';
import { ReportsModule } from '../reports/reports.module';
import { RefreshSchedulerJob } from './jobs/refresh-scheduler.job';
import { RefreshStatusSyncJob } from './jobs/refresh-status-sync.job';
import { InMemoryScheduleReportsRepository } from './repositories/in-memory-schedule-reports.repository';
import { PrismaScheduleReportsRepository } from './repositories/prisma-schedule-reports.repository';
import { ScheduleReportsController } from './schedule-reports.controller';
import { SCHEDULE_REPORTS_REPOSITORY } from './schedule-reports.providers';
import { CreateScheduleUseCase } from './use-cases/create-schedule.usecase';
import { DeleteScheduleUseCase } from './use-cases/delete-schedule.usecase';
import { FindAllScheduleUseCase } from './use-cases/find-all-schedule.usecase';
import { FindByIdScheduleUseCase } from './use-cases/find-by-id-schedule.usecase';
import { FindByReportIdUseCase } from './use-cases/find-by-report-id.usecase';
import { UpdateScheduleUseCase } from './use-cases/update-schedule.usecase';

@Module({
  imports: [
    RefreshDatasetModule, // ADICIONE ISSO AQUI
    ReportsModule,
  ],
  controllers: [ScheduleReportsController],
  providers: [
    RefreshSchedulerJob,
    RefreshStatusSyncJob,
    CreateScheduleUseCase,
    FindAllScheduleUseCase,
    FindByIdScheduleUseCase,
    FindByReportIdUseCase,
    UpdateScheduleUseCase,
    DeleteScheduleUseCase,
    {
      provide: SCHEDULE_REPORTS_REPOSITORY,
      useClass:
        process.env.NODE_ENV !== 'test'
          ? PrismaScheduleReportsRepository
          : InMemoryScheduleReportsRepository,
    },
  ],
})
export class ScheduleReportsModule {}
