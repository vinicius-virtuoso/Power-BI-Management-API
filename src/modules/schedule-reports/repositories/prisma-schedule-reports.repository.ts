import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../lib/prisma';
import { ScheduleReport } from '../entities/schedule-report.entity';
import type { ScheduleReportsRepository } from './schedule-reports.repository';

@Injectable()
export class PrismaScheduleReportsRepository implements ScheduleReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: ScheduleReport): Promise<ScheduleReport> {
    const created = await this.prisma.scheduleReports.create({
      data: {
        reportId: data.reportId,
        hoursCommon: data.hoursCommon,
        isClosingDays: data.isClosingDays,
        closingDays: data.closingDays,
        hoursClosingDays: data.hoursClosingDays,
        isActive: data.isActive,
      },
    });

    return this.mapToDomain(created);
  }

  async findAll(): Promise<ScheduleReport[]> {
    const schedules = await this.prisma.scheduleReports.findMany();
    return schedules.map((s) => this.mapToDomain(s));
  }

  async findById(id: string): Promise<ScheduleReport | null> {
    const schedule = await this.prisma.scheduleReports.findUnique({
      where: { id },
    });

    if (!schedule) return null;

    return this.mapToDomain(schedule);
  }

  async findByReportId(reportId: string): Promise<ScheduleReport | null> {
    const schedule = await this.prisma.scheduleReports.findUnique({
      where: { reportId },
    });

    if (!schedule) return null;

    return this.mapToDomain(schedule);
  }

  async update(data: ScheduleReport): Promise<ScheduleReport | null> {
    if (!data.id) return null;

    const updated = await this.prisma.scheduleReports.update({
      where: { id: data.id },
      data: {
        hoursCommon: data.hoursCommon,
        isClosingDays: data.isClosingDays,
        closingDays: data.closingDays,
        hoursClosingDays: data.hoursClosingDays,
        isActive: data.isActive,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.scheduleReports.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Método auxiliar para converter o retorno do Prisma (infra)
   * para a nossa classe de Domínio (Entity)
   */
  private mapToDomain(raw: any): ScheduleReport {
    return ScheduleReport.fromPersistence({
      id: raw.id,
      reportId: raw.reportId,
      hoursCommon: raw.hoursCommon as any,
      isClosingDays: raw.isClosingDays,
      closingDays: raw.closingDays as any,
      hoursClosingDays: raw.hoursClosingDays as any,
      isActive: raw.isActive,
    });
  }
}
