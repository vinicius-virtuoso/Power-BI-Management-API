import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserRequest } from '../../decorators/user-request.decorator';
import type { LoggedUserProps } from '../../shared/types/logged-user.types';
import { CheckReportRefreshStatusUseCase } from './use-cases/check-report-refresh-status.usecase';
import { RefreshDatasetReportUseCase } from './use-cases/refresh-dataset-report.usecase';

@Controller('refresh-dataset')
export class RefreshDatasetController {
  constructor(
    private readonly refreshDatasetReportUseCase: RefreshDatasetReportUseCase,
    private readonly checkReportRefreshStatusUseCase: CheckReportRefreshStatusUseCase,
  ) {}

  @Post(':reportId/refreshes')
  create(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.refreshDatasetReportUseCase.execute(reportId, loggedUser);
  }

  @Get(':reportId/check/refreshes')
  check(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.checkReportRefreshStatusUseCase.execute(reportId, loggedUser);
  }
}
