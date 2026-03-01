import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsPublic } from '../../decorators/is-public.decorator';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'Realiza o login e atualiza o último acesso',
    description:
      'Valida as credenciais, verifica se o usuário está ativo e retorna o token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Falha na autenticação.',
    content: {
      'application/json': {
        examples: {
          invalidsCredentials: {
            value: {
              statusCode: 401,
              message: 'Invalids credentials',
              error: 'Unauthorized',
            },
            summary: 'E-mail ou senha incorretos',
          },
          inactiveUser: {
            value: {
              statusCode: 401,
              message: 'Access denied',
              error: 'Unauthorized',
            },
            summary: 'Usuário desativado pelo administrador',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada mal formatados.' })
  signIn(@Body() loginDto: AuthLoginDto) {
    return this.authService.login(loginDto);
  }
}
