import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import { type UserView } from '../entities/user.entity';
import type { UsersRepository } from '../repositories/users.repository';
import { USERS_REPOSITORY } from '../users.providers';

@Injectable()
export class DeactivateUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: UsersRepository,
  ) {}

  async execute(
    userId: string,
    loggedUser: LoggedUserProps,
  ): Promise<UserView> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Você não tem permissão para acessa este recurso',
      );
    }

    const userFound = await this.usersRepository.findById(userId);

    if (!userFound) throw new NotFoundException('Usuário não encontrado');

    const userActivated = await this.usersRepository.deactivate(
      userFound.deactivate(),
    );

    if (!userActivated)
      throw new BadRequestException('Erro ao desativar o usuário');

    return userActivated.toView();
  }
}
