import type { ScheduleReport } from '../entities/schedule-report.entity';

export interface ScheduleReportsRepository {
  save(data: ScheduleReport): Promise<ScheduleReport>;
  findAll(): Promise<ScheduleReport[]>;
  findById(id: string): Promise<ScheduleReport | null>;
  findByReportId(reportId: string): Promise<ScheduleReport | null>;
  update(data: ScheduleReport): Promise<ScheduleReport | null>;
  delete(id: string): Promise<boolean>;
}
