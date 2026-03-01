import type {
  PowerBiEmbedTokenResponse,
  PowerBiReportResponse,
} from './power-bi.types';

export interface PowerBiRepository {
  authenticate(): Promise<string>;
  listReports(token: string): Promise<PowerBiReportResponse[]>;
  generateEmbedToken(
    accessToken: string,
    reportId: string,
  ): Promise<PowerBiEmbedTokenResponse>;
  triggerDatasetRefresh(
    token: string,
    datasetId: string,
  ): Promise<{ statusCode: number }>;
  getLatestRefreshStatus(
    token: string,
    datasetId: string,
  ): Promise<
    | {
        status: string;
        error: any;
        startTime?: undefined;
        endTime?: undefined;
      }
    | {
        status: any;
        startTime: any;
        endTime: any;
        error: any;
      }
  >;
}
