import type { Report } from '../entities/report.entity';

export interface ReportsRepository {
  save(report: Report): Promise<Report>;
  findAll(): Promise<Report[]>;
  findAllActive(): Promise<Report[]>;
  findByIds(reportIds: string[]): Promise<Report[]>;
  findById(reportId: string): Promise<Report | null>;
  findByExternalId(externalId: string): Promise<Report | null>;
  activate(report: Report): Promise<Report | null>;
  deactivate(report: Report): Promise<Report | null>;
  update(report: Report): Promise<Report | null>;
  delete(reportId: string): Promise<boolean>;
}
