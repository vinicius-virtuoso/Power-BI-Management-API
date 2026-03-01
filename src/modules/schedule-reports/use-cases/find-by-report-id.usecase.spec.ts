import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SCHEDULE_REPORTS_REPOSITORY } from '../schedule-reports.providers';
import { FindByReportIdUseCase } from './find-by-report-id.usecase';

describe('FindByReportIdUseCase', () => {
  let useCase: FindByReportIdUseCase;
  let scheduleRepo: any;

  const adminUser = { id: 'admin-1', role: 'ADMIN' };
  const commonUser = { id: 'user-1', role: 'USER' };
  const reportId = 'report-uuid-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByReportIdUseCase,
        {
          provide: SCHEDULE_REPORTS_REPOSITORY,
          useValue: {
            findByReportId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<FindByReportIdUseCase>(FindByReportIdUseCase);
    scheduleRepo = module.get(SCHEDULE_REPORTS_REPOSITORY);
  });

  it('deve retornar o agendamento vinculado ao reportId para um ADMIN', async () => {
    const mockView = { id: 'schedule-1', reportId };
    const mockScheduleEntity = {
      toView: jest.fn().mockReturnValue(mockView),
    };

    scheduleRepo.findByReportId.mockResolvedValue(mockScheduleEntity);

    const result = await useCase.execute(reportId, adminUser as any);

    expect(scheduleRepo.findByReportId).toHaveBeenCalledWith(reportId);
    expect(mockScheduleEntity.toView).toHaveBeenCalled();
    expect(result).toEqual(mockView);
  });

  it('deve lançar ForbiddenException se o usuário não for ADMIN', async () => {
    await expect(useCase.execute(reportId, commonUser as any)).rejects.toThrow(
      ForbiddenException,
    );

    expect(scheduleRepo.findByReportId).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException com a mensagem correta se não houver agendamento para o relatório', async () => {
    scheduleRepo.findByReportId.mockResolvedValue(null);

    await expect(useCase.execute(reportId, adminUser as any)).rejects.toThrow(
      new NotFoundException('No schedule found for this report'),
    );

    expect(scheduleRepo.findByReportId).toHaveBeenCalledWith(reportId);
  });
});
