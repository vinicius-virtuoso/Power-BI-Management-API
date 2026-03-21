import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class DeleteUserReportDto {
  @ApiProperty({
    example: 'c6b84000-e29b-41d4-a716-446655440000',
    description: 'O ID do usuário (vínculo)',
    format: 'uuid',
  })
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'c6b84000-e29b-41d4-a716-446655440001',
    description: 'O ID relatório (vínculo)',
    format: 'uuid',
  })
  @IsString()
  @IsUUID()
  reportId: string;
}
