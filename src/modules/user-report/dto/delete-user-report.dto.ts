import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class DeleteUserReportDto {
  @ApiProperty({
    example: 'c6b84000-e29b-41d4-a716-446655440000',
    description:
      'O ID único da relação (vínculo) entre o usuário e o relatório',
    format: 'uuid',
  })
  @IsString()
  @IsUUID()
  userReportId: string;
}
