export type Hours =
  | '23'
  | '22'
  | '21'
  | '20'
  | '19'
  | '18'
  | '17'
  | '16'
  | '15'
  | '14'
  | '13'
  | '12'
  | '11'
  | '10'
  | '09'
  | '08'
  | '07'
  | '06'
  | '05'
  | '04'
  | '03'
  | '02'
  | '01'
  | '00';

export type ClosingDays =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16'
  | '17'
  | '18'
  | '19'
  | '20'
  | '21'
  | '22'
  | '23'
  | '24'
  | '25'
  | '26'
  | '27'
  | '28'
  | '29'
  | '30'
  | '31';

export type ScheduleReportCreate = {
  reportId: string;
  hoursCommon: Hours[];
  isClosingDays: boolean;
  closingDays: ClosingDays[];
  hoursClosingDays: Hours[];
};

export type ScheduleReportView = {
  id: string | null;
  reportId: string;
  hoursCommon: Hours[];
  isClosingDays: boolean;
  closingDays: ClosingDays[];
  hoursClosingDays: Hours[];
  isActive: boolean;
};

export type ScheduleReportUpdate = {
  hoursCommon?: Hours[];
  isClosingDays?: boolean;
  closingDays?: ClosingDays[];
  hoursClosingDays?: Hours[];
};

export class ScheduleReport {
  private constructor(
    readonly id: string | null,
    readonly reportId: string,
    readonly hoursCommon: Hours[],
    readonly isClosingDays: boolean,
    readonly closingDays: ClosingDays[],
    readonly hoursClosingDays: Hours[],
    readonly isActive: boolean,
  ) {}

  static create(data: ScheduleReportCreate): ScheduleReport {
    return new ScheduleReport(
      undefined,
      data.reportId,
      data.hoursCommon,
      data.isClosingDays,
      data.closingDays,
      data.hoursClosingDays,
      true,
    );
  }

  static fromPersistence(data: {
    id: string;
    reportId: string;
    hoursCommon: Hours[];
    isClosingDays: boolean;
    closingDays: ClosingDays[];
    hoursClosingDays: Hours[];
    isActive: boolean;
  }): ScheduleReport {
    return new ScheduleReport(
      data.id,
      data.reportId,
      data.hoursCommon,
      data.isClosingDays,
      data.closingDays,
      data.hoursClosingDays,
      data.isActive,
    );
  }

  deactivate(): ScheduleReport {
    return new ScheduleReport(
      this.id,
      this.reportId,
      this.hoursCommon,
      this.isClosingDays,
      this.closingDays,
      this.hoursClosingDays,
      false,
    );
  }

  activate(): ScheduleReport {
    return new ScheduleReport(
      this.id,
      this.reportId,
      this.hoursCommon,
      this.isClosingDays,
      this.closingDays,
      this.hoursClosingDays,
      true,
    );
  }

  update(data: ScheduleReportUpdate): ScheduleReport {
    return new ScheduleReport(
      this.id,
      this.reportId,
      data.hoursCommon ?? this.hoursCommon,
      data.isClosingDays ?? this.isClosingDays,
      data.closingDays ?? this.closingDays,
      data.hoursClosingDays ?? this.hoursClosingDays,
      this.isActive,
    );
  }

  toView(): ScheduleReportView {
    return {
      id: this.id,
      reportId: this.reportId,
      hoursCommon: this.hoursCommon,
      isClosingDays: this.isClosingDays,
      closingDays: this.closingDays,
      hoursClosingDays: this.hoursClosingDays,
      isActive: this.isActive,
    };
  }
}
