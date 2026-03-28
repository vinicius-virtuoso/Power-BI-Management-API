import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/lib/prisma';

describe('UserReportController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;

  let userId: string;
  let reportId: string;

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

    // Login Admin para realizar as operações de escrita
    const loginAdmin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@empresa.com', password: 'admin12345678' });
    adminToken = loginAdmin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const user = await prisma.user.create({
      data: {
        name: 'User Atômico',
        email: `user.${uniqueSuffix}@test.com`,
        password: 'password123',
        role: 'USER',
      },
    });

    userId = user.id;

    const report = await prisma.report.create({
      data: {
        externalId: `ext-${uniqueSuffix}`,
        name: 'Relatório Atômico',
        embedUrl: 'http://pbi.com',
        webUrl: 'http://pbi.com',
        datasetId: 'ds-1',
        workspaceId: 'ws-1',
        isActive: true,
      },
    });

    reportId = report.id;
  });

  describe('Fluxo Atômico de Vínculos', () => {
    it('deve realizar o ciclo completo de concessão, listagem e revogação sem interferência externa', async () => {
      // 2. CONCEDER ACESSO (POST /share)
      const resGrant = await request(app.getHttpServer())
        // URL Corrigida para /api/user-reports/share
        .post('/api/user-reports/share')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId,
          reportId,
        })
        .expect(201);

      expect(resGrant.body.id).toBeDefined();

      // 3. VERIFICAR SE O RELATÓRIO APARECE NA LISTAGEM
      const resList = await request(app.getHttpServer())
        // URL Corrigida para /api/user-reports/user/:userId/reports
        .get(`/api/user-reports/user/${userId}/reports`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(resList.body.total).toBeGreaterThan(0);

      // 4. REVOGAR ACESSO (DELETE /revoke)
      await request(app.getHttpServer())
        // URL Corrigida para /api/user-reports/revoke
        .delete('/api/user-reports/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId,
          reportId,
        })
        .expect(204);

      // 5. VERIFICAR SE REALMENTE FOI DELETADO (404 esperado na segunda revogação)
      await request(app.getHttpServer())
        // URL Corrigida para /api/user-reports/revoke
        .delete('/api/user-reports/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId,
          reportId,
        })
        .expect(404);
    });
  });
});
