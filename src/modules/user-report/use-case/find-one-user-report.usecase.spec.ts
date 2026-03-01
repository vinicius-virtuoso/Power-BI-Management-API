import { UnauthorizedException } from '@nestjs/common';
import type { PowerBiRepository } from '../../power-bi/power-bi.repository';
import type { ReportView } from '../../reports/entities/report.entity';
import { ReportAccessService } from '../service/report-access/report-access.service';
import { FindOneUserReportUseCase } from './find-one-user-report.usecase';

describe('FindOneUserReportUseCase', () => {
  let useCase: FindOneUserReportUseCase;
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

    useCase = new FindOneUserReportUseCase(
      reportAccessService,
      powerBiRepository,
    );
  });

  it('deve retornar os dados do relatório junto com o embed token', async () => {
    const reportView: ReportView = {
      id: 'report-id',
      name: 'Relatório Power BI',
      isActive: true,
      externalId: 'external-report-id',
      embedUrl: 'https://embed.url',
      datasetId: 'datasetId-2',
      webUrl: 'webUrl-2',
      workspaceId: 'workspaceId-1',
      lastUpdate: null,
      errors: null,
    };

    const accessToken = { access_token: 'power-bi-access-token' };

    const embedToken = {
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

    expect(result).toEqual({
      ...reportView,
      ...embedToken,
    });
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
      'Failed to authenticate with Power BI: 401',
    );
  });
});
