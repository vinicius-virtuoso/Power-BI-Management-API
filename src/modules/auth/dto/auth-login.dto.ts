import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({
    example: 'admin@empresa.com',
    description: 'Email valido de usuário',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'admin12345678',
    description: 'Senha de no mínimo 6 caracteres',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
