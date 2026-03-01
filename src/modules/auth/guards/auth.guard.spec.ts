import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { IS_PUBLIC_KEY } from '../../../decorators/is-public.decorator';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  // Helper para criar um contexto de execução mockado
  const createMockContext = (
    authHeader?: string,
  ): Partial<ExecutionContext> => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        headers: {
          authorization: authHeader,
        },
      }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('deve estar definido', () => {
    expect(guard).toBeDefined();
  });

  it('deve retornar true se a rota for marcada como pública', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext() as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
  });

  it('deve permitir acesso se o token for válido', async () => {
    const payload = { sub: 1, username: 'vini' };
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockResolvedValue(payload);

    const context = createMockContext(
      'Bearer token_valido',
    ) as ExecutionContext;
    const request = context.switchToHttp().getRequest();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request['user']).toEqual(payload);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token_valido');
  });

  it('deve lançar UnauthorizedException se não houver token', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext() as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('deve lançar UnauthorizedException se o token for inválido', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockJwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

    const context = createMockContext(
      'Bearer token_invalido',
    ) as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
