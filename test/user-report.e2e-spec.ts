import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/lib/prisma';

describe('UserReportController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;

  let sharedUserId: string;
  let sharedReportId: string;
  let relationId: string; // Guardaremos o ID da relação aqui

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

    prisma = app.get(PrismaService);

    // Limpeza
    await prisma.$executeRawUnsafe('DELETE FROM "user_reports"');
    await prisma.$executeRawUnsafe('DELETE FROM "reports"');
    await prisma.$executeRawUnsafe(
      'DELETE FROM "users" WHERE "email" != \'admin@empresa.com\'',
    );

    const loginAdmin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@empresa.com', password: 'admin12345678' });
    adminToken = loginAdmin.body.access_token;

    const userRes = await request(app.getHttpServer())
      .post('/api/users/add')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'User Test',
        email: `user.${Date.now()}@test.com`,
        password: 'password123',
        role: 'USER',
      });
    sharedUserId = userRes.body.id;

    const loginUser = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: userRes.body.email, password: 'password123' });
    userToken = loginUser.body.access_token;

    const report = await prisma.report.create({
      data: {
        externalId: `ext-${Date.now()}`,
        name: 'Relatório Teste',
        embedUrl: 'http://pbi.com',
        webUrl: 'http://pbi.com',
        datasetId: 'ds-1',
        workspaceId: 'ws-1',
        isActive: true,
      },
    });
    sharedReportId = report.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/reports/grant (POST)', () => {
    it('deve conceder acesso e retornar o ID da relação', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/reports/grant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: sharedUserId,
          reportId: sharedReportId,
        })
        .expect(201);

      relationId = res.body.id; // Pegamos o ID gerado pelo save() no repository
      expect(relationId).toBeDefined();
    });
  });

  describe('/reports (GET)', () => {
    it('deve listar os relatórios no formato paginado', async () => {
      return request(app.getHttpServer())
        .get('/api/reports')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          // Ajustado para bater com o PaginatedResult do Use Case
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.reports)).toBe(true);
          expect(res.body.total).toBeGreaterThan(0);
        });
    });
  });

  describe('/reports/revoke (DELETE)', () => {
    it('deve revogar o acesso usando o userReportId (ADMIN)', async () => {
      return request(app.getHttpServer())
        .delete('/api/reports/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userReportId: relationId, // Enviando o campo correto esperado pelo Use Case
        })
        .expect(204);
    });

    it('deve retornar 404 ao tentar revogar um vínculo inexistente', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .delete('/api/reports/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userReportId: fakeUuid,
        })
        .expect(404);
    });
  });
});
