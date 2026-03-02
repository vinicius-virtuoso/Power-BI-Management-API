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
import { ReportEmbedViewDto } from './dto/report-embed-view.dto';
import { CreateUserReportUseCase } from './use-case/create-user-report.usecase';
import { DeleteUserReportUseCase } from './use-case/delete-user-report.usecase';
import { FindAllReportsUseCase } from './use-case/find-all-reports.usecase';
import { FindOneUserReportUseCase } from './use-case/find-one-user-report.usecase';
import { GenerateTokenEmbedUseCase } from './use-case/generate-token-embed.usecase';

@ApiTags('Permissões e Visualização')
@ApiBearerAuth()
@Controller('reports')
export class UserReportController {
  constructor(
    private readonly createUserReportUseCase: CreateUserReportUseCase,
    private readonly findAllReportsUseCase: FindAllReportsUseCase,
    private readonly findOneReportsUseCase: FindOneUserReportUseCase,
    private readonly generateTokenEmbedUseCase: GenerateTokenEmbedUseCase,
    private readonly deleteUserReportUseCase: DeleteUserReportUseCase,
  ) {}

  @Post('share')
  @ApiOperation({ summary: 'Vincular um relatório a um usuário (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Vínculo criado com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Usuário ou Relatório não encontrado.',
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
  async revoke(
    @Body() dto: DeleteUserReportDto,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deleteUserReportUseCase.execute(dto, loggedUser);
  }

  @Get()
  @ApiOperation({ summary: 'Listar relatórios disponíveis para o meu usuário' })
  @ApiResponse({
    status: 200,
    description: 'Retorna relatórios ativos e vinculados.',
  })
  async findAll(@UserRequest() loggedUser: LoggedUserProps) {
    return this.findAllReportsUseCase.execute(loggedUser);
  }

  @Get(':reportId/token')
  @ApiOperation({
    summary: 'Gerar token de visualização (Embed) para um relatório',
  })
  @ApiParam({ name: 'reportId', description: 'ID interno do relatório' })
  @ApiResponse({ status: 200, type: ReportEmbedViewDto })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para este relatório.',
  })
  async getToken(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.generateTokenEmbedUseCase.execute(reportId, loggedUser);
  }

  @Get(':reportId')
  @ApiOperation({
    summary: 'Obter detalhes do relatório + Configuração de Embed',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna detalhes e token de uma vez.',
  })
  async findOne(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.findOneReportsUseCase.execute(reportId, loggedUser);
  }
}
