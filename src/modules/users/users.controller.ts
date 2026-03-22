import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRequest } from '../../decorators/user-request.decorator';
import type { LoggedUserProps } from '../../shared/types/logged-user.types';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersViewDto } from './dto/find-all-user-view.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserViewDto } from './dto/user-view.dto';
import { ActivateUserUseCase } from './use-cases/activate-user.usecase';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { DeactivateUserUseCase } from './use-cases/deactivate-user.usecase';
import { DeleteUserUseCase } from './use-cases/delete-user.usecase';
import { FindAllUsersUseCase } from './use-cases/find-all-users.usecase';
import { FindOneUserUseCase } from './use-cases/find-one-user.usecase';
import { FindUserLoggedUseCase } from './use-cases/find-user-logged.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';

@ApiTags('Usuários')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Não autorizado: Token ausente ou inválido.',
})
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUserLoggedUseCase: FindUserLoggedUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findOneUserUseCase: FindOneUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post('add')
  @ApiOperation({
    summary: 'Cadastra um novo usuário',
    description:
      'Permite a criação de novos usuários no sistema. Operação restrita a administradores.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso.',
    type: UserViewDto, // Ajuste para o DTO que representa a View do usuário
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
          unauthorized: {
            value: {
              statusCode: 401,
              message: 'Token é invalido ou está ausente',
              error: 'Unauthorized',
            },
            summary: 'Token é invalido ou está ausente',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Permissão insuficiente.',
    content: {
      'application/json': {
        example: {
          statusCode: 403,
          message: 'Você não tem permissão para acessa este recurso',
          error: 'Forbidden',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito de dados.',
    content: {
      'application/json': {
        example: {
          statusCode: 409,
          message: 'O e-mail já cadastrado',
          error: 'Conflict',
        },
      },
    },
  })
  create(
    @Body() createUserDto: CreateUserDto,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.createUserUseCase.execute(createUserDto, loggedUser);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Obter dados do usuário logado',
    description:
      'Retorna as informações do perfil do usuário autenticado através do token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso.',
    type: UserViewDto, // Certifique-se de que este DTO reflete o retorno do seu toView()
  })
  @ApiResponse({
    status: 401,
    description: 'Falha na autenticação.',
    content: {
      'application/json': {
        examples: {
          unauthorized: {
            value: {
              statusCode: 401,
              message: 'Token é invalido ou está ausente',
              error: 'Unauthorized',
            },
            summary: 'Token é invalido ou está ausente',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Usuário não encontrado',
          error: 'Not Found',
        },
      },
    },
  })
  findUserLogged(@UserRequest() loggedUser: LoggedUserProps) {
    return this.findUserLoggedUseCase.execute(loggedUser);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários (Apenas ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Lista retornada com sucesso.',
    type: FindAllUsersViewDto, // Aqui usamos o DTO de lista
  })
  @ApiResponse({
    status: 401,
    description: 'Falha na autenticação.',
    content: {
      'application/json': {
        examples: {
          unauthorized: {
            value: {
              statusCode: 401,
              message: 'Token é invalido ou está ausente',
              error: 'Unauthorized',
            },
            summary: 'Token é invalido ou está ausente',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Permissão insuficiente.',
    content: {
      'application/json': {
        example: {
          statusCode: 403,
          message: 'Você não tem permissão para acessa este recurso',
          error: 'Forbidden',
        },
      },
    },
  })
  findAll(@UserRequest() loggedUser: LoggedUserProps) {
    return this.findAllUsersUseCase.execute(loggedUser);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário',
    example: 'uuid-v4',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado.',
    type: UserViewDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Falha na autenticação.',
    content: {
      'application/json': {
        examples: {
          unauthorized: {
            value: {
              statusCode: 401,
              message: 'Token é invalido ou está ausente',
              error: 'Unauthorized',
            },
            summary: 'Token é invalido ou está ausente',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Permissão insuficiente.',
    content: {
      'application/json': {
        example: {
          statusCode: 403,
          message: 'Você não tem permissão para acessa este recurso',
          error: 'Forbidden',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Usuário não encontrado',
          error: 'NotFound',
        },
      },
    },
  })
  findOne(
    @Param('userId') userId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.findOneUserUseCase.execute(userId, loggedUser);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Atualiza dados de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso.',
    type: UserViewDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar o usuário',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Erro ao atualizar o usuário',
          error: 'BadRequest',
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
          unauthorized: {
            value: {
              statusCode: 401,
              message: 'Token é invalido ou está ausente',
              error: 'Unauthorized',
            },
            summary: 'Token é invalido ou está ausente',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Permissão insuficiente.',
    content: {
      'application/json': {
        example: {
          statusCode: 403,
          message: 'Você não tem permissão para acessa este recurso',
          error: 'Forbidden',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    content: {
      'application/json': {
        examples: {
          actorNotFound: {
            value: {
              statusCode: 404,
              message: 'Usuário não encontrado',
              error: 'NotFound',
            },
            summary: 'Usuário ator/logado não encontrado',
          },
          userNotFound: {
            value: {
              statusCode: 404,
              message: 'Usuário não encontrado',
              error: 'NotFound',
            },
            summary: 'Usuário alvo não encontrado',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'E-mail já cadastrado',
    content: {
      'application/json': {
        example: {
          statusCode: 409,
          message: 'E-mail já cadastrado',
          error: 'NotFound',
        },
      },
    },
  })
  update(
    @Body() updateUserDto: UpdateUserDto,
    @Param('userId') userId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.updateUserUseCase.execute(updateUserDto, userId, loggedUser);
  }

  @Patch('activate/:userId')
  @ApiOperation({
    summary: 'Ativa um usuário',
    description:
      'Restaura o acesso de um usuário ao sistema. Operação restrita a administradores.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário a ser ativado',
    example: 'uuid-v4',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário ativado com sucesso.',
    type: UserViewDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Falha na autenticação.',
    content: {
      'application/json': {
        examples: {
          unauthorized: {
            value: {
              statusCode: 401,
              message: 'Token é invalido ou está ausente',
              error: 'Unauthorized',
            },
            summary: 'Token é invalido ou está ausente',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na operação.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Erro ao ativar o usuário',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Permissão insuficiente.',
    content: {
      'application/json': {
        example: {
          statusCode: 403,
          message: 'Você não tem permissão para acessa este recurso',
          error: 'Forbidden',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Usuário não encontrado',
          error: 'Not Found',
        },
      },
    },
  })
  activate(
    @Param('userId') userId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.activateUserUseCase.execute(userId, loggedUser);
  }

  @Patch('deactivate/:userId')
  @ApiOperation({
    summary: 'Desativa um usuário (Soft Delete)',
    description:
      'Remove o acesso do usuário sem deletar os dados do banco. Operação restrita a administradores.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário a ser desativado',
    example: 'uuid-v4',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário desativado com sucesso.',
    type: UserViewDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Falha na autenticação.',
    content: {
      'application/json': {
        examples: {
          unauthorized: {
            value: {
              statusCode: 401,
              message: 'Token é invalido ou está ausente',
              error: 'Unauthorized',
            },
            summary: 'Token é invalido ou está ausente',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na operação.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Erro ao desativar o usuário',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Permissão insuficiente.',
    content: {
      'application/json': {
        example: {
          statusCode: 403,
          message: 'Você não tem permissão para acessa este recurso',
          error: 'Forbidden',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Usuário não encontrado',
          error: 'Not Found',
        },
      },
    },
  })
  deactivate(
    @Param('userId') userId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deactivateUserUseCase.execute(userId, loggedUser);
  }

  @Delete(':userId')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Remove permanentemente um usuário',
    description:
      'Exclui definitivamente o registro do usuário do banco de dados. Operação restrita a administradores.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário a ser removido',
    example: 'uuid-v4',
  })
  @ApiResponse({ status: 204, description: 'Usuário removido com sucesso.' })
  @ApiResponse({
    status: 401,
    description: 'Falha na autenticação.',
    content: {
      'application/json': {
        examples: {
          unauthorized: {
            value: {
              statusCode: 401,
              message: 'Token é invalido ou está ausente',
              error: 'Unauthorized',
            },
            summary: 'Token é invalido ou está ausente',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na exclusão.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Erro ao excluir usuário',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Permissão insuficiente.',
    content: {
      'application/json': {
        example: {
          statusCode: 403,
          message: 'Você não tem permissão para acessa este recurso',
          error: 'Forbidden',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Usuário não encontrado',
          error: 'Not Found',
        },
      },
    },
  })
  async delete(
    @Param('userId') userId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    await this.deleteUserUseCase.execute(userId, loggedUser);
  }
}
