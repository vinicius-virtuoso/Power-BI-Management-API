import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsString } from 'class-validator';

export enum RefreshHour {
  H00 = '00',
  H01 = '01',
  H02 = '02',
  H03 = '03',
  H04 = '04',
  H05 = '05',
  H06 = '06',
  H07 = '07',
  H08 = '08',
  H09 = '09',
  H10 = '10',
  H11 = '11',
  H12 = '12',
  H13 = '13',
  H14 = '14',
  H15 = '15',
  H16 = '16',
  H17 = '17',
  H18 = '18',
  H19 = '19',
  H20 = '20',
  H21 = '21',
  H22 = '22',
  H23 = '23',
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

export class CreateScheduleReportDto {
  @ApiProperty({ example: 'uuid-do-relatorio' })
  @IsString()
  reportId: string;

  @ApiProperty({
    enum: RefreshHour,
    isArray: true,
    example: ['08', '12', '18'],
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
    enum: RefreshHour,
    isArray: true,
    example: ['10', '12', '18'],
    description:
      'Lista de horas para atualização em dias selecionados no closingDays',
  })
  @IsArray()
  @IsEnum(RefreshHour, { each: true })
  hoursClosingDays: RefreshHour[];
}
