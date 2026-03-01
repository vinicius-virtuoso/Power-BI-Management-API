import { ScheduleReport, ScheduleReportCreate } from './schedule-report.entity';

describe('ScheduleReport Entity', () => {
  const makeCreateData = (): ScheduleReportCreate => ({
    reportId: 'report-uuid',
    hoursCommon: ['08', '12'],
    isClosingDays: true,
    closingDays: ['01', '31'],
    hoursClosingDays: ['10', '22'],
  });

  it('deve criar uma nova instância de agendamento com status ativo por padrão', () => {
    const data = makeCreateData();
    const schedule = ScheduleReport.create(data);

    expect(schedule.id).toBeUndefined();
    expect(schedule.reportId).toBe(data.reportId);
    expect(schedule.hoursCommon).toEqual(data.hoursCommon);
    expect(schedule.isActive).toBe(true);
  });

  it('deve restaurar uma instância a partir da persistência (banco de dados)', () => {
    const persistenceData = {
      id: 'existing-id',
      reportId: 'report-uuid',
      hoursCommon: ['09'] as any,
      isClosingDays: false,
      closingDays: [] as any,
      hoursClosingDays: [] as any,
      isActive: false,
    };

    const schedule = ScheduleReport.fromPersistence(persistenceData);

    expect(schedule.id).toBe('existing-id');
    expect(schedule.isActive).toBe(false);
  });

  it('deve desativar um agendamento corretamente', () => {
    const schedule = ScheduleReport.create(makeCreateData());
    const deactivated = schedule.deactivate();

    expect(deactivated.isActive).toBe(false);
    expect(schedule.isActive).toBe(true);
  });

  it('deve ativar um agendamento corretamente', () => {
    const schedule = ScheduleReport.fromPersistence({
      ...makeCreateData(),
      id: '1',
      isActive: false,
    });

    const activated = schedule.activate();

    expect(activated.isActive).toBe(true);
  });

  it('deve atualizar campos específicos e manter os outros valores originais', () => {
    const schedule = ScheduleReport.create(makeCreateData());
    const newHours = ['23'] as any;

    const updated = schedule.update({
      hoursCommon: newHours,
      isClosingDays: false,
    });

    expect(updated.hoursCommon).toEqual(newHours);
    expect(updated.isClosingDays).toBe(false);
    expect(updated.closingDays).toEqual(schedule.closingDays);
    expect(updated.hoursClosingDays).toEqual(schedule.hoursClosingDays);
  });

  it('deve manter todos os valores originais se o objeto de atualização estiver vazio', () => {
    const data = makeCreateData();
    const schedule = ScheduleReport.create(data);

    const updated = schedule.update({});

    expect(updated.hoursCommon).toEqual(schedule.hoursCommon);
    expect(updated.isClosingDays).toBe(schedule.isClosingDays);
    expect(updated.closingDays).toEqual(schedule.closingDays);
    expect(updated.hoursClosingDays).toEqual(schedule.hoursClosingDays);
    expect(updated.isActive).toBe(schedule.isActive);
  });

  it('deve converter corretamente para um objeto de visualização (View Object)', () => {
    const schedule = ScheduleReport.fromPersistence({
      id: '123',
      reportId: 'rep-1',
      hoursCommon: ['01'],
      isClosingDays: false,
      closingDays: [],
      hoursClosingDays: [],
      isActive: true,
    });

    const view = schedule.toView();

    expect(view).toEqual({
      id: '123',
      reportId: 'rep-1',
      hoursCommon: ['01'],
      isClosingDays: false,
      closingDays: [],
      hoursClosingDays: [],
      isActive: true,
    });
  });
});
