import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import type { UsersRepository } from '../users/repositories/users.repository';
import { USERS_REPOSITORY } from '../users/users.providers';

export type AuthServiceProps = {
  email: string;
  password: string;
};

export type AuthServiceResponse = {
  access_token: string;
  user: { name: string; email: string };
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: UsersRepository,

    private jwtService: JwtService,
  ) {}

  async login(data: AuthServiceProps): Promise<AuthServiceResponse> {
    const userFound = await this.usersRepository.findByEmail(data.email);
    const passwordCompare = userFound
      ? await compare(data.password, userFound.password)
      : false;

    if (!userFound || !passwordCompare) {
      throw new UnauthorizedException('E-mail ou senha incorreto');
    }

    if (!userFound.isActive) {
      throw new UnauthorizedException(
        'Ops, algo estranho nessa conta, chame o suporte',
      );
    }

    const payload = {
      id: userFound.id,
      role: userFound.role,
    };

    await this.usersRepository.update(userFound.updateLastAccess());

    const access_token = await this.jwtService.signAsync(payload);

    const { name, email } = userFound.toView();

    return {
      access_token,
      user: { name, email },
    };
  }
}
