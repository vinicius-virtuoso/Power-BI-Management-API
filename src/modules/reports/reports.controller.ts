import { Controller, Delete, HttpCode, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
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
@ApiResponse({
  status: 401,
  description: 'Falha na autenticação.',
  content: {
    'application/json': {
      example: {
        statusCode: 401,
        message: 'Token é invalido ou está ausente',
        error: 'Unauthorized',
      },
    },
  },
})
@ApiResponse({
  status: 403,
  description: 'Permissão insuficiente.',
  content: {
    'application/json': {
      example: {
        statusCode: 403,
        message: 'Você não tem permissão para acessa este recurso', // Mensagem atualizada!
        error: 'Forbidden',
      },
    },
  },
})
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
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Falha na autenticação: 401',
          error: 'Unauthorized',
        },
      },
    },
  })
  sync(@UserRequest() loggedUser: LoggedUserProps) {
    return this.syncReportsPowerBIUseCase.execute(loggedUser);
  }

  @Patch('activate/:reportId')
  @ApiOperation({ summary: 'Ativar um relatório' })
  @ApiParam({
    name: 'reportId',
    description: 'ID do relatório',
    example: 'uuid-v4',
  })
  @ApiResponse({ status: 200, type: ReportViewDto })
  @ApiResponse({
    status: 400,
    description: 'Erro na operação.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Erro ao ativar o relatório',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Relatório não encontrado',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Relatório não encontrado',
          error: 'NotFound',
        },
      },
    },
  })
  activate(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.activateReportUseCase.execute(reportId, loggedUser);
  }

  @Patch('deactivate/:reportId')
  @ApiOperation({ summary: 'Desativar um relatório' })
  @ApiParam({
    name: 'reportId',
    description: 'ID do relatório',
    example: 'uuid-v4',
  })
  @ApiResponse({ status: 200, type: ReportViewDto })
  @ApiResponse({
    status: 400,
    description: 'Erro na operação.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Erro ao desativar o relatório',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Relatório não encontrado',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Relatório não encontrado',
          error: 'NotFound',
        },
      },
    },
  })
  deactivate(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deactivateReportUseCase.execute(reportId, loggedUser);
  }

  @Delete('report/:reportId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir um relatório permanentemente' })
  @ApiParam({
    name: 'reportId',
    description: 'ID do relatório',
    example: 'uuid-v4',
  })
  @ApiResponse({ status: 204, description: 'Relatório excluído com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Erro ao excluir relatório',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Erro ao excluir relatório',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Relatório não encontrado',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Relatório não encontrado',
          error: 'NotFound',
        },
      },
    },
  })
  delete(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deleteReportUseCase.execute(reportId, loggedUser);
  }
}
