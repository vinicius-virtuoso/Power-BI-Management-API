import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { CreateUserDto } from '../dto/create-user.dto';
import { User, type UserView } from '../entities/user.entity';
import { USERS_REPOSITORY } from '../users.providers';
import type { UsersRepository } from './../repositories/users.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: UsersRepository,
  ) {}

  async execute(
    data: CreateUserDto,
    loggedUser: LoggedUserProps,
  ): Promise<UserView> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Você não tem permissão para acessa este recurso',
      );
    }

    const userExisting = await this.usersRepository.findByEmail(data.email);

    if (userExisting) throw new ConflictException('E-mail já cadastrado');

    const passwordHashed = await hash(data.password, 11);

    const userCreated = User.create({
      name: data.name,
      email: data.email,
      password: passwordHashed,
      role: data.role,
    });

    const user = await this.usersRepository.save(userCreated);

    return user.toView();
  }
}
