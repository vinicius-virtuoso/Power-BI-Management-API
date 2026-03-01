import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { UserReportRepository } from '../repositories/user-report.repository';
import { USER_REPORT_REPOSITORY } from '../user-report.provider';

@Injectable()
export class DeleteUserReportUseCase {
  constructor(
    @Inject(USER_REPORT_REPOSITORY)
    private readonly userReportRepository: UserReportRepository,
  ) {}

  async execute(
    data: {
      userReportId: string;
    },
    loggedUser: LoggedUserProps,
  ): Promise<void> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException();
    }

    const userReportFound = await this.userReportRepository.findById(
      data.userReportId,
    );

    if (!userReportFound) {
      throw new NotFoundException('Relation not found');
    }

    const isDeleted = await this.userReportRepository.delete(data.userReportId);

    if (!isDeleted) {
      throw new BadRequestException('Error on delete');
    }
  }
}
