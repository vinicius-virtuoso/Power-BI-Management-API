export interface PowerBiReport {
  id: string;
  name: string;
  webUrl: string;
  embedUrl: string;
  datasetId: string;
  datasetWorkspaceId: string;
}

export interface PowerBiReportResponse {
  externalId: string;
  name: string;
  webUrl: string;
  embedUrl: string;
  datasetId: string;
  workspaceId: string;
}

export interface PowerBiListReports {
  value: PowerBiReport[];
}

export interface PowerBiListReportsResponse {
  value: PowerBiReportResponse[];
}

export interface PowerBiEmbedTokenResponse {
  token: string;
  expiration: string;
}
