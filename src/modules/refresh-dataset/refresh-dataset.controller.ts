import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRequest } from '../../decorators/user-request.decorator';
import type { LoggedUserProps } from '../../shared/types/logged-user.types';
import { RefreshDatasetViewDto } from './dto/refresh-dataset-view.dto';
import { CheckReportRefreshStatusUseCase } from './use-cases/check-report-refresh-status.usecase';
import { RefreshDatasetReportUseCase } from './use-cases/refresh-dataset-report.usecase';

@ApiTags('Atualizar conjunto de dados')
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
        message: 'Você não tem permissão para acessa este recurso',
        error: 'Forbidden',
      },
    },
  },
})
@Controller('refresh-dataset')
export class RefreshDatasetController {
  constructor(
    private readonly refreshDatasetReportUseCase: RefreshDatasetReportUseCase,
    private readonly checkReportRefreshStatusUseCase: CheckReportRefreshStatusUseCase,
  ) {}

  @Post(':reportId/refreshes')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Dispara uma nova atualização de dataset no Power BI',
    description:
      'Solicita ao Power BI que inicie o processamento dos dados. Requer perfil ADMIN.',
  })
  @ApiParam({
    name: 'reportId',
    description: 'ID do relatório no sistema',
    example: 'uuid-v4',
  })
  @ApiResponse({
    status: 201,
    description: 'Refresh solicitado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na solicitação ou serviço indisponível.',
    content: {
      'application/json': {
        examples: {
          alreadyRunning: {
            summary: 'Atualização em execução',
            value: {
              statusCode: 400,
              message: 'Outra solicitação de atualização já está em execução',
              error: 'Bad Request',
            },
          },
          serviceUnavailable: {
            summary: 'Serviço PBI Indisponível',
            value: {
              statusCode: 400,
              message: 'O serviço Power BI está atualmente indisponível',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Relatório ou Dataset não encontrado.',
    content: {
      'application/json': {
        examples: {
          notFoundDb: {
            summary: 'Banco local',
            value: {
              statusCode: 404,
              message: 'Relatório não encontrado ou inativo',
              error: 'Not Found',
            },
          },
          notFoundPbi: {
            summary: 'Workspace PBI',
            value: {
              statusCode: 404,
              message:
                'Conjunto de dados não encontrado no espaço de trabalho do Power BI',
              error: 'Not Found',
            },
          },
        },
      },
    },
  })
  create(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.refreshDatasetReportUseCase.execute(reportId, loggedUser);
  }

  @Get(':reportId/check/refreshes')
  @ApiOperation({
    summary: 'Sincroniza o status da atualização do relatório',
    description:
      'Consulta o Power BI para verificar se a atualização disparada foi concluída.',
  })
  @ApiParam({
    name: 'reportId',
    description: 'ID do relatório no sistema',
    example: 'uuid-v4',
  })
  @ApiResponse({
    status: 200,
    description: 'Status sincronizado com sucesso.',
    type: RefreshDatasetViewDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Relatório ou Dataset não encontrado.',
    content: {
      'application/json': {
        examples: {
          notFoundDb: {
            summary: 'Banco local',
            value: {
              statusCode: 404,
              message: 'Relatório não encontrado ou inativo',
              error: 'Not Found',
            },
          },
          notFoundPbi: {
            summary: 'Workspace PBI',
            value: {
              statusCode: 404,
              message:
                'Conjunto de dados não encontrado no espaço de trabalho do Power BI',
              error: 'Not Found',
            },
          },
        },
      },
    },
  })
  check(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.checkReportRefreshStatusUseCase.execute(reportId, loggedUser);
  }
}
