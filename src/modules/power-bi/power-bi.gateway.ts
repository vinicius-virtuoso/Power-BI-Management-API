import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { PowerBiRepository } from './power-bi.repository';
import {
  PowerBiEmbedTokenResponse,
  type PowerBiListReports,
} from './power-bi.types';

@Injectable()
export class PowerBiGateway implements PowerBiRepository {
  constructor(private readonly http: HttpService) {}

  async authenticate(): Promise<string> {
    const url = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
      client_id: process.env.AZURE_CLIENT_ID!,
      client_secret: process.env.AZURE_CLIENT_SECRET!,
      scope: process.env.POWER_BI_SCOPE!,
      grant_type: process.env.POWER_BI_GRANT_TYPE!,
    });

    const { data } = await firstValueFrom(
      this.http.post(url, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );

    return data.access_token;
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

  async generateEmbedToken(token: string, reportId: string) {
    const url = `${process.env.POWER_BI_API_URL}/${process.env.POWER_BI_WORKSPACE_ID}/reports/${reportId}/GenerateToken`;

    const { data } = await firstValueFrom(
      this.http.post<PowerBiEmbedTokenResponse>(
        url,
        { accessLevel: 'View' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );

    return {
      token: data.token,
      expiration: data.expiration,
    };
  }

  async triggerDatasetRefresh(
    token: string,
    datasetId: string,
  ): Promise<{ statusCode: number }> {
    const url = `https://api.powerbi.com/v1.0/myorg/groups/${process.env.POWER_BI_WORKSPACE_ID}/datasets/${datasetId}/refreshes`;

    try {
      // O Axios retorna um objeto 'AxiosResponse' que contém a propriedade 'status'
      const response = await firstValueFrom(
        this.http.post(
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

      // No sucesso (geralmente 202 Accepted para o Power BI)
      return {
        statusCode: response.status,
      };
    } catch (error) {
      // Se o erro veio da resposta da API (ex: 400, 401, 404)
      if (error.response) {
        return {
          statusCode: error.response.status,
        };
      }

      // Se for um erro de rede ou timeout (sem status code de servidor)
      return {
        statusCode: 500,
      };
    }
  }

  async getLatestRefreshStatus(token: string, datasetId: string) {
    // Pegamos apenas o último item do histórico ($top=1)
    const url = `https://api.powerbi.com/v1.0/myorg/groups/${process.env.POWER_BI_WORKSPACE_ID}/datasets/${datasetId}/refreshes?$top=1`;

    const { data } = await firstValueFrom(
      this.http.get<any>(url, {
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
      status: lastRefresh.status, // 'Completed', 'Failed', 'InProgress'
      startTime: lastRefresh.startTime,
      endTime: lastRefresh.endTime,
      // Se houver falha, o Power BI envia o detalhe em serviceExceptionJson
      error:
        lastRefresh.status === 'Failed'
          ? lastRefresh.serviceExceptionJson
          : null,
    };
  }
}
