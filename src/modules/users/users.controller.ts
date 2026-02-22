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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActivateUserUseCase } from './use-cases/activate-user.usecase';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { DeactivateUserUseCase } from './use-cases/deactivate-user.usecase';
import { DeleteUserUseCase } from './use-cases/delete-user.usecase';
import { FindAllUsersUseCase } from './use-cases/find-all-users.usecase';
import { FindOneUserUseCase } from './use-cases/find-one-user.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';

export type LoggedUserProps = {
  id: string;
  role: 'USER' | 'ADMIN';
};

@ApiTags('Usuários')
@ApiBearerAuth() // Exige o token para TODOS os métodos desta classe
@ApiResponse({
  status: 401,
  description: 'Não autorizado: Token ausente ou inválido.',
})
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findOneUserUseCase: FindOneUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post('add')
  @ApiOperation({ summary: 'Cadastra um novo usuário (Apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({
    status: 403,
    description: 'Proibido: Apenas administradores podem cadastrar usuários.',
  })
  create(
    @Body() createUserDto: CreateUserDto,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.createUserUseCase.execute(createUserDto, loggedUser);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  @ApiResponse({
    status: 403,
    description: 'Proibido: Acesso restrito a administradores.',
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
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(
    @Param('userId') userId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.findOneUserUseCase.execute(userId, loggedUser);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Atualiza dados de um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({
    status: 403,
    description:
      'Proibido: Você não tem permissão para atualizar este usuário.',
  })
  update(
    @Body() updateUserDto: UpdateUserDto,
    @Param('userId') userId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.updateUserUseCase.execute(updateUserDto, userId, loggedUser);
  }

  @Patch('activate/:userId')
  @ApiOperation({ summary: 'Ativa um usuário (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Usuário ativado com sucesso.' })
  @ApiResponse({
    status: 403,
    description: 'Proibido: Apenas administradores podem ativar contas.',
  })
  activate(
    @Param('userId') userId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.activateUserUseCase.execute(userId, loggedUser);
  }

  @Patch('deactivate/:userId')
  @ApiOperation({ summary: 'Desativa um usuário (Soft Delete) (Apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Usuário desativado com sucesso.' })
  @ApiResponse({
    status: 403,
    description: 'Proibido: Apenas administradores podem desativar contas.',
  })
  deactivate(
    @Param('userId') userId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    return this.deactivateUserUseCase.execute(userId, loggedUser);
  }

  @Delete(':userId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove permanentemente um usuário (Apenas ADMIN)' })
  @ApiResponse({ status: 204, description: 'Usuário removido com sucesso.' })
  @ApiResponse({
    status: 403,
    description: 'Proibido: Apenas administradores podem deletar registros.',
  })
  async delete(
    @Param('userId') userId: string,
    @UserRequest() loggedUser: LoggedUserProps,
  ) {
    await this.deleteUserUseCase.execute(userId, loggedUser);
  }
}
