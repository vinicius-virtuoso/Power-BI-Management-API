import { ApiProperty } from '@nestjs/swagger';

export class ReportEmbedViewDto {
  @ApiProperty({ example: 'eyJ0eXAiO...' })
  accessToken: string;

  @ApiProperty({ example: 'https://app.powerbi.com/reportEmbed...' })
  embedUrl: string;

  @ApiProperty({ example: 'uuid-do-relatório' })
  reportId: string;

  @ApiProperty({ example: 3600, description: 'Tempo de expiração em segundos' })
  expiration: number;
}
