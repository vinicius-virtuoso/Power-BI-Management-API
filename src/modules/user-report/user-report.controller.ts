import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRequest } from '../../decorators/user-request.decorator';
import type { LoggedUserProps } from '../../shared/types/logged-user.types';
import { CreateUserReportDto } from './dto/create-user-report.dto';
import { DeleteUserReportDto } from './dto/delete-user-report.dto';
import { FindAllReportsViewDto } from './dto/find-all-reports-view.dto'; // DTO de lista
import { ReportDetailsViewDto } from './dto/report-details-view.dto';
import { ReportEmbedViewDto } from './dto/report-embed-view.dto';
import { CreateUserReportUseCase } from './use-case/create-user-report.usecase';
import { DeleteUserReportUseCase } from './use-case/delete-user-report.usecase';
import { FindAllReportsUseCase } from './use-case/find-all-reports.usecase';
import { FindOneUserReportUseCase } from './use-case/find-one-user-report.usecase';
import { GenerateTokenEmbedUseCase } from './use-case/generate-token-embed.usecase';

@ApiTags('Permissões e Visualização')
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
@Controller('user-reports')
export class UserReportController {
  constructor(
    private readonly createUserReportUseCase: CreateUserReportUseCase,
    private readonly findAllReportsUseCase: FindAllReportsUseCase,
    private readonly findOneReportsUseCase: FindOneUserReportUseCase,
    private readonly generateTokenEmbedUseCase: GenerateTokenEmbedUseCase,
    private readonly deleteUserReportUseCase: DeleteUserReportUseCase,
  ) {}

  @Post('share')
  @ApiOperation({ summary: 'Relatório compartilhado com sucesso (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Vínculo criado com sucesso.' })
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
  @ApiResponse({
    status: 404,
    description: 'Usuário ou Relatório não encontrado.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Relatório não encontrado',
          error: 'Not Found',
        },
      },
    },
  })
  async share(
    @Body() dto: CreateUserReportDto,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.createUserReportUseCase.execute(dto, loggedUser);
  }

  @Delete('revoke')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Revogar acesso de um usuário a um relatório (ADMIN)',
  })
  @ApiResponse({ status: 204, description: 'Acesso revogado.' })
  @ApiResponse({
    status: 400,
    description: 'Erro ao processar revogação.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Erro ao revogar permissão',
          error: 'Bad Request',
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
  @ApiResponse({
    status: 404,
    description: 'Vínculo não encontrado.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Relatório não encontrado',
          error: 'Not Found',
        },
      },
    },
  })
  async revoke(
    @Body() dto: DeleteUserReportDto,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deleteUserReportUseCase.execute(dto, loggedUser);
  }

  @Get('user/:userId/reports')
  @ApiOperation({ summary: 'Listar relatórios disponíveis para o usuário' })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário',
    example: 'uuid-v4',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna relatórios ativos e vinculados.',
    type: FindAllReportsViewDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Usuário não encontrado',
          error: 'NotFound',
        },
      },
    },
  })
  async findAll(@Param('userId') userId: string) {
    return this.findAllReportsUseCase.execute(userId);
  }

  @Get('report/:reportId/token')
  @ApiOperation({
    summary: 'Gerar token de visualização (Embed) para um relatório',
  })
  @ApiParam({
    name: 'reportId',
    description: 'ID interno do relatório',
    example: 'uuid-v4',
  })
  @ApiResponse({ status: 200, type: ReportEmbedViewDto })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para este relatório.',
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
  async getToken(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.generateTokenEmbedUseCase.execute(reportId, loggedUser);
  }

  @Get('report/:reportId')
  @ApiOperation({
    summary: 'Obter detalhes do relatório + Configuração de Embed',
  })
  @ApiParam({
    name: 'reportId',
    description: 'ID interno do relatório',
    example: 'uuid-v4',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna detalhes e token de uma vez.',
    type: ReportDetailsViewDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para este relatório.',
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
  async findOne(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.findOneReportsUseCase.execute(reportId, loggedUser);
  }
}
