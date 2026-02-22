import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../lib/prisma';
import { UserReport } from '../entities/user-report.entity';
import type { UserReportRepository } from './user-report.repository';

@Injectable()
export class PrismaUserReportRepository implements UserReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(reportId: string, userId: string): Promise<UserReport> {
    const userReportCreated = await this.prisma.userReport.create({
      data: {
        reportId,
        userId,
      },
    });

    return UserReport.fromPersistence(userReportCreated);
  }

  async findAll(): Promise<UserReport[]> {
    const userReportsFound = await this.prisma.userReport.findMany();

    return userReportsFound.map((userReport) =>
      UserReport.fromPersistence(userReport),
    );
  }

  async findById(id: string): Promise<UserReport | null> {
    const userReportFound = await this.prisma.userReport.findUnique({
      where: { id },
    });

    if (!userReportFound) return null;

    return UserReport.fromPersistence(userReportFound);
  }

  async findByUser(userId: string): Promise<UserReport[]> {
    const userReportsFound = await this.prisma.userReport.findMany({
      where: {
        user: {
          id: userId,
        },
      },
    });

    return userReportsFound.map((userReport) =>
      UserReport.fromPersistence(userReport),
    );
  }

  async findByReport(reportId: string): Promise<UserReport[] | null> {
    const userReportsFound = await this.prisma.userReport.findMany({
      where: {
        report: {
          id: reportId,
        },
      },
    });

    return userReportsFound.map((userReport) =>
      UserReport.fromPersistence(userReport),
    );
  }

  async findByUserReport(
    userId: string,
    reportId: string,
  ): Promise<UserReport | null> {
    const userReportFound = await this.prisma.userReport.findFirst({
      where: {
        userId,
        reportId,
      },
    });

    if (!userReportFound) return null;

    return UserReport.fromPersistence(userReportFound);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.userReport.delete({
        where: {
          id,
        },
      });

      return true;
    } catch {
      return false;
    }
  }
}
