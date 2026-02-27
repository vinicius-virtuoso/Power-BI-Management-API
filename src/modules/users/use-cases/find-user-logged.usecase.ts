import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserView } from '../entities/user.entity';
import { USERS_REPOSITORY } from '../users.providers';
import type { UsersRepository } from './../repositories/users.repository';

export type LoggedUserProps = {
  id: string;
  role: 'USER' | 'ADMIN';
};

@Injectable()
export class FindUserLoggedUseCase {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(loggedUserProps: LoggedUserProps): Promise<UserView> {
    const userFound = await this.usersRepository.findById(loggedUserProps.id);

    if (!userFound) {
      throw new NotFoundException('User not found');
    }

    return userFound.toView();
  }
}
