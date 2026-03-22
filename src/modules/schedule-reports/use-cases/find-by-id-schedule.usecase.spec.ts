import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FindByIdScheduleUseCase } from './find-by-id-schedule.usecase';

describe('FindByIdScheduleUseCase', () => {
  let useCase: FindByIdScheduleUseCase;

  const scheduleRepo = {
    findById: jest.fn(),
  };

  const adminUser = { id: 'admin-1', role: 'ADMIN' };
  const commonUser = { id: 'user-1', role: 'USER' };
  const scheduleId = 'schedule-uuid-123';

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new FindByIdScheduleUseCase(scheduleRepo as any);
  });

  it('deve retornar a view do agendamento quando encontrado por um ADMIN', async () => {
    const mockView = { id: scheduleId, reportId: 'report-1' };
    const mockScheduleEntity = {
      id: scheduleId,
      toView: jest.fn().mockReturnValue(mockView),
    };
    scheduleRepo.findById.mockResolvedValue(mockScheduleEntity);

    const result = await useCase.execute(scheduleId, adminUser as any);

    expect(scheduleRepo.findById).toHaveBeenCalledWith(scheduleId);
    expect(mockScheduleEntity.toView).toHaveBeenCalled();
    expect(result).toEqual(mockView);
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
      new NotFoundException('Agendamento não encontrado'),
    );

    expect(scheduleRepo.findById).toHaveBeenCalledWith(scheduleId);
  });
});
