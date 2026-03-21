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
    if (!actor) throw new NotFoundException('Actor not found');

    const target = await this.usersRepository.findById(userId);
    if (!target) throw new NotFoundException('User not found');

    if (data.email && data.email !== target.email) {
      const emailOwner = await this.usersRepository.findByEmail(data.email);

      if (emailOwner && emailOwner.id !== target.id) {
        throw new ConflictException('Email already exists');
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
        throw new ForbiddenException();
      }

      updatedUser = target.updateProfile({
        name: data.name,
        password: passwordHashed,
      });
    }

    const persisted = await this.usersRepository.update(updatedUser);
    if (!persisted) throw new BadRequestException('Error on update user');

    return persisted.toView();
  }
}
