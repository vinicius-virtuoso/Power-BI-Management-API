import type { Hours } from '../entities/schedule-report.entity';

/** Converte entradas legadas (ex.: "09") para HH:mm ao ler do banco. */
export function normalizePersistedHours(tokens: string[]): Hours[] {
  return tokens.map((t) => {
    if (/^\d{1,2}$/.test(t)) {
      return `${t.padStart(2, '0')}:00` as Hours;
    }
    return t as Hours;
  });
}
