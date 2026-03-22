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
    status: 400,
    description: 'Dados de entrada mal formatados.',
    content: {
      'application/json': {
        examples: {
          syntaxError: {
            value: {
              statusCode: 400,
              message: 'JSON inválido',
              error: 'Bad Request',
            },
            summary: 'JSON inválido enviado na requisição',
          },
        },
      },
    },
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
              message: 'E-mail ou senha incorreto',
              error: 'Unauthorized',
            },
            summary: 'E-mail ou senha incorreto',
          },
          inactiveUser: {
            value: {
              statusCode: 401,
              message: 'Ops, algo estranho nessa conta, chame o suporte',
              error: 'Unauthorized',
            },
            summary: 'Usuário desativado',
          },
        },
      },
    },
  })
  signIn(@Body() loginDto: AuthLoginDto) {
    return this.authService.login(loginDto);
  }
}
