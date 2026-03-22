import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { CreateScheduleReportDto } from './dto/create-schedule-report.dto';
import {
  PaginatedSchedulesDto,
  ScheduleReportViewDto,
} from './dto/schedule-report-view.dto';
import { UpdateScheduleReportDto } from './dto/update-schedule-report.dto';
import { CreateScheduleUseCase } from './use-cases/create-schedule.usecase';
import { DeleteScheduleUseCase } from './use-cases/delete-schedule.usecase';
import { FindAllScheduleUseCase } from './use-cases/find-all-schedule.usecase';
import { FindByIdScheduleUseCase } from './use-cases/find-by-id-schedule.usecase';
import { FindByReportIdUseCase } from './use-cases/find-by-report-id.usecase';
import { UpdateScheduleUseCase } from './use-cases/update-schedule.usecase';

@ApiTags('Agendamento de Atualizações (Admin)')
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
@Controller('schedule-reports')
export class ScheduleReportsController {
  constructor(
    private readonly createScheduleUseCase: CreateScheduleUseCase,
    private readonly findAllScheduleUseCase: FindAllScheduleUseCase,
    private readonly findByIdScheduleUseCase: FindByIdScheduleUseCase,
    private readonly findByReportIdUseCase: FindByReportIdUseCase,
    private readonly updateScheduleUseCase: UpdateScheduleUseCase,
    private readonly deleteScheduleUseCase: DeleteScheduleUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo agendamento' })
  @ApiResponse({ status: 201, type: ScheduleReportViewDto })
  @ApiResponse({
    status: 404,
    description: 'Relatório não encontrado.',
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
  @ApiResponse({
    status: 409,
    description: 'Conflito: Relatório já possui um agendamento.',
    content: {
      'application/json': {
        example: {
          statusCode: 409,
          message: 'Já existe um agendamento configurado para este relatório',
          error: 'Conflict',
        },
      },
    },
  })
  async create(
    @Body() dto: CreateScheduleReportDto,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.createScheduleUseCase.execute(dto, loggedUser);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os agendamentos' })
  @ApiResponse({ status: 200, type: PaginatedSchedulesDto })
  async findAll(@UserRequest() loggedUser: LoggedUserProps) {
    return this.findAllScheduleUseCase.execute(loggedUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do agendamento',
    example: 'uuid-v4',
  })
  @ApiResponse({ status: 200, type: ScheduleReportViewDto })
  @ApiResponse({
    status: 404,
    description: 'Agendamento não encontrado.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Agendamento não encontrado',
          error: 'Not Found',
        },
      },
    },
  })
  async findById(
    @Param('id') id: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.findByIdScheduleUseCase.execute(id, loggedUser);
  }

  @Get('report/:reportId')
  @ApiOperation({ summary: 'Buscar agendamento pelo ID do Relatório' })
  @ApiParam({
    name: 'reportId',
    description: 'ID do relatório vinculado',
    example: 'uuid-v4',
  })
  @ApiResponse({ status: 200, type: ScheduleReportViewDto })
  @ApiResponse({
    status: 404,
    description: 'Nenhum agendamento encontrado para o relatório.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Não foi encontrado nenhum agendamento para este relatório',
          error: 'Not Found',
        },
      },
    },
  })
  async findByReportId(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.findByReportIdUseCase.execute(reportId, loggedUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar agendamento' })
  @ApiParam({
    name: 'id',
    description: 'ID do agendamento',
    example: 'uuid-v4',
  })
  @ApiResponse({ status: 200, type: ScheduleReportViewDto })
  @ApiResponse({
    status: 404,
    description: 'Agendamento não encontrado.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Agendamento não encontrado',
          error: 'Not Found',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleReportDto,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.updateScheduleUseCase.execute(id, dto, loggedUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover agendamento' })
  @ApiParam({
    name: 'id',
    description: 'ID do agendamento',
    example: 'uuid-v4',
  })
  @ApiResponse({ status: 204, description: 'Removido com sucesso.' })
  @ApiResponse({
    status: 404,
    description: 'Agendamento não encontrado.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Agendamento não encontrado',
          error: 'Not Found',
        },
      },
    },
  })
  async delete(
    @Param('id') id: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deleteScheduleUseCase.execute(id, loggedUser);
  }
}
