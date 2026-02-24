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
}
