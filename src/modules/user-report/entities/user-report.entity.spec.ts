import { UserReport } from './user-report.entity';

describe('UserReport Entity', () => {
  it('deve criar um vínculo de usuário e relatório usando o factory create', () => {
    const userReport = UserReport.create({
      userId: 'user-1',
      reportId: 'report-1',
    });

    expect(userReport.id).toBeUndefined();
    expect(userReport.userId).toBe('user-1');
    expect(userReport.reportId).toBe('report-1');
  });

  it('deve reconstruir a entidade a partir da persistência', () => {
    const userReport = UserReport.fromPersistence({
      id: '1',
      userId: 'user-1',
      reportId: 'report-1',
    });

    expect(userReport.id).toBe('1');
    expect(userReport.userId).toBe('user-1');
    expect(userReport.reportId).toBe('report-1');
  });

  it('deve retornar a visualização correta da entidade', () => {
    const userReport = UserReport.fromPersistence({
      id: '1',
      userId: 'user-1',
      reportId: 'report-1',
    });

    const view = userReport.toView();

    expect(view).toEqual({
      id: '1',
      userId: 'user-1',
      reportId: 'report-1',
    });
  });
});
