import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import type { UsersRepository } from '../repositories/users.repository';
import { USERS_REPOSITORY } from '../users.providers';

@Injectable()
export class AdminSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeed.name);

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  async onApplicationBootstrap() {
    // if (process.env.NODE_ENV !== 'production') return;

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME ?? 'Administrator';

    if (!email || !password) {
      this.logger.warn('ADMIN_EMAIL ou ADMIN_PASSWORD não definidos');
      return;
    }

    const existing = await this.usersRepository.findByEmail(email);

    if (existing) {
      this.logger.log('Admin já existe, seed ignorado');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = User.create({
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
    });

    await this.usersRepository.save(admin);

    this.logger.log('Admin criado com sucesso');
  }
}
