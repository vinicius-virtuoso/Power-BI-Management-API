import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { UsersRepository } from '../repositories/users.repository';
import { USERS_REPOSITORY } from '../users.providers';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(userId: string, loggedUser: LoggedUserProps): Promise<void> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Você não tem permissão para acessa este recurso',
      );
    }

    const targetUser = await this.usersRepository.findById(userId);

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isDeleted = await this.usersRepository.delete(userId);

    if (!isDeleted) {
      throw new BadRequestException('Erro ao excluir usuário');
    }
  }
}
