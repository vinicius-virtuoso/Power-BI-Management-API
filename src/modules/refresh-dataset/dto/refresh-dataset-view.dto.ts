import { ApiProperty } from '@nestjs/swagger';

export class RefreshDatasetViewDto {
  @ApiProperty({
    example: '7f99965d-6721-4f10-9190-363189569b9f',
    nullable: true,
  })
  id: string | null;

  @ApiProperty({
    example: 'report-external-123',
    description: 'ID do relatório no Power BI',
  })
  externalId: string;

  @ApiProperty({ example: 'Relatório de Vendas Mensais' })
  name: string;

  @ApiProperty({ example: 'https://app.powerbi.com/...' })
  webUrl: string;

  @ApiProperty({ example: 'https://embedded.powerbi.com/...' })
  embedUrl: string;

  @ApiProperty({ example: 'dataset-uuid-001' })
  datasetId: string;

  @ApiProperty({ example: 'workspace-uuid-002' })
  workspaceId: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({
    example: '2024-03-01T18:00:00.000Z',
    description: 'Data da última atualização de dados',
    nullable: true,
  })
  lastUpdate: Date | null;

  @ApiProperty({
    example: { message: 'Power BI Service Unavailable' },
    description: 'Erros de atualização (objeto JSON ou string)',
    nullable: true,
    required: false,
  })
  errors: any;
}
