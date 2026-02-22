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
    };
  }
}
