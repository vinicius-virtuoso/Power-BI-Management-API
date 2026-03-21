import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../lib/prisma';
import { Report, type CreateReport } from '../entities/report.entity';
import type { ReportsRepository } from './reports.repository';

@Injectable()
export class PrismaReportsRepository implements ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(report: CreateReport): Promise<Report> {
    const reportCreated = await this.prisma.report.upsert({
      where: { externalId: report.externalId },
      update: { ...report },
      create: { ...report },
    });

    return Report.fromPersistence(reportCreated);
  }

  async findAll(): Promise<Report[]> {
    const reportsFound = await this.prisma.report.findMany();

    return reportsFound.map((report) => Report.fromPersistence(report));
  }

  async findAllActive(): Promise<Report[]> {
    const reportsFound = await this.prisma.report.findMany({
      where: {
        isActive: true,
      },
    });

    return reportsFound.map((report) => Report.fromPersistence(report));
  }

  async findByIds(reportIds: string[]): Promise<Report[]> {
    if (reportIds.length === 0) return [];
    const reportsFound = await this.prisma.report.findMany({
      where: { id: { in: reportIds } },
    });

    return reportsFound.map((report) => Report.fromPersistence(report));
  }

  async findById(reportId: string): Promise<Report | null> {
    const reportFound = await this.prisma.report.findUnique({
      where: { id: reportId },
    });
    if (!reportFound) return null;

    return Report.fromPersistence(reportFound);
  }

  async findByExternalId(externalId: string): Promise<Report | null> {
    const reportFound = await this.prisma.report.findUnique({
      where: { externalId },
    });
    if (!reportFound) return null;

    return Report.fromPersistence(reportFound);
  }

  async update(report: Report): Promise<Report | null> {
    try {
      const reportUpdated = await this.prisma.report.update({
        where: { id: report.id! },
        data: {
          externalId: report.externalId,
          name: report.name,
          webUrl: report.webUrl,
          embedUrl: report.embedUrl,
          datasetId: report.datasetId,
          workspaceId: report.workspaceId,
          isActive: report.isActive,
          lastUpdate: report.lastUpdate,
          errors: report.errors,
        },
      });

      return Report.fromPersistence(reportUpdated);
    } catch {
      return null;
    }
  }

  async activate(report: Report): Promise<Report | null> {
    return this.update(report);
  }

  async deactivate(report: Report): Promise<Report | null> {
    return this.update(report);
  }

  async delete(reportId: string): Promise<boolean> {
    try {
      await this.prisma.report.delete({
        where: { id: reportId },
      });

      return true;
    } catch {
      return false;
    }
  }
}
