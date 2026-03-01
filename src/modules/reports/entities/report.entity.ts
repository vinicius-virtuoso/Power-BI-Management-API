export type CreateReport = {
  externalId: string;
  name: string;
  webUrl: string;
  embedUrl: string;
  datasetId: string;
  workspaceId: string;
  isActive: boolean;
};

export type ReportView = {
  id: string | null;
  externalId: string;
  name: string;
  webUrl: string;
  embedUrl: string;
  datasetId: string;
  workspaceId: string;
  isActive: boolean;
  lastUpdate: Date;
  errors: string | null;
};

export class Report {
  constructor(
    public id: string | null,
    public externalId: string,
    public name: string,
    public webUrl: string,
    public embedUrl: string,
    public datasetId: string,
    public workspaceId: string,
    public isActive: boolean,
    public lastUpdate?: Date | null,
    public errors?: string | null,
  ) {}

  static create(data: CreateReport): Report {
    return new Report(
      undefined,
      data.externalId,
      data.name,
      data.webUrl,
      data.embedUrl,
      data.datasetId,
      data.workspaceId,
      data.isActive,
      null,
      null,
    );
  }

  static fromPersistence(data: {
    id: string;
    externalId: string;
    name: string;
    webUrl: string;
    embedUrl: string;
    datasetId: string;
    workspaceId: string;
    isActive: boolean;
    lastUpdate?: Date | null;
    errors?: string | null;
  }): Report {
    return new Report(
      data.id,
      data.externalId,
      data.name,
      data.webUrl,
      data.embedUrl,
      data.datasetId,
      data.workspaceId,
      data.isActive,
      data.lastUpdate,
      data.errors,
    );
  }

  lastUpdateEnd(lastUpdate: Date, erros: any): Report {
    return new Report(
      this.id,
      this.externalId,
      this.name,
      this.webUrl,
      this.embedUrl,
      this.datasetId,
      this.workspaceId,
      this.isActive,
      lastUpdate ?? this.lastUpdate,
      erros ?? null,
    );
  }

  deactivate(): Report {
    return new Report(
      this.id,
      this.externalId,
      this.name,
      this.webUrl,
      this.embedUrl,
      this.datasetId,
      this.workspaceId,
      false,
      this.lastUpdate,
      this.errors,
    );
  }

  activate(): Report {
    return new Report(
      this.id,
      this.externalId,
      this.name,
      this.webUrl,
      this.embedUrl,
      this.datasetId,
      this.workspaceId,
      true,
      this.lastUpdate,
      this.errors,
    );
  }

  toView(): ReportView {
    return {
      id: this.id,
      externalId: this.externalId,
      name: this.name,
      webUrl: this.webUrl,
      embedUrl: this.embedUrl,
      datasetId: this.datasetId,
      workspaceId: this.workspaceId,
      isActive: this.isActive,
      lastUpdate: this.lastUpdate,
      errors: this.errors ? this.safeParse(this.errors) : null,
    };
  }

  private safeParse(data: string): any {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
}
