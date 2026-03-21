import { Module } from '@nestjs/common';
import { PowerBiModule } from '../power-bi/power-bi.module';
import { ReportsModule } from '../reports/reports.module';
import { UsersModule } from '../users/users.module';
import { InMemoryUserReportRepository } from './repositories/in-memory-user-report.repository';
import { PrismaUserReportRepository } from './repositories/prisma-user-report.repository';
import { ReportAccessService } from './service/report-access/report-access.service';
import { CreateUserReportUseCase } from './use-case/create-user-report.usecase';
import { DeleteUserReportUseCase } from './use-case/delete-user-report.usecase';
import { FindAllReportsUseCase } from './use-case/find-all-reports.usecase';
import { FindOneUserReportUseCase } from './use-case/find-one-user-report.usecase';
import { GenerateTokenEmbedUseCase } from './use-case/generate-token-embed.usecase';
import { UserReportController } from './user-report.controller';
import { USER_REPORT_REPOSITORY } from './user-report.provider';

@Module({
  imports: [PowerBiModule, ReportsModule, UsersModule],
  controllers: [UserReportController],
  providers: [
    ReportAccessService,
    CreateUserReportUseCase,
    DeleteUserReportUseCase,
    FindAllReportsUseCase,
    FindOneUserReportUseCase,
    GenerateTokenEmbedUseCase,

    {
      provide: USER_REPORT_REPOSITORY,
      useClass:
        process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production'
          ? PrismaUserReportRepository
          : InMemoryUserReportRepository,
    },
  ],
  exports: [USER_REPORT_REPOSITORY],
})
export class UserReportModule {}
