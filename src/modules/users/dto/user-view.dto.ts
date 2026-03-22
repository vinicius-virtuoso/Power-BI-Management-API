import { ApiProperty } from '@nestjs/swagger';

export class UserViewDto {
  @ApiProperty({ example: '7f2a1b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o' })
  id: string;

  @ApiProperty({ example: 'Usuário Exemplo' })
  name: string;

  @ApiProperty({ example: 'user@exemplo.com' })
  email: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'], example: 'USER' })
  role: string;

  @ApiProperty({ example: false })
  isActive: boolean;

  // Use 'Date' em vez de 'null'. O Swagger entende melhor.
  @ApiProperty({
    example: null,
    required: false,
    nullable: true,
    type: Date,
  })
  lastAccess?: Date | null;

  @ApiProperty({
    example: '2026-03-22T15:30:00.000Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    example: null,
    required: false,
    nullable: true,
    type: Date,
  })
  updatedAt?: Date | null;
}
