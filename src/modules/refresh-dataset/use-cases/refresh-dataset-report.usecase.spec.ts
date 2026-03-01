import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshDatasetReportUseCase } from './refresh-dataset-report.usecase';

describe('RefreshDatasetReportUseCase', () => {
  let useCase: RefreshDatasetReportUseCase;

  const reportsRepository = { findById: jest.fn() };
  const powerBiRepository = {
    authenticate: jest.fn(),
    triggerDatasetRefresh: jest.fn(),
  };

  const mockReport = {
    id: 'report-123',
    datasetId: 'dataset-456',
    isActive: true,
  };

  const mockAdminUser = { id: 'user-1', role: 'ADMIN' };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RefreshDatasetReportUseCase(
      reportsRepository as any,
      powerBiRepository as any,
    );
  });

  const setupValidPreConditions = () => {
    reportsRepository.findById.mockResolvedValue({ ...mockReport });
    powerBiRepository.authenticate.mockResolvedValue({
      access_token: 'valid-token',
    });
  };

  describe('execute', () => {
    it('deve disparar o refresh com sucesso (202 Accepted)', async () => {
      setupValidPreConditions();
      powerBiRepository.triggerDatasetRefresh.mockResolvedValue({
        statusCode: 202,
      });

      await expect(
        useCase.execute('report-id', mockAdminUser as any),
      ).resolves.not.toThrow();

      expect(powerBiRepository.triggerDatasetRefresh).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se o Power BI retornar 400 (Já em execução)', async () => {
      setupValidPreConditions();
      powerBiRepository.triggerDatasetRefresh.mockResolvedValue({
        statusCode: 400,
      });

      await expect(
        useCase.execute('report-id', mockAdminUser as any),
      ).rejects.toThrow(
        new BadRequestException('Another refresh request is already executing'),
      );
    });

    it('deve lançar NotFoundException se o dataset não existir no Power BI (404)', async () => {
      setupValidPreConditions();
      powerBiRepository.triggerDatasetRefresh.mockResolvedValue({
        statusCode: 404,
      });

      await expect(
        useCase.execute('report-id', mockAdminUser as any),
      ).rejects.toThrow(
        new NotFoundException('Dataset not found in Power BI workspace'),
      );
    });

    it('deve lançar BadRequestException se o serviço do Power BI estiver fora (500)', async () => {
      setupValidPreConditions();
      powerBiRepository.triggerDatasetRefresh.mockResolvedValue({
        statusCode: 500,
      });

      await expect(
        useCase.execute('report-id', mockAdminUser as any),
      ).rejects.toThrow(
        new BadRequestException('Power BI service is currently unavailable'),
      );
    });

    it('deve lançar UnauthorizedException se o token falhar', async () => {
      reportsRepository.findById.mockResolvedValue({ ...mockReport });

      // CORREÇÃO: Em vez de null, retorne um objeto com statusCode
      powerBiRepository.authenticate.mockResolvedValue({
        statusCode: 401,
      });

      await expect(
        useCase.execute('report-id', mockAdminUser as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    // 2. Otimização: Use test.each para os erros de Refresh (DRY)
    const errorCases = [
      {
        code: 400,
        error: BadRequestException,
        msg: 'Another refresh request is already executing',
      },
      {
        code: 404,
        error: NotFoundException,
        msg: 'Dataset not found in Power BI workspace',
      },
      {
        code: 500,
        error: BadRequestException,
        msg: 'Power BI service is currently unavailable',
      },
    ];

    test.each(errorCases)(
      'deve lançar $error.name quando o Power BI retornar $code',
      async ({ code, error, msg }) => {
        setupValidPreConditions();
        powerBiRepository.triggerDatasetRefresh.mockResolvedValue({
          statusCode: code,
        });

        await expect(
          useCase.execute('report-id', mockAdminUser as any),
        ).rejects.toThrow(new error(msg));
      },
    );

    it('deve lançar ForbiddenException se o usuário não for ADMIN', async () => {
      const commonUser = { id: 'user-2', role: 'USER' };

      await expect(
        useCase.execute('report-id', commonUser as any),
      ).rejects.toThrow(ForbiddenException);

      expect(reportsRepository.findById).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se o relatório não for encontrado', async () => {
      reportsRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('report-id', mockAdminUser as any),
      ).rejects.toThrow(new NotFoundException('Report not found or inactive'));
    });

    it('deve lançar NotFoundException se o relatório estiver inativo', async () => {
      reportsRepository.findById.mockResolvedValue({
        ...mockReport,
        isActive: false,
      });

      await expect(
        useCase.execute('report-id', mockAdminUser as any),
      ).rejects.toThrow(new NotFoundException('Report not found or inactive'));
    });
  });
});
