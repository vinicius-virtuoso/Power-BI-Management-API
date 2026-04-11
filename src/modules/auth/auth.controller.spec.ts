import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthResponse = {
    access_token: 'token_gerado_com_sucesso',
    user: {
      id: '1',
      name: 'vini',
      email: 'vini@example.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(mockAuthResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('deve chamar o authService.login com os dados corretos', async () => {
      const loginDto: AuthLoginDto = {
        email: 'vini@example.com',
        password: 'password123',
      };

      const result = await controller.signIn(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuthResponse);
    });

    it('deve repassar a exceção caso o authService falhe', async () => {
      const loginDto: AuthLoginDto = {
        email: 'errado@test.com',
        password: '123',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new Error('Unauthorized'));
      await expect(controller.signIn(loginDto)).rejects.toThrow('Unauthorized');
    });
  });
});
