import { Module } from '@nestjs/common';
import { UserLifecycleJob } from './jobs/user-lifecycle.job';
import { InMemoryUsersRepository } from './repositories/in-memory-users.repository';
import { PrismaUsersRepository } from './repositories/prisma-users.repository';
import { AdminSeed } from './seeds/admin.seed';
import { ActivateUserUseCase } from './use-cases/activate-user.usecase';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { DeactivateUserUseCase } from './use-cases/deactivate-user.usecase';
import { DeleteUserUseCase } from './use-cases/delete-user.usecase';
import { FindAllUsersUseCase } from './use-cases/find-all-users.usecase';
import { FindOneUserUseCase } from './use-cases/find-one-user.usecase';
import { FindUserLoggedUseCase } from './use-cases/find-user-logged.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';
import { UsersController } from './users.controller';
import { USERS_REPOSITORY } from './users.providers';

@Module({
  controllers: [UsersController],
  providers: [
    AdminSeed,
    UserLifecycleJob,
    CreateUserUseCase,
    FindUserLoggedUseCase,
    FindAllUsersUseCase,
    FindOneUserUseCase,
    UpdateUserUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
    DeleteUserUseCase,
    {
      provide: USERS_REPOSITORY,
      useClass:
        process.env.NODE_ENV === 'local'
          ? InMemoryUsersRepository
          : PrismaUsersRepository,
    },
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
