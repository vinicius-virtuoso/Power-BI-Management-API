import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsString } from 'class-validator';

export enum RefreshHour {
  H00 = '00:00',
  H01 = '01:00',
  H02 = '02:00',
  H03 = '03:00',
  H04 = '04:00',
  H05 = '05:00',
  H06 = '06:00',
  H07 = '07:00',
  H08 = '08:00',
  H09 = '09:00',
  H10 = '10:00',
  H11 = '11:00',
  H12 = '12:00',
  H13 = '13:00',
  H14 = '14:00',
  H15 = '15:00',
  H16 = '16:00',
  H17 = '17:00',
  H18 = '18:00',
  H19 = '19:00',
  H20 = '20:00',
  H21 = '21:00',
  H22 = '22:00',
  H23 = '23:00',
}

export enum ClosingDay {
  D01 = '01',
  D02 = '02',
  D03 = '03',
  D04 = '04',
  D05 = '05',
  D06 = '06',
  D08 = '08',
  D09 = '09',
  D10 = '10',
  D11 = '11',
  D12 = '12',
  D13 = '13',
  D14 = '14',
  D15 = '15',
  D16 = '16',
  D17 = '17',
  D18 = '18',
  D19 = '19',
  D20 = '20',
  D21 = '21',
  D22 = '22',
  D23 = '23',
  D24 = '24',
  D25 = '25',
  D26 = '26',
  D27 = '27',
  D28 = '28',
  D29 = '29',
  D30 = '30',
  D31 = '31',
}

export enum ClosingRefreshHour {
  H00 = '00:00',
  H00M30 = '00:30',
  H01 = '01:00',
  H01M30 = '01:30',
  H02 = '02:00',
  H02M30 = '02:30',
  H03 = '03:00',
  H03M30 = '03:30',
  H04 = '04:00',
  H04M30 = '04:30',
  H05 = '05:00',
  H05M30 = '05:30',
  H06 = '06:00',
  H06M30 = '06:30',
  H07 = '07:00',
  H07M30 = '07:30',
  H08 = '08:00',
  H08M30 = '08:30',
  H09 = '09:00',
  H09M30 = '09:30',
  H10 = '10:00',
  H10M30 = '10:30',
  H11 = '11:00',
  H11M30 = '11:30',
  H12 = '12:00',
  H12M30 = '12:30',
  H13 = '13:00',
  H13M30 = '13:30',
  H14 = '14:00',
  H14M30 = '14:30',
  H15 = '15:00',
  H15M30 = '15:30',
  H16 = '16:00',
  H16M30 = '16:30',
  H17 = '17:00',
  H17M30 = '17:30',
  H18 = '18:00',
  H18M30 = '18:30',
  H19 = '19:00',
  H19M30 = '19:30',
  H20 = '20:00',
  H20M30 = '20:30',
  H21 = '21:00',
  H21M30 = '21:30',
  H22 = '22:00',
  H22M30 = '22:30',
  H23 = '23:00',
  H23M30 = '23:30',
}

export class CreateScheduleReportDto {
  @ApiProperty({ example: 'uuid-do-relatório' })
  @IsString()
  reportId: string;

  @ApiProperty({
    enum: RefreshHour,
    isArray: true,
    example: ['08:00', '12:00', '18:00'],
    description: 'Lista de horas para atualização',
  })
  @IsArray()
  @IsEnum(RefreshHour, { each: true })
  hoursCommon: RefreshHour[];

  @ApiProperty({
    description: 'Define se o agendamento considera dias de fechamento',
  })
  @IsBoolean()
  isClosingDays: boolean;

  @ApiProperty({
    enum: ClosingDay,
    isArray: true,
    example: ['01', '08', '20', '30', '31'],
    description:
      'Lista de dias de fechamento ou caso queira horário de agendamento para dias específicos do mÊs',
  })
  @IsArray()
  @IsEnum(ClosingDay, { each: true })
  closingDays: ClosingDay[];

  @ApiProperty({
    enum: ClosingRefreshHour,
    isArray: true,
    example: ['10:30', '12', '18:30'],
    description:
      'Lista de horas para atualização em dias selecionados no closingDays',
  })
  @IsArray()
  @IsEnum(ClosingRefreshHour, { each: true })
  hoursClosingDays: ClosingRefreshHour[];
}
