import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('deve retornar um access_token ao usar credenciais válidas do SEED', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@empresa.com',
          password: 'admin12345678',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('deve retornar 401 para credenciais inexistentes', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nao_existe@email.com',
          password: 'qualquer_coisa',
        })
        .expect(401);
    });
  });
});
