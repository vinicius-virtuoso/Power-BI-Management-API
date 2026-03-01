import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
    name: 'Horário de Brasilia',
    timeZone: 'America/Sao_Paulo',
  }) // Vai rodar a cada 3 dias, as 03 da madrugada
  async handle() {
    this.logger.log('Iniciando limpeza de usuários inativos...');

    const now = new Date();

    const cutoff30 = new Date(now);
    cutoff30.setDate(now.getDate() - 30);

    const cutoff60 = new Date(now);
    cutoff60.setDate(now.getDate() - 60);

    const inactiveUsers =
      await this.usersRepository.findUsersInactiveSince(cutoff30);

    let deactivated = 0;

    for (const user of inactiveUsers) {
      if (!user.isActive) continue;

      await this.usersRepository.deactivate(user.deactivate());
      deactivated++;
    }

    const expiredUsers =
      await this.usersRepository.findUsersInactiveSince(cutoff60);

    let deleted = 0;

    for (const user of expiredUsers) {
      if (user.isActive) continue;
      if (!user.id) continue;

      await this.usersRepository.delete(user.id);
      deleted++;
    }

    this.logger.log(`Desativados: ${deactivated}`);
    this.logger.log(`Deletados: ${deleted}`);
  }
}
