export type UserReportCreate = {
  userId: string;
  reportId: string;
};

export type UserReportView = {
  id: string | null;
  userId: string;
  reportId: string;
};

export class UserReport {
  private constructor(
    readonly id: string | null,
    readonly userId: string,
    readonly reportId: string,
  ) {}

  static create(data: UserReportCreate): UserReport {
    return new UserReport(undefined, data.userId, data.reportId);
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    reportId: string;
  }): UserReport {
    return new UserReport(data.id, data.userId, data.reportId);
  }

  toView(): UserReportView {
    return {
      id: this.id,
      userId: this.userId,
      reportId: this.reportId,
    };
  }
}
