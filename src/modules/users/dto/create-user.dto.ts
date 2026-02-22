import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export enum CreateUserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'joao@empresa.com.br',
    description: 'E-mail corporativo (será usado para login)',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha de acesso (mínimo 6 caracteres)',
    minLength: 6,
    writeOnly: true,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: CreateUserRole,
    example: CreateUserRole.USER,
    description: 'Nível de permissão no sistema',
  })
  @IsEnum(CreateUserRole)
  role: CreateUserRole;
}
