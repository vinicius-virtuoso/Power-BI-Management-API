export type Hours =
  | '23:00'
  | '23:30'
  | '22:00'
  | '22:30'
  | '21:00'
  | '21:30'
  | '20:00'
  | '20:30'
  | '19:00'
  | '19:30'
  | '18:00'
  | '18:30'
  | '17:00'
  | '17:30'
  | '16:00'
  | '16:30'
  | '15:00'
  | '15:30'
  | '14:00'
  | '14:30'
  | '13:00'
  | '13:30'
  | '12:00'
  | '12:30'
  | '11:00'
  | '11:30'
  | '10:00'
  | '10:30'
  | '09:00'
  | '09:30'
  | '08:00'
  | '08:30'
  | '07:00'
  | '07:30'
  | '06:00'
  | '06:30'
  | '05:00'
  | '05:30'
  | '04:00'
  | '04:30'
  | '03:00'
  | '03:30'
  | '02:00'
  | '02:30'
  | '01:00'
  | '01:30'
  | '00:30'
  | '00:00';

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
