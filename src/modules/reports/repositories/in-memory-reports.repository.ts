import { randomUUID } from 'node:crypto';
import { Report } from '../entities/report.entity';
import type { ReportsRepository } from './reports.repository';

export class InMemoryReportsRepository implements ReportsRepository {
  private reports: Report[] = [];

  async save(report: Report): Promise<Report> {
    const reportPersisted = Report.fromPersistence({
      id: randomUUID(),
      externalId: report.externalId,
      name: report.name,
      webUrl: report.webUrl,
      embedUrl: report.embedUrl,
      isActive: report.isActive,
      datasetId: report.datasetId,
      workspaceId: report.workspaceId,
      lastUpdate: null,
      errors: null,
    });
    this.reports.push(reportPersisted);

    return reportPersisted;
  }

  async findById(reportId: string): Promise<Report | null> {
    const reportFound = this.reports.find((report) => report.id === reportId);

    if (!reportFound) return null;

    return reportFound;
  }

  async findByIds(ids: string[]): Promise<Report[]> {
    if (ids.length === 0) {
      return [];
    }

    const idsSet = new Set(ids);

    return this.reports.filter((report) => idsSet.has(report.id!));
  }

  async findAll(): Promise<Report[]> {
    const reports = this.reports;

    return reports;
  }

  async findAllActive(): Promise<Report[]> {
    const reports = this.reports.filter((report) => report.isActive);

    return reports;
  }

  async findByExternalId(externalId: string): Promise<Report | null> {
    const reportFound = this.reports.find(
      (report) => report.externalId === externalId,
    );

    if (!reportFound) return null;

    return reportFound;
  }

  async update(report: Report): Promise<Report | null> {
    const index = this.reports.findIndex((r) => r.id === report.id);

    if (index === -1) {
      return null;
    }

    this.reports[index] = report;

    return report;
  }

  async activate(report: Report): Promise<Report | null> {
    const reportFoundIndex = this.reports.findIndex(
      (reportIndex) => reportIndex.id === report.id,
    );

    if (reportFoundIndex === -1) {
      return null;
    }

    this.reports[reportFoundIndex] = report;

    return report;
  }

  async deactivate(report: Report): Promise<Report | null> {
    const reportFoundIndex = this.reports.findIndex(
      (reportIndex) => reportIndex.id === report.id,
    );

    if (reportFoundIndex === -1) {
      return null;
    }

    this.reports[reportFoundIndex] = report;

    return report;
  }

  async delete(reportId: string): Promise<boolean> {
    const reportFound = this.reports.find((report) => report.id === reportId);

    if (!reportFound) return false;

    const reportsFiltered = this.reports.filter(
      (report) => report.id !== reportId,
    );
    this.reports = reportsFiltered;

    return true;
  }
}
