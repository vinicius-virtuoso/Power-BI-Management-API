import { UnauthorizedException } from '@nestjs/common';
import type { PowerBiRepository } from '../../power-bi/power-bi.repository';
import type { PowerBiEmbedTokenResponse } from '../../power-bi/power-bi.types';
import type { ReportView } from '../../reports/entities/report.entity';
import { ReportAccessService } from '../service/report-access/report-access.service';
import { GenerateTokenEmbedUseCase } from './generate-token-embed.usecase';

describe('GenerateTokenEmbedUseCase', () => {
  let useCase: GenerateTokenEmbedUseCase;
  let reportAccessService: jest.Mocked<ReportAccessService>;
  let powerBiRepository: jest.Mocked<PowerBiRepository>;

  beforeEach(() => {
    reportAccessService = {
      validateAccess: jest.fn(),
    } as unknown as jest.Mocked<ReportAccessService>;

    powerBiRepository = {
      authenticate: jest.fn(),
      generateEmbedToken: jest.fn(),
    } as unknown as jest.Mocked<PowerBiRepository>;

    useCase = new GenerateTokenEmbedUseCase(
      reportAccessService,
      powerBiRepository,
    );
  });

  it('deve gerar um token embed para o relatório', async () => {
    const reportView: ReportView = {
      id: 'report-id',
      name: 'Relatório Teste',
      isActive: true,
      externalId: 'external-report-id',
      embedUrl: 'https://embed.url',
      datasetId: 'datasetId-1',
      webUrl: 'webUrl-1',
      workspaceId: 'workspaceId-1',
      lastUpdate: null,
      errors: null,
    };

    const accessToken = { access_token: 'power-bi-access-token' };

    const embedToken: PowerBiEmbedTokenResponse = {
      token: 'embed-token',
      expiration: '2026-01-01T00:00:00Z',
    };

    reportAccessService.validateAccess.mockResolvedValue(reportView);
    powerBiRepository.authenticate.mockResolvedValue(accessToken);
    powerBiRepository.generateEmbedToken.mockResolvedValue(embedToken);

    const result = await useCase.execute('report-id', {
      id: 'user-id',
      role: 'USER',
    });

    expect(reportAccessService.validateAccess).toHaveBeenCalledWith(
      'report-id',
      { id: 'user-id', role: 'USER' },
    );
    expect(powerBiRepository.authenticate).toHaveBeenCalled();
    expect(powerBiRepository.generateEmbedToken).toHaveBeenCalledWith(
      accessToken.access_token,
      reportView.externalId,
    );
    expect(result).toEqual(embedToken);
  });

  it('deve lançar UnauthorizedException se a autenticação com Power BI falhar', async () => {
    reportAccessService.validateAccess.mockResolvedValue({
      externalId: 'ext-id',
    } as any);

    powerBiRepository.authenticate.mockResolvedValue({
      statusCode: 401,
    });

    const promise = useCase.execute('report-id', {
      id: 'user-id',
      role: 'USER',
    });

    await expect(promise).rejects.toThrow(UnauthorizedException);
    await expect(promise).rejects.toThrow(
      'Falha na autenticação com o Power BI: 401',
    );
  });
});
