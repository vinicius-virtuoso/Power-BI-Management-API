import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SCHEDULE_REPORTS_REPOSITORY } from '../schedule-reports.providers';
import { DeleteScheduleUseCase } from './delete-schedule.usecase';

describe('DeleteScheduleUseCase', () => {
  let useCase: DeleteScheduleUseCase;
  let scheduleRepo: any;

  const adminUser = { id: 'admin-1', role: 'ADMIN' };
  const commonUser = { id: 'user-1', role: 'USER' };
  const scheduleId = 'schedule-uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteScheduleUseCase,
        {
          provide: SCHEDULE_REPORTS_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteScheduleUseCase>(DeleteScheduleUseCase);
    scheduleRepo = module.get(SCHEDULE_REPORTS_REPOSITORY);
  });

  it('deve deletar um agendamento com sucesso se o usuário for ADMIN', async () => {
    scheduleRepo.findById.mockResolvedValue({ id: scheduleId });
    scheduleRepo.delete.mockResolvedValue(undefined);

    await useCase.execute(scheduleId, adminUser as any);

    expect(scheduleRepo.findById).toHaveBeenCalledWith(scheduleId);
    expect(scheduleRepo.delete).toHaveBeenCalledWith(scheduleId);
  });

  it('deve lançar ForbiddenException se o usuário não for ADMIN', async () => {
    await expect(
      useCase.execute(scheduleId, commonUser as any),
    ).rejects.toThrow(ForbiddenException);

    expect(scheduleRepo.findById).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se o agendamento não existir', async () => {
    scheduleRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(scheduleId, adminUser as any)).rejects.toThrow(
      new NotFoundException('Schedule not found'),
    );

    expect(scheduleRepo.delete).not.toHaveBeenCalled();
  });
});
