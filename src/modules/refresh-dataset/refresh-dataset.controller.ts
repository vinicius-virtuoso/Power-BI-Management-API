import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRequest } from '../../decorators/user-request.decorator';
import type { LoggedUserProps } from '../../shared/types/logged-user.types';
import { ReportViewDto } from './dto/report-view.dto';
import { CheckReportRefreshStatusUseCase } from './use-cases/check-report-refresh-status.usecase';
import { RefreshDatasetReportUseCase } from './use-cases/refresh-dataset-report.usecase';

@ApiTags('Power BI - Refresh Dataset')
@ApiBearerAuth() // Exige token JWT para as rotas
@Controller('refresh-dataset')
export class RefreshDatasetController {
  constructor(
    private readonly refreshDatasetReportUseCase: RefreshDatasetReportUseCase,
    private readonly checkReportRefreshStatusUseCase: CheckReportRefreshStatusUseCase,
  ) {}

  @Post(':reportId/refreshes')
  @ApiOperation({
    summary: 'Dispara uma nova atualização de dataset no Power BI',
    description:
      'Apenas administradores podem solicitar. A rota não retorna dados, apenas confirma o recebimento da solicitação pelo Power BI.',
  })
  @ApiParam({ name: 'reportId', description: 'ID do relatório no sistema' })
  @ApiResponse({
    status: 201,
    description: 'Refresh solicitado com sucesso (No Content).',
  })
  @ApiResponse({
    status: 400,
    description:
      'Falha na solicitação: Outro refresh em execução ou serviço Power BI indisponível.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado: Perfil ADMIN necessário.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Relatório não encontrado ou Dataset inexistente no workspace.',
  })
  create(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.refreshDatasetReportUseCase.execute(reportId, loggedUser);
  }

  @Get(':reportId/check/refreshes')
  @ApiOperation({
    summary: 'Sincroniza e retorna o status do relatório',
    description:
      'Consulta o Power BI e atualiza os campos lastUpdate e errors caso o refresh tenha terminado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do relatório retornados com sucesso.',
    type: ReportViewDto,
  })
  check(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.checkReportRefreshStatusUseCase.execute(reportId, loggedUser);
  }
}
