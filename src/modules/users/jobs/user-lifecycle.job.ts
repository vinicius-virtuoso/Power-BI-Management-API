import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { User } from '../entities/user.entity';
import type { UsersRepository } from '../repositories/users.repository';
import { USERS_REPOSITORY } from '../users.providers';

@Injectable()
export class UserLifecycleJob {
  private readonly logger = new Logger(UserLifecycleJob.name);

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  @Cron('* * 3 */3 * *', {
    name: 'Limpeza de Usuários',
    timeZone: 'America/Sao_Paulo',
  })
  async handle() {
    this.logger.log('Iniciando processamento de ciclo de vida de usuários...');

    const now = new Date();
    const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const cutoff60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const candidates =
      await this.usersRepository.findUsersInactiveSince(cutoff30);

    const toDeactivate: User[] = [];
    const idsToDelete: string[] = [];

    for (const user of candidates) {
      if (!user.lastAccess) continue;

      const lastAccessTime = user.lastAccess.getTime();

      if (lastAccessTime <= cutoff60.getTime() && !user.isActive) {
        idsToDelete.push(user.id);
        continue;
      }

      if (lastAccessTime <= cutoff30.getTime() && user.isActive) {
        toDeactivate.push(user.deactivate());
      }
    }

    if (toDeactivate.length > 0) {
      await this.usersRepository.updateMany(toDeactivate);
      this.logger.log(`${toDeactivate.length} usuários desativados em lote.`);
    }

    if (idsToDelete.length > 0) {
      await this.usersRepository.deleteMany(idsToDelete);
      this.logger.log(`${idsToDelete.length} usuários deletados em lote.`);
    }
  }
}
