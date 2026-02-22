import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/lib/prisma';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    const adminEmail = 'admin@empresa.com';
    const adminPassword = 'admin12345678';

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: adminEmail,
        password: adminPassword,
      });

    accessToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    prisma = app.get(PrismaService);

    await prisma.$executeRaw`DELETE FROM "users" WHERE "email" != 'admin@empresa.com'`;
    await app.close();
  });

  describe('/users/add (POST)', () => {
    const newUserEmail = `new.${Date.now()}@test.com`;

    it('deve criar um novo usuário com sucesso quando logado como ADMIN', () => {
      return request(app.getHttpServer())
        .post('/api/users/add')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Novo Usuário Teste',
          email: newUserEmail,
          password: 'Password123!',
          role: 'USER',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(newUserEmail);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('deve retornar 409 ao tentar criar um email já existente', () => {
      return request(app.getHttpServer())
        .post('/api/users/add')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Duplicado',
          email: 'admin@empresa.com',
          password: 'password123',
          role: 'USER',
        })
        .expect(409);
    });
  });

  describe('/users (GET)', () => {
    it('deve listar todos os usuários quando ADMIN', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('Users Update Logic (PATCH)', () => {
    let userToken: string;
    let userId: string;
    const userEmail = `user.${Date.now()}@test.com`;
    const userPassword = 'password123';

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users/add')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Original User',
          email: userEmail,
          password: userPassword,
          role: 'USER',
        });
      userId = res.body.id;

      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: userEmail, password: userPassword });
      userToken = loginRes.body.access_token;
    });

    it('deve permitir que um ADMIN atualize qualquer usuário', () => {
      return request(app.getHttpServer())
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated by Admin' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated by Admin');
        });
    });

    it('deve permitir que um USER atualize seu próprio perfil', () => {
      return request(app.getHttpServer())
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated by Self' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated by Self');
        });
    });

    it('deve retornar 403 se um USER tentar atualizar outro usuário', async () => {
      const usersList = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${accessToken}`);

      const adminId = usersList.body.find(
        (u) => u.email === 'admin@empresa.com',
      ).id;

      return request(app.getHttpServer())
        .patch(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacker Attempt' })
        .expect(403);
    });

    it('deve retornar 400 se tentar mudar o email para um já existente', () => {
      return request(app.getHttpServer())
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'admin@empresa.com' })
        .expect(400);
    });
  });

  describe('Status and Deletion Flow', () => {
    let targetId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users/add')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Delete Target',
          email: `delete.${Date.now()}@test.com`,
          password: 'password123',
          role: 'USER',
        });
      targetId = res.body.id;
    });

    it('deve desativar e ativar o usuário', async () => {
      await request(app.getHttpServer())
        .patch(`/api/users/deactivate/${targetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => expect(res.body.isActive).toBe(false));

      await request(app.getHttpServer())
        .patch(`/api/users/activate/${targetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => expect(res.body.isActive).toBe(true));
    });

    it('deve deletar o usuário e retornar 404 na busca', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${targetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/users/${targetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
