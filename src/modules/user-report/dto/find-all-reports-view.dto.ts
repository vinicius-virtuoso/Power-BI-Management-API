import { ApiProperty } from '@nestjs/swagger';
import { ReportViewDto } from '../../reports/dto/report-response.dto';

export class FindAllReportsViewDto {
  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ type: [ReportViewDto] })
  reports: ReportViewDto[];
}
