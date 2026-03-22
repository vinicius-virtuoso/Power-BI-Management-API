import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { LoggedUserProps } from '../../../shared/types/logged-user.types';
import type { UserView } from '../entities/user.entity';
import { USERS_REPOSITORY } from '../users.providers';
import type { UsersRepository } from './../repositories/users.repository';

export type PaginatedResult = {
  total: number;
  users: UserView[];
};

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: UsersRepository,
  ) {}

  async execute(loggedUser: LoggedUserProps): Promise<PaginatedResult> {
    if (loggedUser.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Você não tem permissão para acessa este recurso',
      );
    }

    const users = await this.usersRepository.findAll();

    const userMapped = users.map((user) => user.toView());

    return {
      total: userMapped.length,
      users: userMapped,
    };
  }
}
