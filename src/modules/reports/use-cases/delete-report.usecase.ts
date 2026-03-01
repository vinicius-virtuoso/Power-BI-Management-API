import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import { REPORTS_REPOSITORY } from '../reports.providers';
import { ReportsRepository } from './../repositories/reports.repository';

@Injectable()
export class DeleteReportUseCase {
  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepository,
  ) {}

  async execute(reportId: string, loggedUser: LoggedUserProps): Promise<void> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException();
    }

    const reportFound = await this.reportsRepository.findById(reportId);

    if (!reportFound) {
      throw new NotFoundException('Report not found');
    }

    const isDeleted = await this.reportsRepository.delete(reportId);

    if (!isDeleted) {
      throw new BadRequestException('Error on delete');
    }
  }
}
