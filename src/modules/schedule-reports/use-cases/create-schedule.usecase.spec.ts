import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { REPORTS_REPOSITORY } from '../../reports/reports.providers';
import { ScheduleReport } from '../entities/schedule-report.entity';
import { SCHEDULE_REPORTS_REPOSITORY } from '../schedule-reports.providers';
import { CreateScheduleUseCase } from './create-schedule.usecase';

describe('CreateScheduleUseCase', () => {
  let useCase: CreateScheduleUseCase;
  let scheduleRepo: any;
  let reportsRepo: any;

  const mockDto = {
    reportId: 'report-123',
    hoursCommon: ['09:00'],
    isClosingDays: false,
    closingDays: [],
    hoursClosingDays: [],
  };

  const adminUser = { id: 'admin-1', role: 'ADMIN' };
  const commonUser = { id: 'user-1', role: 'USER' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateScheduleUseCase,
        {
          provide: SCHEDULE_REPORTS_REPOSITORY,
          useValue: { findByReportId: jest.fn(), save: jest.fn() },
        },
        {
          provide: REPORTS_REPOSITORY,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<CreateScheduleUseCase>(CreateScheduleUseCase);
    scheduleRepo = module.get(SCHEDULE_REPORTS_REPOSITORY);
    reportsRepo = module.get(REPORTS_REPOSITORY);
  });

  it('deve criar um agendamento com sucesso (Caminho Feliz)', async () => {
    reportsRepo.findById.mockResolvedValue({ id: 'report-123' });
    scheduleRepo.findByReportId.mockResolvedValue(null);

    const mockCreatedEntity = {
      toView: jest.fn().mockReturnValue({ id: 'schedule-1', ...mockDto }),
    };
    scheduleRepo.save.mockResolvedValue(mockCreatedEntity);

    const result = await useCase.execute(mockDto as any, adminUser as any);

    expect(result).toBeDefined();
    expect(scheduleRepo.save).toHaveBeenCalledWith(expect.any(ScheduleReport));
    expect(result.id).toBe('schedule-1');
  });

  it('deve lançar ForbiddenException se o usuário não for ADMIN', async () => {
    await expect(
      useCase.execute(mockDto as any, commonUser as any),
    ).rejects.toThrow(ForbiddenException);

    expect(reportsRepo.findById).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se o relatório não existir', async () => {
    reportsRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(mockDto as any, adminUser as any),
    ).rejects.toThrow(new NotFoundException('Relatório não encontrado'));
  });

  it('deve lançar ConflictException se o relatório já possuir um agendamento', async () => {
    reportsRepo.findById.mockResolvedValue({ id: 'report-123' });
    scheduleRepo.findByReportId.mockResolvedValue({ id: 'existing-schedule' });

    await expect(
      useCase.execute(mockDto as any, adminUser as any),
    ).rejects.toThrow(
      new ConflictException(
        'Já existe um agendamento configurado para este relatório',
      ),
    );
  });
});
