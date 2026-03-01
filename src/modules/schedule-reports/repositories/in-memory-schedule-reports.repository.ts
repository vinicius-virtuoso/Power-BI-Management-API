import { randomUUID } from 'node:crypto';
import { ScheduleReport } from '../entities/schedule-report.entity';
import type { ScheduleReportsRepository } from './schedule-reports.repository';

export class InMemoryScheduleReportsRepository implements ScheduleReportsRepository {
  private schedulesReports: ScheduleReport[] = [];

  async save(data: ScheduleReport): Promise<ScheduleReport> {
    const schedulesReportsPersisted = ScheduleReport.fromPersistence({
      id: randomUUID(),
      reportId: data.reportId,
      hoursCommon: data.hoursCommon,
      isClosingDays: data.isClosingDays,
      closingDays: data.closingDays,
      hoursClosingDays: data.hoursClosingDays,
      isActive: data.isActive,
    });

    this.schedulesReports.push(schedulesReportsPersisted);

    return schedulesReportsPersisted;
  }

  async findAll(): Promise<ScheduleReport[]> {
    const schedules = this.schedulesReports;

    return schedules;
  }

  async findById(id: string): Promise<ScheduleReport | null> {
    const schedulesReportsFound = this.schedulesReports.find(
      (schedulesReport) => schedulesReport.id === id,
    );

    if (!schedulesReportsFound) return null;

    return schedulesReportsFound;
  }
  async findByReportId(reportId: string): Promise<ScheduleReport | null> {
    const schedulesReportsFound = this.schedulesReports.find(
      (schedulesReport) => schedulesReport.reportId === reportId,
    );

    if (!schedulesReportsFound) return null;

    return schedulesReportsFound;
  }

  async update(data: ScheduleReport): Promise<ScheduleReport | null> {
    const index = this.schedulesReports.findIndex(
      (schedulesReport) => schedulesReport.id === data.id,
    );

    if (index === -1) {
      return null;
    }

    this.schedulesReports[index] = data;

    return data;
  }

  async delete(id: string): Promise<boolean> {
    const schedulesReportsFound = this.schedulesReports.find(
      (schedulesReport) => schedulesReport.id === id,
    );

    if (!schedulesReportsFound) return false;

    const schedulesReportsFiltered = this.schedulesReports.filter(
      (schedulesReport) => schedulesReport.id !== id,
    );
    this.schedulesReports = schedulesReportsFiltered;

    return true;
  }
}
