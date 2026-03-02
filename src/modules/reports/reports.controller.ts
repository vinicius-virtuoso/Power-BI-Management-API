import { Controller, Delete, HttpCode, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRequest } from '../../decorators/user-request.decorator';
import type { LoggedUserProps } from '../../shared/types/logged-user.types';
import { PaginatedReportsDto, ReportViewDto } from './dto/report-response.dto';
import { ActivateReportUseCase } from './use-cases/activate-report.usecase';
import { DeactivateReportUseCase } from './use-cases/deactivate-report.usecase';
import { DeleteReportUseCase } from './use-cases/delete-report.usecase';
import { SyncReportsPowerBIUseCase } from './use-cases/sync-reports-for-power-bi.use-case';

@ApiTags('Gerenciamento de Relatórios (Admin)')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly syncReportsPowerBIUseCase: SyncReportsPowerBIUseCase,
    private readonly activateReportUseCase: ActivateReportUseCase,
    private readonly deactivateReportUseCase: DeactivateReportUseCase,
    private readonly deleteReportUseCase: DeleteReportUseCase,
  ) {}

  @Patch('sync')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Sincronizar relatórios com o Power BI',
    description:
      'Busca relatórios no Workspace e sincroniza com o banco local. Requer perfil ADMIN.',
  })
  @ApiResponse({ status: 201, type: PaginatedReportsDto })
  @ApiResponse({
    status: 401,
    description: 'Falha na autenticação com Power BI.',
  }) //
  create(@UserRequest() loggedUser: LoggedUserProps) {
    return this.syncReportsPowerBIUseCase.execute(loggedUser);
  }

  @Patch('activate/:reportId')
  @ApiOperation({ summary: 'Ativar um relatório' })
  @ApiResponse({ status: 200, type: ReportViewDto })
  @ApiResponse({
    status: 400,
    description: 'Erro ao ativar relatório no banco.',
  }) //
  @ApiResponse({ status: 404, description: 'Relatório não encontrado.' })
  activate(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.activateReportUseCase.execute(reportId, loggedUser);
  }

  @Patch('deactivate/:reportId')
  @ApiOperation({ summary: 'Ativar um relatório' })
  @ApiResponse({ status: 200, type: ReportViewDto })
  @ApiResponse({
    status: 400,
    description: 'Erro ao ativar relatório no banco.',
  }) //
  @ApiResponse({ status: 404, description: 'Relatório não encontrado.' })
  deactivate(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deactivateReportUseCase.execute(reportId, loggedUser);
  }

  @Delete(':reportId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir um relatório permanentemente' })
  @ApiResponse({ status: 204, description: 'Relatório excluído com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro ao processar exclusão.' }) //
  delete(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deleteReportUseCase.execute(reportId, loggedUser);
  }
}
