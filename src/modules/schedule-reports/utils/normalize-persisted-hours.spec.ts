import { normalizePersistedHours } from './normalize-persisted-hours';

describe('normalizePersistedHours', () => {
  it('converte hora legada de um ou dois dígitos para HH:00', () => {
    expect(normalizePersistedHours(['9', '14'])).toEqual(['09:00', '14:00']);
  });

  it('mantém valores já em HH:mm', () => {
    expect(normalizePersistedHours(['09:30', '14:00'])).toEqual([
      '09:30',
      '14:00',
    ]);
  });
});
