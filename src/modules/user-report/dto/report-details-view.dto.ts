import { ApiProperty } from '@nestjs/swagger';
import { ReportViewDto } from '../../reports/dto/report-response.dto';

export class ReportDetailsViewDto extends ReportViewDto {
  @ApiProperty({
    example: 'eyJ0eXAiOiJKV1Qi...',
    description: 'Token de acesso gerado pelo Power BI',
  })
  accessToken: string;

  @ApiProperty({
    example: '2026-03-22T16:30:00Z',
    description: 'Data de expiração do token',
  })
  expiration: string;

  @ApiProperty({
    example: '7f2a1b3c-4d5e...',
    description: 'ID do relatório no Power BI',
  })
  reportId: string;
}
