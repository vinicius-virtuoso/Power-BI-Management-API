import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { USERS_REPOSITORY } from '../users/users.providers';
import { AuthService } from './auth.service';

// Mock da função compare do bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: any;
  let jwtService: JwtService;

  // Criamos um usuário de exemplo que simula a sua Entidade
  const mockUser = {
    id: '1',
    email: 'vini@example.com',
    password: 'hashed_password',
    role: 'admin',
    isActive: true,
    // Simulamos o método que você chamou no seu código
    updateLastAccess: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USERS_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token_valido'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(USERS_REPOSITORY);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('deve autenticar com sucesso e retornar um token', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'vini@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ access_token: 'token_valido' });
      expect(usersRepository.update).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: mockUser.id,
        role: mockUser.role,
      });
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'vini@example.com', password: 'senha_errada' }),
      ).rejects.toThrow(new UnauthorizedException('Invalids credentials'));
    });

    it('deve lançar UnauthorizedException se o usuário não existir', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'naoexiste@example.com', password: '123' }),
      ).rejects.toThrow(new UnauthorizedException('Invalids credentials'));
    });

    it('deve lançar UnauthorizedException se o usuário estiver inativo', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersRepository.findByEmail.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ email: 'vini@example.com', password: '123' }),
      ).rejects.toThrow(new UnauthorizedException('Access denied'));
    });
  });
});
