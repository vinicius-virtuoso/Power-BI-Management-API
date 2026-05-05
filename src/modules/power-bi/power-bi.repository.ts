import type {
  AzureTokenResponse,
  EffectiveIdentity,
  PowerBiEmbedTokenResponse,
  PowerBiGetLatestRefreshStatusResponse,
  PowerBiReportResponse,
} from './power-bi.types';

export interface PowerBiRepository {
  authenticate(): Promise<AzureTokenResponse>;
  listReports(token: string): Promise<PowerBiReportResponse[]>;
  generateEmbedToken(
    accessToken: string,
    reportId: string,
    effectiveIdentity?: EffectiveIdentity[],
  ): Promise<PowerBiEmbedTokenResponse>;
  triggerDatasetRefresh(
    token: string,
    datasetId: string,
  ): Promise<{ statusCode: number }>;
  getLatestRefreshStatus(
    token: string,
    datasetId: string,
  ): Promise<PowerBiGetLatestRefreshStatusResponse>;
}
