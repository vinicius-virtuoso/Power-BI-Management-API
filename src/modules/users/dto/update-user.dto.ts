import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

type UserRole = 'ADMIN' | 'USER';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'João Silva Atualizado',
    description: 'Nome completo do usuário',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'novaSenha123',
    description: 'Nova senha (mínimo 6 caracteres)',
    minLength: 6,
    writeOnly: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: 'novo.email@empresa.com',
    description: 'E-mail para atualização',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    enum: ['ADMIN', 'USER'],
    example: 'USER',
    description: 'Nível de permissão',
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'USER'], {
    message: 'role must be one of the following values: USER, ADMIN',
  })
  role?: UserRole;

  @ApiPropertyOptional({
    example: true,
    description: 'Status de ativação do usuário no sistema',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
