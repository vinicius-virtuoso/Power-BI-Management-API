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
import { UserRequest } from '../../decorators/user-request.decorator';
import type { LoggedUserProps } from '../../shared/types/logged-user.types';
import { CreateScheduleReportDto } from './dto/create-schedule-report.dto';
import { UpdateScheduleReportDto } from './dto/update-schedule-report.dto';
import { CreateScheduleUseCase } from './use-cases/create-schedule.usecase';
import { DeleteScheduleUseCase } from './use-cases/delete-schedule.usecase';
import { FindAllScheduleUseCase } from './use-cases/find-all-schedule.usecase';
import { FindByIdScheduleUseCase } from './use-cases/find-by-id-schedule.usecase';
import { FindByReportIdUseCase } from './use-cases/find-by-report-id.usecase';
import { UpdateScheduleUseCase } from './use-cases/update-schedule.usecase';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Agendamento de relatórios')
@ApiBearerAuth()
@Controller('schedule-reports')
export class ScheduleReportsController {
  constructor(
    private readonly createScheduleUseCase: CreateScheduleUseCase,
    private readonly findAllScheduleUseCase: FindAllScheduleUseCase,
    private readonly updateScheduleUseCase: UpdateScheduleUseCase,
    private readonly findByIdScheduleUseCase: FindByIdScheduleUseCase,
    private readonly findByReportIdUseCase: FindByReportIdUseCase,
    private readonly deleteScheduleUseCase: DeleteScheduleUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo agendamento de atualização (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso.' })
  async create(
    @Body() dto: CreateScheduleReportDto,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.createScheduleUseCase.execute(dto, loggedUser);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os agendamentos cadastrados (ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de agendamentos retornada com sucesso.',
  })
  async findAll(@UserRequest() loggedUser: LoggedUserProps) {
    return this.findAllScheduleUseCase.execute(loggedUser);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um agendamento pelo ID (ADMIN)' })
  async findById(
    @Param('id') id: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.findByIdScheduleUseCase.execute(id, loggedUser);
  }

  @Get('report/:reportId')
  @ApiOperation({
    summary: 'Busca agendamento vinculado a um relatório específico (ADMIN)',
  })
  async findByReportId(
    @Param('reportId') reportId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.findByReportIdUseCase.execute(reportId, loggedUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza configurações de um agendamento (ADMIN)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleReportDto,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.updateScheduleUseCase.execute(id, dto, loggedUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um agendamento de atualização (ADMIN)' })
  @ApiResponse({ status: 204, description: 'Agendamento removido.' })
  async delete(
    @Param('id') id: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deleteScheduleUseCase.execute(id, loggedUser);
  }
}
