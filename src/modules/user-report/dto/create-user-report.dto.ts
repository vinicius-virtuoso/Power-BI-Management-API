import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateUserReportDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'O ID único do relatório (UUID)',
    format: 'uuid',
  })
  @IsString()
  reportId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5',
    description: 'O ID único do usuário (UUID)',
    format: 'uuid',
  })
  @IsString()
  @IsUUID()
  userId: string;
}
