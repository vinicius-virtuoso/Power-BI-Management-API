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
import { CreateUserReportUseCase } from './use-case/create-user-report.usecase';
import { DeleteUserReportUseCase } from './use-case/delete-user-report.usecase';
import { FindAllReportsUseCase } from './use-case/find-all-reports.usecase';
import { FindOneUserReportUseCase } from './use-case/find-one-user-report.usecase';
import { GenerateTokenEmbedUseCase } from './use-case/generate-token-embed.usecase';

@ApiTags('Permissões e Relatórios')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Não autorizado: Token ausente ou inválido.',
})
@Controller('reports')
export class UserReportController {
  constructor(
    private readonly createUserReportUseCase: CreateUserReportUseCase,
    private readonly findAllReportsUseCase: FindAllReportsUseCase,
    private readonly findOneReportsUseCase: FindOneUserReportUseCase,
    private readonly generateTokenEmbedUseCase: GenerateTokenEmbedUseCase,
    private readonly deleteUserReportUseCase: DeleteUserReportUseCase,
  ) {}

  @Post('grant')
  @ApiOperation({
    summary: 'Concede acesso de um relatório a um usuário (Apenas ADMIN)',
  })
  @ApiResponse({ status: 201, description: 'Acesso concedido com sucesso.' })
  @ApiResponse({
    status: 403,
    description: 'Proibido: Apenas administradores podem gerenciar acessos.',
  })
  create(
    @Body() createUserReportDto: CreateUserReportDto,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.createUserReportUseCase.execute(
      createUserReportDto,
      loggedUser,
    );
  }

  @Get('report-token/:reportId')
  @ApiOperation({
    summary: 'Gera o token de visualização (Embed Token) do Power BI',
  })
  @ApiParam({
    name: 'reportId',
    description: 'ID do relatório no banco de dados',
  })
  @ApiResponse({ status: 200, description: 'Token gerado com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Relatório não encontrado ou sem permissão.',
  })
  generateToken(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.generateTokenEmbedUseCase.execute(reportId, loggedUser);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista todos os relatórios disponíveis para o usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de relatórios retornada com sucesso.',
  })
  findAll(@UserRequest() loggedUser: LoggedUserProps) {
    return this.findAllReportsUseCase.execute(loggedUser);
  }

  @Get(':reportId')
  @ApiOperation({ summary: 'Obtém detalhes de um relatório e dados de Embed' })
  @ApiParam({
    name: 'reportId',
    description: 'ID do relatório no banco de dados',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do relatório retornados com sucesso.',
  })
  findOne(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.findOneReportsUseCase.execute(reportId, loggedUser);
  }

  @Delete('revoke')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Revoga o acesso de um usuário a um relatório (Apenas ADMIN)',
  })
  @ApiResponse({ status: 204, description: 'Acesso revogado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado.' })
  delete(
    @Body() deleteUserReportDto: DeleteUserReportDto,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deleteUserReportUseCase.execute(
      deleteUserReportDto,
      loggedUser,
    );
  }
}
