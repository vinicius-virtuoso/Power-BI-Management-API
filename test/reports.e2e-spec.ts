import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/lib/prisma';
import { POWER_BI_REPOSITORY } from '../src/modules/reports/reports.providers';

describe('ReportsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let prisma: PrismaService;

  const mockPowerBiRepository = {
    authenticate: jest.fn().mockResolvedValue({ access_token: 'fake-token' }),
    listReports: jest.fn().mockResolvedValue([
      {
        externalId: 'ext-pbi-123',
        name: 'Relatório Mockado',
        embedUrl: 'https://mock.url',
        webUrl: 'https://mock.url',
        datasetId: 'ds-123',
        workspaceId: 'ws-123',
      },
    ]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(POWER_BI_REPOSITORY)
      .useValue(mockPowerBiRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    await app.init();
    prisma = app.get(PrismaService);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@empresa.com',
        password: 'admin12345678',
      });

    accessToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/reports/sync (PATCH)', () => {
    it('deve sincronizar relatórios do Power BI com sucesso quando ADMIN', async () => {
      return request(app.getHttpServer())
        .patch('/api/reports/sync')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.total).toBeGreaterThan(0);
        });
    });
  });

  describe('Reports Activation/Deactivation (PATCH)', () => {
    let reportId: string;

    beforeEach(async () => {
      const report = await prisma.report.create({
        data: {
          externalId: `manual-${Date.now()}-${Math.random()}`,
          name: 'Relatório de Teste',
          embedUrl: 'https://app.powerbi.com/reportEmbed',
          webUrl: 'https://app.powerbi.com/view',
          datasetId: 'ds-001',
          workspaceId: 'ws-001',
          isActive: true,
        },
      });
      reportId = report.id;
    });

    it('deve desativar um relatório manualmente', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/reports/deactivate/${reportId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      if (response.status === 404) {
        console.error('Debug 404 - Body:', response.body);
        const exists = await prisma.report.findUnique({
          where: { id: reportId },
        });
        console.error('Existe no banco?', !!exists);
      }

      expect(response.status).toBe(200);
      expect(response.body.isActive).toBe(false);
    });

    it('deve ativar um relatório manualmente', async () => {
      await prisma.report.update({
        where: { id: reportId },
        data: { isActive: false },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/reports/activate/${reportId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isActive).toBe(true);
    });
  });

  describe('Reports Deletion (DELETE)', () => {
    let reportId: string;

    beforeEach(async () => {
      // Cria um relatório específico para ser deletado
      const report = await prisma.report.create({
        data: {
          externalId: `delete-${Date.now()}`,
          name: 'Relatório para Deletar',
          embedUrl: 'https://app.powerbi.com/reportEmbed',
          webUrl: 'https://app.powerbi.com/view',
          datasetId: 'ds-del',
          workspaceId: 'ws-del',
          isActive: true,
        },
      });
      reportId = report.id;
    });

    it('deve excluir um relatório permanentemente quando ADMIN', async () => {
      // Realiza a exclusão
      await request(app.getHttpServer())
        .delete(`/api/reports/report/${reportId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Verifica se o relatório realmente sumiu do banco
      const exists = await prisma.report.findUnique({
        where: { id: reportId },
      });
      expect(exists).toBeNull();
    });

    it('deve retornar 404 ao tentar excluir um relatório que não existe', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .delete(`/api/reports/report/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
