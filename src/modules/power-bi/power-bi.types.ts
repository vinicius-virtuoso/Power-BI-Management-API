export type AzureToken = {
  access_token: string;
};

export type PowerBiStatusCode = {
  statusCode: number;
};

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

export type PowerBiListReportsResponse = PowerBiListReports | PowerBiStatusCode;

export interface EffectiveIdentity {
  username: string;
  roles: string[];
  datasets: string[];
}

export interface PowerBiEmbedToken {
  token: string;
  expiration: string;
}

export type PowerBiEmbedTokenResponse = PowerBiEmbedToken | PowerBiStatusCode;

export interface GetPowerBiGetLatestRefreshStatus {
  value: [
    {
      status: 'Completed' | 'Failed' | 'Disabled' | 'Unknown' | string;
      serviceExceptionJson?: string | null;
      startTime?: Date;
      endTime?: Date;
    },
  ];
}

export interface PowerBiGetLatestRefreshStatus {
  status: 'Completed' | 'Failed' | 'Disabled' | 'Unknown' | string;
  error?: string | null;
  startTime?: Date;
  endTime?: Date;
}

export type PowerBiGetLatestRefreshStatusResponse =
  | PowerBiGetLatestRefreshStatus
  | PowerBiStatusCode;

export type AzureTokenResponse = AzureToken | PowerBiStatusCode;
