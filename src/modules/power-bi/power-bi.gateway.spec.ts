import { HttpService } from '@nestjs/axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { of, throwError } from 'rxjs';
import { PowerBiGateway } from './power-bi.gateway';
import type { PowerBiGetLatestRefreshStatus } from './power-bi.types';

describe('PowerBiGateway', () => {
  let gateway: PowerBiGateway;
  let httpService: jest.Mocked<HttpService>;

  const createAxiosResponse = (data: any, status = 200): AxiosResponse => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  });

  // Helper para simular erros do Axios/RxJS
  const mockAxiosError = (status: number | null) => {
    const error = status
      ? { response: { status } }
      : new Error('Network Error');
    return throwError(() => error);
  };

  beforeEach(() => {
    httpService = {
      post: jest.fn(),
      get: jest.fn(),
    } as any;

    gateway = new PowerBiGateway(httpService);
    process.env.AZURE_TENANT_ID = 'tenant-id';
    process.env.POWER_BI_WORKSPACE_ID = 'workspace-id';
    process.env.POWER_BI_API_URL = 'https://api.powerbi.com/v1.0/myorg/groups';
  });

  describe('authenticate', () => {
    it('deve retornar access_token com sucesso', async () => {
      httpService.post.mockReturnValue(
        of(createAxiosResponse({ access_token: 'token-123' })),
      );
      const result = await gateway.authenticate();
      expect(result).toEqual({ access_token: 'token-123' });
    });

    it('deve retornar statusCode do erro na autenticação', async () => {
      httpService.post.mockReturnValue(mockAxiosError(401));
      const result = await gateway.authenticate();
      expect(result).toEqual({ statusCode: 401 });
    });

    it('deve retornar 500 em erro desconhecido na autenticação', async () => {
      httpService.post.mockReturnValue(mockAxiosError(null));
      const result = await gateway.authenticate();
      expect(result).toEqual({ statusCode: 500 });
    });
  });

  describe('generateEmbedToken', () => {
    it('deve retornar token de embed com sucesso', async () => {
      httpService.post.mockReturnValue(
        of(createAxiosResponse({ token: 'tk', expiration: 'exp' })),
      );
      const result = await gateway.generateEmbedToken('tk', 'rep-id');
      expect(result).toEqual({ token: 'tk', expiration: 'exp' });
    });

    it('deve retornar statusCode do erro ao gerar embed token', async () => {
      httpService.post.mockReturnValue(mockAxiosError(403));
      const result = await gateway.generateEmbedToken('tk', 'rep-id');
      expect(result).toEqual({ statusCode: 403 });
    });

    it('deve retornar 500 se generateEmbedToken falhar sem resposta do servidor', async () => {
      httpService.post.mockReturnValue(mockAxiosError(null)); // Simula erro sem response
      const result = await gateway.generateEmbedToken('tk', 'rep-id');
      expect(result).toEqual({ statusCode: 500 });
    });
  });

  describe('getLatestRefreshStatus', () => {
    it('deve retornar status do refresh com sucesso', async () => {
      const mockData = { value: [{ status: 'Completed', startTime: '10:00' }] };
      httpService.get.mockReturnValue(of(createAxiosResponse(mockData)));

      const result = await gateway.getLatestRefreshStatus('tk', 'ds-id');

      expect((result as PowerBiGetLatestRefreshStatus).status).toBe(
        'Completed',
      );
    });

    it('deve retornar statusCode do erro no status do refresh', async () => {
      httpService.get.mockReturnValue(mockAxiosError(404));
      const result = await gateway.getLatestRefreshStatus('tk', 'ds-id');

      expect(result).toEqual({ statusCode: 404 });
    });

    it('deve retornar 500 se getLatestRefreshStatus falhar sem resposta do servidor', async () => {
      httpService.get.mockReturnValue(mockAxiosError(null));
      const result = await gateway.getLatestRefreshStatus('tk', 'ds-id');
      expect(result).toEqual({ statusCode: 500 });
    });

    it('deve retornar status Unknown quando não houver nenhum refresh no histórico', async () => {
      httpService.get.mockReturnValue(of(createAxiosResponse({ value: [] })));

      const result = await gateway.getLatestRefreshStatus('tk', 'ds-id');

      expect(result).toEqual({ status: 'Unknown', error: null });
    });

    it('deve retornar o erro serviceExceptionJson quando disponível', async () => {
      const mockData = {
        value: [
          {
            status: 'Failed',
            startTime: '10:00',
            serviceExceptionJson: 'PowerBI Error Details',
          },
        ],
      };
      httpService.get.mockReturnValue(of(createAxiosResponse(mockData)));

      const result = await gateway.getLatestRefreshStatus('tk', 'ds-id');

      expect(result).toMatchObject({
        status: 'Failed',
        error: 'PowerBI Error Details',
      });
    });
  });

  describe('triggerDatasetRefresh', () => {
    it('deve disparar refresh com sucesso', async () => {
      httpService.post.mockReturnValue(of(createAxiosResponse({}, 202)));
      const result = await gateway.triggerDatasetRefresh('tk', 'ds-id');

      // Como o retorno é PowerBiStatusCode, acessamos o statusCode diretamente
      expect(result.statusCode).toBe(202);
    });

    it('deve retornar statusCode do erro ao disparar refresh', async () => {
      httpService.post.mockReturnValue(mockAxiosError(400));
      const result = await gateway.triggerDatasetRefresh('tk', 'ds-id');

      expect(result.statusCode).toBe(400);
    });

    it('deve retornar 500 se triggerDatasetRefresh falhar sem resposta do servidor', async () => {
      httpService.post.mockReturnValue(mockAxiosError(null));
      const result = await gateway.triggerDatasetRefresh('tk', 'ds-id');
      expect(result).toEqual({ statusCode: 500 });
    });
  });

  describe('listReports', () => {
    it('deve mapear os campos do relatório corretamente', async () => {
      const mockPbiReport = {
        id: 'id-1',
        name: 'Report 1',
        webUrl: 'web-url',
        embedUrl: 'embed-url',
        datasetId: 'ds-1',
        datasetWorkspaceId: 'ws-1',
      };

      httpService.get.mockReturnValue(
        of(createAxiosResponse({ value: [mockPbiReport] })),
      );

      const result = await gateway.listReports('token');

      expect(result[0]).toEqual({
        externalId: 'id-1',
        name: 'Report 1',
        webUrl: 'web-url',
        embedUrl: 'embed-url',
        datasetId: 'ds-1',
        workspaceId: 'ws-1',
      });
    });
  });
});
