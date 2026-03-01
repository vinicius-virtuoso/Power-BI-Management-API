import { Test, TestingModule } from '@nestjs/testing';
import { RefreshDatasetController } from './refresh-dataset.controller';
import { CheckReportRefreshStatusUseCase } from './use-cases/check-report-refresh-status.usecase';
import { RefreshDatasetReportUseCase } from './use-cases/refresh-dataset-report.usecase';

describe('RefreshDatasetController', () => {
  let controller: RefreshDatasetController;
  let refreshUseCase: RefreshDatasetReportUseCase;
  let checkStatusUseCase: CheckReportRefreshStatusUseCase;

  const mockLoggedUser = { id: 'user-1', role: 'ADMIN' };
  const reportId = 'report-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshDatasetController],
      providers: [
        {
          provide: RefreshDatasetReportUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CheckReportRefreshStatusUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<RefreshDatasetController>(RefreshDatasetController);
    refreshUseCase = module.get<RefreshDatasetReportUseCase>(
      RefreshDatasetReportUseCase,
    );
    checkStatusUseCase = module.get<CheckReportRefreshStatusUseCase>(
      CheckReportRefreshStatusUseCase,
    );
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create (POST)', () => {
    it('deve chamar RefreshDatasetReportUseCase com os parâmetros corretos', async () => {
      const executeSpy = jest
        .spyOn(refreshUseCase, 'execute')
        .mockResolvedValue(undefined);

      await controller.create(reportId, mockLoggedUser as any);

      expect(executeSpy).toHaveBeenCalledWith(reportId, mockLoggedUser);
    });
  });

  describe('check (GET)', () => {
    it('deve chamar CheckReportRefreshStatusUseCase com os parâmetros corretos', async () => {
      const mockResult = { id: reportId, status: 'Completed' } as any;
      const executeSpy = jest
        .spyOn(checkStatusUseCase, 'execute')
        .mockResolvedValue(mockResult);

      const result = await controller.check(reportId, mockLoggedUser as any);

      expect(executeSpy).toHaveBeenCalledWith(reportId, mockLoggedUser);
      expect(result).toBe(mockResult);
    });
  });
});
