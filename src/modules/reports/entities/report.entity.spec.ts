import { Report } from './report.entity';

describe('Report Entity', () => {
  const reportData = {
    externalId: 'ext-123',
    name: 'Relatório Teste',
    webUrl: 'https://web.url',
    embedUrl: 'https://embed.url',
    datasetId: 'ds-123',
    workspaceId: 'ws-123',
    isActive: true,
  };

  it('deve criar uma instância de relatório com status ativo por padrão', () => {
    const report = Report.create(reportData);
    expect(report.isActive).toBe(true);
    expect(report.errors).toBeNull();
  });

  it('deve manter o lastUpdate anterior se o novo lastUpdate for null no lastUpdateEnd', () => {
    const originalDate = new Date('2026-01-01');
    const report = Report.fromPersistence({
      ...reportData,
      id: '1',
      lastUpdate: originalDate,
    });

    const updated = report.lastUpdateEnd(null as any, 'novo erro');

    expect(updated.lastUpdate).toBe(originalDate);
    expect(updated.errors).toBe('novo erro');
  });

  it('deve desativar o relatório corretamente', () => {
    const report = Report.create(reportData);
    const deactivated = report.deactivate();

    expect(deactivated.isActive).toBe(false);
    expect(report.isActive).toBe(true); // Imutabilidade
  });

  it('deve ativar o relatório corretamente', () => {
    const report = Report.fromPersistence({
      ...reportData,
      id: '1',
      isActive: false,
    });
    const activated = report.activate();

    expect(activated.isActive).toBe(true);
  });

  it('deve retornar null no toView se não houver erros', () => {
    const report = Report.create(reportData);
    const view = report.toView();

    expect(view.errors).toBeNull();
  });

  it('deve atualizar a última atualização e as mensagens de erro', () => {
    const report = Report.create(reportData);
    const now = new Date();
    const errorMsg = '{"message": "API Timeout"}';

    const updated = report.lastUpdateEnd(now, errorMsg);

    expect(updated.lastUpdate).toBe(now);
    expect(updated.errors).toBe(errorMsg);
  });

  it('deve converter para view processando o JSON de erros corretamente', () => {
    const report = Report.fromPersistence({
      ...reportData,
      id: '1',
      errors: '{"code": 401, "message": "Unauthorized"}',
    });

    const view = report.toView();

    expect(view.errors).toEqual({ code: 401, message: 'Unauthorized' });
  });

  it('deve retornar a string original no toView se o erro não for um JSON válido', () => {
    const report = Report.fromPersistence({
      ...reportData,
      id: '1',
      errors: 'Erro genérico de rede',
    });

    const view = report.toView();

    expect(view.errors).toBe('Erro genérico de rede');
  });

  it('deve retornar null no campo de erros se passar null para lastUpdateEnd', () => {
    const report = Report.fromPersistence({
      ...reportData,
      id: '1',
      errors: 'erro antigo',
    });

    const updated = report.lastUpdateEnd(new Date(), null);

    expect(updated.errors).toBeNull();
  });

  it('deve usar o lastUpdate atual se o novo for undefined no lastUpdateEnd', () => {
    const originalDate = new Date('2026-01-01');
    const report = Report.fromPersistence({
      ...reportData,
      id: '1',
      lastUpdate: originalDate,
    });

    const updated = report.lastUpdateEnd(undefined as any, 'erro');

    expect(updated.lastUpdate).toBe(originalDate);
  });

  it('deve garantir que fromPersistence mapeia todos os campos, incluindo os opcionais', () => {
    const fullData = {
      ...reportData,
      id: 'uuid-123',
      lastUpdate: new Date(),
      errors: 'algum erro',
    };

    const report = Report.fromPersistence(fullData);

    expect(report.id).toBe(fullData.id);
    expect(report.lastUpdate).toBe(fullData.lastUpdate);
    expect(report.errors).toBe(fullData.errors);
  });
});
