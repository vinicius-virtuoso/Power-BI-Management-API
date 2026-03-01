import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UserReportModule } from './modules/user-report/user-report.module';
import { UsersModule } from './modules/users/users.module';
import { ScheduleReportsModule } from './modules/schedule-reports/schedule-reports.module';
import { RefreshDatasetModule } from './modules/refresh-dataset/refresh-dataset.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ReportsModule,
    UserReportModule,
    ScheduleReportsModule,
    RefreshDatasetModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
