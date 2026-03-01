import { ApiProperty } from '@nestjs/swagger';

export class ReportViewDto {
  @ApiProperty({ example: 'uuid-v4-local' })
  id: string;

  @ApiProperty({ example: 'uuid-pbi-external' })
  externalId: string;

  @ApiProperty({ example: 'Dashboard de Vendas' })
  name: string;

  @ApiProperty({ example: 'https://app.powerbi.com/...' })
  webUrl: string;

  @ApiProperty({ example: 'https://embedded.powerbi.com/...' })
  embedUrl: string;

  @ApiProperty({ example: 'dataset-uuid' })
  datasetId: string;

  @ApiProperty({ example: 'workspace-uuid' })
  workspaceId: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-03-01T10:00:00Z', nullable: true })
  lastUpdate: Date;

  @ApiProperty({ example: null, nullable: true })
  errors: any;
}

export class PaginatedReportsDto {
  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ type: [ReportViewDto] })
  reports: ReportViewDto[];
}
