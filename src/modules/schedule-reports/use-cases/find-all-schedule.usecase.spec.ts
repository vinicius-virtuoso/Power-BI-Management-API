import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SCHEDULE_REPORTS_REPOSITORY } from '../schedule-reports.providers';
import { FindAllScheduleUseCase } from './find-all-schedule.usecase';

describe('FindAllScheduleUseCase', () => {
  let useCase: FindAllScheduleUseCase;
  let scheduleRepo: any;

  const adminUser = { id: 'admin-1', role: 'ADMIN' };
  const commonUser = { id: 'user-1', role: 'USER' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllScheduleUseCase,
        {
          provide: SCHEDULE_REPORTS_REPOSITORY,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<FindAllScheduleUseCase>(FindAllScheduleUseCase);
    scheduleRepo = module.get(SCHEDULE_REPORTS_REPOSITORY);
  });

  it('deve retornar a lista paginada de agendamentos se o usuário for ADMIN', async () => {
    // Arrange: Criamos mocks de entidades que possuem o método toView
    const mockScheduleEntity = {
      toView: jest
        .fn()
        .mockReturnValue({ id: 'schedule-1', reportId: 'report-1' }),
    };
    const mockSchedules = [mockScheduleEntity, mockScheduleEntity];

    scheduleRepo.findAll.mockResolvedValue(mockSchedules);

    // Act
    const result = await useCase.execute(adminUser as any);

    // Assert
    expect(scheduleRepo.findAll).toHaveBeenCalled();
    expect(mockScheduleEntity.toView).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      total: 2,
      schedules: [
        { id: 'schedule-1', reportId: 'report-1' },
        { id: 'schedule-1', reportId: 'report-1' },
      ],
    });
  });

  it('deve retornar uma lista vazia e total zero quando não houver agendamentos', async () => {
    // Arrange
    scheduleRepo.findAll.mockResolvedValue([]);

    // Act
    const result = await useCase.execute(adminUser as any);

    // Assert
    expect(result).toEqual({
      total: 0,
      schedules: [],
    });
  });

  it('deve lançar ForbiddenException se o usuário não for ADMIN', async () => {
    // Act & Assert
    await expect(useCase.execute(commonUser as any)).rejects.toThrow(
      ForbiddenException,
    );

    // Garante que o repositório nem foi tocado
    expect(scheduleRepo.findAll).not.toHaveBeenCalled();
  });
});
