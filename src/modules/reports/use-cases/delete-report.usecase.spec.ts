import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { REPORTS_REPOSITORY } from '../reports.providers';
import { DeleteReportUseCase } from './delete-report.usecase';

describe('DeleteReportUseCase', () => {
  let useCase: DeleteReportUseCase;
  let reportsRepository: any;

  const mockAdminUser = { id: 'user-1', role: 'ADMIN' };
  const mockCommonUser = { id: 'user-2', role: 'USER' };
  const reportId = 'report-uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteReportUseCase,
        {
          provide: REPORTS_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteReportUseCase>(DeleteReportUseCase);
    reportsRepository = module.get(REPORTS_REPOSITORY);
  });

  it('deve excluir um relatório com sucesso quando o usuário é ADMIN e o relatório existe', async () => {
    reportsRepository.findById.mockResolvedValue({ id: reportId });
    reportsRepository.delete.mockResolvedValue(true);

    await expect(
      useCase.execute(reportId, mockAdminUser as any),
    ).resolves.not.toThrow();
    expect(reportsRepository.findById).toHaveBeenCalledWith(reportId);
    expect(reportsRepository.delete).toHaveBeenCalledWith(reportId);
  });

  it('deve lançar ForbiddenException se o usuário não for ADMIN', async () => {
    await expect(
      useCase.execute(reportId, mockCommonUser as any),
    ).rejects.toThrow(ForbiddenException);

    expect(reportsRepository.findById).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se o relatório não for encontrado', async () => {
    reportsRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(reportId, mockAdminUser as any),
    ).rejects.toThrow(new NotFoundException('Report not found'));

    expect(reportsRepository.delete).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException se o repositório retornar falha na exclusão', async () => {
    reportsRepository.findById.mockResolvedValue({ id: reportId });
    reportsRepository.delete.mockResolvedValue(false);

    await expect(
      useCase.execute(reportId, mockAdminUser as any),
    ).rejects.toThrow(new BadRequestException('Error on delete'));
  });
});
