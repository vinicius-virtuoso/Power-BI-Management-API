import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateScheduleReportDto } from './create-schedule-report.dto';

export class UpdateScheduleReportDto extends PartialType(
  OmitType(CreateScheduleReportDto, ['reportId'] as const),
) {
  @ApiProperty({
    description: 'Status de ativação do agendamento',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
