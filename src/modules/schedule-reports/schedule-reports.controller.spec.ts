import { Test, TestingModule } from '@nestjs/testing';
import { CreateScheduleReportDto } from './dto/create-schedule-report.dto';
import { UpdateScheduleReportDto } from './dto/update-schedule-report.dto';
import { ScheduleReportsController } from './schedule-reports.controller';
import { CreateScheduleUseCase } from './use-cases/create-schedule.usecase';
import { DeleteScheduleUseCase } from './use-cases/delete-schedule.usecase';
import { FindAllScheduleUseCase } from './use-cases/find-all-schedule.usecase';
import { FindByIdScheduleUseCase } from './use-cases/find-by-id-schedule.usecase';
import { FindByReportIdUseCase } from './use-cases/find-by-report-id.usecase';
import { UpdateScheduleUseCase } from './use-cases/update-schedule.usecase';

describe('ScheduleReportsController', () => {
  let controller: ScheduleReportsController;

  // Mocks dos Use Cases
  const mockCreateUseCase = { execute: jest.fn() };
  const mockFindAllUseCase = { execute: jest.fn() };
  const mockUpdateUseCase = { execute: jest.fn() };
  const mockFindByIdUseCase = { execute: jest.fn() };
  const mockFindByReportIdUseCase = { execute: jest.fn() };
  const mockDeleteUseCase = { execute: jest.fn() };

  const mockUser = { id: 'user-123', role: 'ADMIN' };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleReportsController],
      providers: [
        { provide: CreateScheduleUseCase, useValue: mockCreateUseCase },
        { provide: FindAllScheduleUseCase, useValue: mockFindAllUseCase },
        { provide: UpdateScheduleUseCase, useValue: mockUpdateUseCase },
        { provide: FindByIdScheduleUseCase, useValue: mockFindByIdUseCase },
        { provide: FindByReportIdUseCase, useValue: mockFindByReportIdUseCase },
        { provide: DeleteScheduleUseCase, useValue: mockDeleteUseCase },
      ],
    }).compile();

    controller = module.get<ScheduleReportsController>(
      ScheduleReportsController,
    );
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar o CreateScheduleUseCase com os parâmetros corretos', async () => {
      const dto: CreateScheduleReportDto = {
        reportId: 'rep-1',
        hoursCommon: ['08'] as any,
        isClosingDays: false,
        closingDays: [],
        hoursClosingDays: [],
      };
      mockCreateUseCase.execute.mockResolvedValue({ id: '1' });

      const result = await controller.create(dto, mockUser as any);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('findAll', () => {
    it('deve chamar o FindAllScheduleUseCase passando o usuário logado', async () => {
      const mockResult = { total: 1, schedules: [] };
      mockFindAllUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.findAll(mockUser as any);

      expect(mockFindAllUseCase.execute).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findById', () => {
    it('deve chamar o FindByIdScheduleUseCase com o ID correto', async () => {
      const id = 'schedule-uuid';
      mockFindByIdUseCase.execute.mockResolvedValue({ id });

      const result = await controller.findById(id, mockUser as any);

      expect(mockFindByIdUseCase.execute).toHaveBeenCalledWith(id, mockUser);
      expect(result.id).toBe(id);
    });
  });

  describe('findByReportId', () => {
    it('deve chamar o FindByReportIdUseCase com o reportId correto', async () => {
      const reportId = 'report-uuid';
      mockFindByReportIdUseCase.execute.mockResolvedValue({ reportId });

      const result = await controller.findByReportId(reportId, mockUser as any);

      expect(mockFindByReportIdUseCase.execute).toHaveBeenCalledWith(
        reportId,
        mockUser,
      );
      expect(result.reportId).toBe(reportId);
    });
  });

  describe('update', () => {
    it('deve chamar o UpdateScheduleUseCase com ID, DTO e usuário logado', async () => {
      const id = 'schedule-uuid';
      const dto: UpdateScheduleReportDto = { hoursCommon: ['10'] as any };
      mockUpdateUseCase.execute.mockResolvedValue({ id, ...dto });

      const result = await controller.update(id, dto, mockUser as any);

      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(id, dto, mockUser);
      expect(result.id).toBe(id);
    });
  });

  describe('delete', () => {
    it('deve chamar o DeleteScheduleUseCase com o ID do agendamento', async () => {
      const id = 'schedule-uuid';
      mockDeleteUseCase.execute.mockResolvedValue(undefined);

      await controller.delete(id, mockUser as any);

      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith(id, mockUser);
    });
  });
});
