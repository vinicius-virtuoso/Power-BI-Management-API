import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { PowerBiRepository } from './power-bi.repository';
import {
  PowerBiEmbedTokenResponse,
  type AzureToken,
  type AzureTokenResponse,
  type EffectiveIdentity,
  type GetPowerBiGetLatestRefreshStatus,
  type PowerBiEmbedToken,
  type PowerBiGetLatestRefreshStatusResponse,
  type PowerBiListReports,
  type PowerBiStatusCode,
} from './power-bi.types';

@Injectable()
export class PowerBiGateway implements PowerBiRepository {
  constructor(private readonly http: HttpService) {}

  async authenticate(): Promise<AzureTokenResponse> {
    const url = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;

    try {
      const params = new URLSearchParams({
        client_id: process.env.AZURE_CLIENT_ID!,
        client_secret: process.env.AZURE_CLIENT_SECRET!,
        scope: process.env.POWER_BI_SCOPE!,
        grant_type: process.env.POWER_BI_GRANT_TYPE!,
      });

      const { data } = await firstValueFrom(
        this.http.post<AzureToken>(url, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );

      return {
        access_token: data.access_token,
      };
    } catch (error) {
      if (error.response) {
        console.error('Power BI GenerateToken error:', {
          status: error.response.status,
          data: error.response.data,
        });
        return {
          statusCode: error.response.status as number,
        };
      }
      console.error('Power BI GenerateToken unexpected error:', error);
      return {
        statusCode: 500,
      };
    }
  }

  async listReports(token: string) {
    const url = `${process.env.POWER_BI_API_URL}/${process.env.POWER_BI_WORKSPACE_ID}/reports`;

    const { data } = await firstValueFrom(
      this.http.get<PowerBiListReports>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    return data.value.map((report) => ({
      externalId: report.id,
      name: report.name,
      webUrl: report.webUrl,
      embedUrl: report.embedUrl,
      datasetId: report.datasetId,
      workspaceId: report.datasetWorkspaceId,
    }));
  }

  async generateEmbedToken(
    token: string,
    reportId: string,
    effectiveIdentity?: EffectiveIdentity[],
  ): Promise<PowerBiEmbedTokenResponse> {
    const url = `${process.env.POWER_BI_API_URL}/${process.env.POWER_BI_WORKSPACE_ID}/reports/${reportId}/GenerateToken`;

    try {
      const body: Record<string, unknown> = { accessLevel: 'View' };

      if (effectiveIdentity) {
        body.identities = effectiveIdentity;
      }

      console.log('Body enviado ao Power BI:', JSON.stringify(body, null, 2));

      const { data } = await firstValueFrom(
        this.http.post<PowerBiEmbedToken>(url, body, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      return {
        token: data.token,
        expiration: data.expiration,
      };
    } catch (error) {
      if (error.response) {
        return {
          statusCode: error.response.status as number,
        };
      }
      return {
        statusCode: 500,
      };
    }
  }

  async triggerDatasetRefresh(
    token: string,
    datasetId: string,
  ): Promise<PowerBiStatusCode> {
    const url = `https://api.powerbi.com/v1.0/myorg/groups/${process.env.POWER_BI_WORKSPACE_ID}/datasets/${datasetId}/refreshes`;

    try {
      const response = await firstValueFrom(
        this.http.post<PowerBiStatusCode>(
          url,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return {
        statusCode: response.status,
      };
    } catch (error) {
      if (error.response) {
        return {
          statusCode: error.response.status as number,
        };
      }
      return {
        statusCode: 500,
      };
    }
  }

  async getLatestRefreshStatus(
    token: string,
    datasetId: string,
  ): Promise<PowerBiGetLatestRefreshStatusResponse> {
    const url = `https://api.powerbi.com/v1.0/myorg/groups/${process.env.POWER_BI_WORKSPACE_ID}/datasets/${datasetId}/refreshes?$top=1`;

    try {
      const { data } = await firstValueFrom(
        this.http.get<GetPowerBiGetLatestRefreshStatus>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const lastRefresh = data.value[0];

      if (!lastRefresh) {
        return { status: 'Unknown', error: null };
      }

      return {
        status: lastRefresh.status,
        startTime: lastRefresh.startTime,
        endTime: lastRefresh.endTime,
        error: lastRefresh.serviceExceptionJson ?? null,
      };
    } catch (error) {
      if (error.response) {
        return {
          statusCode: error.response.status as number,
        };
      }
      return {
        statusCode: 500,
      };
    }
  }
}
