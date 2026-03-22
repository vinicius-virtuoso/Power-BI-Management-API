import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import { REPORTS_REPOSITORY } from '../../reports/reports.providers';
import type { ReportsRepository } from '../../reports/repositories/reports.repository';
import type { UsersRepository } from '../../users/repositories/users.repository';
import { USERS_REPOSITORY } from '../../users/users.providers';
import type { UserReportView } from '../entities/user-report.entity';
import type { UserReportRepository } from '../repositories/user-report.repository';
import { USER_REPORT_REPOSITORY } from '../user-report.provider';

export type UserReportProps = {
  userId: string;
  reportId: string;
};

@Injectable()
export class CreateUserReportUseCase {
  constructor(
    @Inject(USER_REPORT_REPOSITORY)
    private readonly userReportRepository: UserReportRepository,

    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: ReportsRepository,

    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    data: UserReportProps,
    loggedUser: LoggedUserProps,
  ): Promise<UserReportView> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Você não tem permissão para acessa este recurso',
      );
    }

    const reportFound = await this.reportsRepository.findById(data.reportId);

    if (!reportFound) {
      throw new NotFoundException('Relatório não encontrado');
    }

    const userFound = await this.usersRepository.findById(data.userId);

    if (!userFound) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const userReportFound = await this.userReportRepository.findByUserReport(
      data.userId!,
      data.reportId!,
    );

    if (!userReportFound) {
      const userReportCreated = await this.userReportRepository.save(
        data.reportId,
        data.userId,
      );

      return userReportCreated.toView();
    }

    return userReportFound.toView();
  }
}
