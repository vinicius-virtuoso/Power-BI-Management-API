import { ApiProperty } from '@nestjs/swagger';

export class ScheduleReportViewDto {
  @ApiProperty({ example: 'uuid-do-agendamento' })
  id: string;

  @ApiProperty({ example: 'uuid-do-relatorio' })
  reportId: string;

  @ApiProperty({
    example: ['08', '12', '18'],
    description: 'Horas configuradas para dias comuns',
    isArray: true,
  })
  hoursCommon: string[];

  @ApiProperty({
    example: true,
    description: 'Se o agendamento considera dias de fechamento',
  })
  isClosingDays: boolean;

  @ApiProperty({
    example: ['01', '02'],
    description: 'Dias do mês considerados como fechamento',
    isArray: true,
  })
  closingDays: string[];

  @ApiProperty({
    example: ['07', '19'],
    description: 'Horas configuradas especificamente para dias de fechamento',
    isArray: true,
  })
  hoursClosingDays: string[];

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class PaginatedSchedulesDto {
  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ type: [ScheduleReportViewDto] })
  schedules: ScheduleReportViewDto[];
}
