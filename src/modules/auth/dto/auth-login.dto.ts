import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({
    example: 'email@email.com',
    description: 'Email valido de usuario',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'teste1234',
    description: 'Senha de no minimo 6 caracteres',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
