import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateScheduleUseCase } from './update-schedule.usecase';

describe('UpdateScheduleUseCase', () => {
  let useCase: UpdateScheduleUseCase;

  const scheduleRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const adminUser = { id: 'admin-1', role: 'ADMIN' };
  const commonUser = { id: 'user-1', role: 'USER' };
  const scheduleId = 'schedule-uuid';

  const mockUpdateDto = {
    hoursCommon: ['10', '15'],
    isClosingDays: true,
    closingDays: ['10'],
    hoursClosingDays: ['20'],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new UpdateScheduleUseCase(scheduleRepo as any);
  });

  const createMockEntity = (overrides = {}) => ({
    update: jest.fn().mockReturnThis(),
    activate: jest.fn().mockReturnThis(),
    deactivate: jest.fn().mockReturnThis(),
    toView: jest.fn().mockReturnValue({ id: scheduleId, ...mockUpdateDto }),
    ...overrides,
  });

  it('deve atualizar um agendamento com sucesso (sem alterar isActive)', async () => {
    const mockEntity = createMockEntity();
    scheduleRepo.findById.mockResolvedValue(mockEntity);
    scheduleRepo.update.mockResolvedValue(mockEntity);

    const result = await useCase.execute(
      scheduleId,
      mockUpdateDto as any,
      adminUser as any,
    );

    expect(mockEntity.update).toHaveBeenCalledWith(mockUpdateDto);
    expect(scheduleRepo.update).toHaveBeenCalled();
    expect(result.id).toBe(scheduleId);
  });

  it('deve ativar o agendamento quando isActive for true no DTO', async () => {
    const mockEntity = createMockEntity();
    scheduleRepo.findById.mockResolvedValue(mockEntity);
    scheduleRepo.update.mockResolvedValue(mockEntity);

    await useCase.execute(scheduleId, { isActive: true }, adminUser as any);

    expect(mockEntity.activate).toHaveBeenCalled();
    expect(mockEntity.deactivate).not.toHaveBeenCalled();
  });

  it('deve desativar o agendamento quando isActive for false no DTO', async () => {
    const mockEntity = createMockEntity();
    scheduleRepo.findById.mockResolvedValue(mockEntity);
    scheduleRepo.update.mockResolvedValue(mockEntity);

    await useCase.execute(scheduleId, { isActive: false }, adminUser as any);

    expect(mockEntity.deactivate).toHaveBeenCalled();
    expect(mockEntity.activate).not.toHaveBeenCalled();
  });

  it('deve lançar ForbiddenException se o usuário não for ADMIN', async () => {
    await expect(
      useCase.execute(scheduleId, {}, commonUser as any),
    ).rejects.toThrow(ForbiddenException);

    expect(scheduleRepo.findById).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se o agendamento não existir', async () => {
    scheduleRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(scheduleId, {}, adminUser as any),
    ).rejects.toThrow(new NotFoundException('Schedule not found'));
  });
});
