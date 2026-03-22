import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { UpdateUserDto } from '../dto/update-user.dto';
import type { User, UserView } from '../entities/user.entity';
import type { UsersRepository } from '../repositories/users.repository';
import { USERS_REPOSITORY } from '../users.providers';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    data: UpdateUserDto,
    userId: string,
    loggedUser: LoggedUserProps,
  ): Promise<UserView> {
    const actor = await this.usersRepository.findById(loggedUser.id);
    if (!actor) throw new NotFoundException('Ator não encontrado');

    const target = await this.usersRepository.findById(userId);
    if (!target) throw new NotFoundException('Usuário não encontrado');

    if (data.email && data.email !== target.email) {
      const emailOwner = await this.usersRepository.findByEmail(data.email);

      if (emailOwner && emailOwner.id !== target.id) {
        throw new ConflictException('E-mail já cadastrado');
      }
    }

    let updatedUser: User;

    const passwordHashed = data.password
      ? await hash(data.password, 11)
      : undefined;

    if (actor.role === 'ADMIN') {
      updatedUser = target.updateByAdmin({ ...data, password: passwordHashed });
    } else {
      if (actor.id !== target.id) {
        throw new ForbiddenException(
          'Você não tem permissão para acessa este recurso',
        );
      }

      updatedUser = target.updateProfile({
        name: data.name,
        password: passwordHashed,
      });
    }

    const persisted = await this.usersRepository.update(updatedUser);
    if (!persisted) {
      throw new BadRequestException('Erro ao atualizar o usuário');
    }

    return persisted.toView();
  }
}
