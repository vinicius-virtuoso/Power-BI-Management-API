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
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'USER'], {
    message: 'role must be one of the following values: USER, ADMIN',
  })
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
