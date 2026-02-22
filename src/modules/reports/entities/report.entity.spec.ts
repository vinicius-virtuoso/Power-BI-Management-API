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

  it('deve criar um report com create', () => {
    const report = Report.create(reportData);

    expect(report.id).toBeUndefined();
    expect(report.externalId).toBe(reportData.externalId);
    expect(report.name).toBe(reportData.name);
    expect(report.isActive).toBe(true);
  });

  it('deve criar um report a partir do persistence', () => {
    const persisted = { ...reportData, id: '1' };
    const report = Report.fromPersistence(persisted);

    expect(report.id).toBe('1');
    expect(report.externalId).toBe(reportData.externalId);
    expect(report.name).toBe(reportData.name);
  });

  it('deve desativar um report com deactivate', () => {
    const report = Report.create(reportData);
    const deactivated = report.deactivate();

    expect(deactivated.isActive).toBe(false);
    expect(deactivated.id).toBe(report.id);
  });

  it('deve ativar um report com activate', () => {
    const report = Report.create({ ...reportData, isActive: false });
    const activated = report.activate();

    expect(activated.isActive).toBe(true);
    expect(activated.id).toBe(report.id);
  });

  it('deve converter report para view', () => {
    const report = Report.create(reportData);
    const view = report.toView();

    expect(view).toEqual({
      id: report.id,
      externalId: report.externalId,
      name: report.name,
      webUrl: report.webUrl,
      embedUrl: report.embedUrl,
      datasetId: report.datasetId,
      workspaceId: report.workspaceId,
      isActive: report.isActive,
    });
  });
});
