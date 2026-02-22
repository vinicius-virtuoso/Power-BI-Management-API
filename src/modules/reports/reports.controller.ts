import { Controller, HttpCode, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRequest } from '../../decorators/user-request.decorator';
import { ActivateReportUseCase } from './use-cases/activate-report.usecase';
import { DeactivateReportUseCase } from './use-cases/deactivate-report.usecase';
import { SyncReportsPowerBIUseCase } from './use-cases/sync-reports-for-power-bi.use-case';

export type LoggedUserProps = {
  id: string;
  role: 'USER' | 'ADMIN';
};

@ApiTags('Gerenciamento de Relatórios (Admin)')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Não autorizado: Token ausente ou inválido.',
})
@ApiResponse({
  status: 403,
  description: 'Proibido: Apenas administradores podem gerenciar relatórios.',
})
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly syncReportsPowerBIUseCase: SyncReportsPowerBIUseCase,
    private readonly activateReportUseCase: ActivateReportUseCase,
    private readonly deactivateReportUseCase: DeactivateReportUseCase,
  ) {}

  @Patch('sync')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Sincronizar relatórios com o Power BI',
    description:
      'Busca todos os relatórios disponíveis no Workspace do Power BI e atualiza/insere no banco de dados local.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sincronização realizada com sucesso.',
  })
  create(@UserRequest() loggedUser: LoggedUserProps) {
    return this.syncReportsPowerBIUseCase.execute(loggedUser);
  }

  @Patch('activate/:reportId')
  @ApiOperation({ summary: 'Ativar um relatório para visualização' })
  @ApiParam({
    name: 'reportId',
    description: 'ID do relatório no banco local',
    example: 'uuid-v4',
  })
  @ApiResponse({ status: 200, description: 'Relatório ativado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado.' })
  activate(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.activateReportUseCase.execute(reportId, loggedUser);
  }

  @Patch('deactivate/:reportId')
  @ApiOperation({ summary: 'Desativar um relatório (Esconder para usuários)' })
  @ApiParam({
    name: 'reportId',
    description: 'ID do relatório no banco local',
    example: 'uuid-v4',
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório desativado com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado.' })
  deactivate(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deactivateReportUseCase.execute(reportId, loggedUser);
  }
}
