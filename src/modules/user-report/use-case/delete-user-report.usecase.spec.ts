import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserReport } from '../entities/user-report.entity';
import type { UserReportRepository } from '../repositories/user-report.repository';
import { DeleteUserReportUseCase } from './delete-user-report.usecase';

describe('DeleteUserReportUseCase', () => {
  let useCase: DeleteUserReportUseCase;
  let userReportRepository: jest.Mocked<UserReportRepository>;

  beforeEach(() => {
    userReportRepository = {
      findById: jest.fn(),
      findByUserReport: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UserReportRepository>;

    useCase = new DeleteUserReportUseCase(userReportRepository);
  });

  it('deve lançar ForbiddenException quando o usuário não for ADMIN', async () => {
    await expect(
      useCase.execute(
        { userId: 'user-id', reportId: 'report-id' },
        { id: 'user-id', role: 'USER' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('deve lançar NotFoundException quando a relação não existir', async () => {
    userReportRepository.findByUserReport.mockResolvedValue(null);

    await expect(
      useCase.execute(
        { userId: 'user-id', reportId: 'report-id' },
        { id: 'admin-id', role: 'ADMIN' },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(userReportRepository.findByUserReport).toHaveBeenCalledWith(
      'user-id',
      'report-id',
    );
  });

  it('deve lançar BadRequestException quando ocorrer erro ao deletar', async () => {
    const userReport = UserReport.fromPersistence({
      id: 'relation-id',
      userId: 'user-id',
      reportId: 'report-id',
    });

    userReportRepository.findByUserReport.mockResolvedValue(userReport);
    userReportRepository.delete.mockResolvedValue(false);

    await expect(
      useCase.execute(
        { userId: 'user-id', reportId: 'report-id' },
        { id: 'admin-id', role: 'ADMIN' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(userReportRepository.delete).toHaveBeenCalledWith('relation-id');
  });

  it('deve deletar a relação com sucesso quando ADMIN', async () => {
    const userReport = UserReport.fromPersistence({
      id: 'relation-id',
      userId: 'user-id',
      reportId: 'report-id',
    });

    userReportRepository.findByUserReport.mockResolvedValue(userReport);
    userReportRepository.delete.mockResolvedValue(true);

    await expect(
      useCase.execute(
        { userId: 'user-id', reportId: 'report-id' },
        { id: 'admin-id', role: 'ADMIN' },
      ),
    ).resolves.toBeUndefined();

    expect(userReportRepository.findByUserReport).toHaveBeenCalledWith(
      'user-id',
      'report-id',
    );
    expect(userReportRepository.delete).toHaveBeenCalledWith('relation-id');
  });
});
