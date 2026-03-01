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

import { UpdateScheduleReportDto } from './dto/update-schedule-report.dto';

import {
  PaginatedSchedulesDto,
  ScheduleReportViewDto,
} from './dto/schedule-report-view.dto';
import { CreateScheduleUseCase } from './use-cases/create-schedule.usecase';
import { DeleteScheduleUseCase } from './use-cases/delete-schedule.usecase';
import { FindAllScheduleUseCase } from './use-cases/find-all-schedule.usecase';
import { FindByIdScheduleUseCase } from './use-cases/find-by-id-schedule.usecase';
import { FindByReportIdUseCase } from './use-cases/find-by-report-id.usecase';
import { UpdateScheduleUseCase } from './use-cases/update-schedule.usecase';

@ApiTags('Agendamento de Atualizações (Admin)')
@ApiBearerAuth()
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
    status: 409,
    description: 'Relatório já possui um agendamento.',
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
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiResponse({ status: 200, type: ScheduleReportViewDto })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado.' })
  async findById(
    @Param('id') id: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.findByIdScheduleUseCase.execute(id, loggedUser);
  }

  @Get('report/:reportId')
  @ApiOperation({ summary: 'Buscar agendamento pelo ID do Relatório' })
  @ApiParam({ name: 'reportId', description: 'ID do relatório vinculado' })
  @ApiResponse({ status: 200, type: ScheduleReportViewDto })
  @ApiResponse({
    status: 404,
    description: 'Nenhum agendamento para este relatório.',
  })
  async findByReportId(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.findByReportIdUseCase.execute(reportId, loggedUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar agendamento' })
  @ApiResponse({ status: 200, type: ScheduleReportViewDto })
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
  @ApiResponse({ status: 204, description: 'Removido com sucesso.' })
  async delete(
    @Param('id') id: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deleteScheduleUseCase.execute(id, loggedUser);
  }
}
