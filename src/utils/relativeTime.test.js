import { describe, expect, it } from 'vitest';
import { whenText } from './relativeTime';

const NOW = new Date('2026-11-19T14:17:00');
const at = (minutes) => new Date(NOW.getTime() + minutes * 60_000);

describe('whenText', () => {
  it('says soon things relatively, in each language', () => {
    expect(whenText(at(0.5), NOW, 'en-US')).toBe('in less than a minute');
    expect(whenText(at(0.5), NOW, 'es')).toBe('en menos de un minuto');
    expect(whenText(at(5), NOW, 'en-US')).toBe('in 5 minutes');
    expect(whenText(at(5), NOW, 'es')).toBe('dentro de 5 minutos');
  });

  it('uses today and tomorrow, then the date', () => {
    expect(whenText(at(120), NOW, 'en-US')).toMatch(/^today, 4:17\sPM$/);
    expect(whenText(new Date('2026-11-20T09:00:00'), NOW, 'en-US')).toMatch(/^tomorrow, 9:00\sAM$/);
    expect(whenText(new Date('2026-11-20T09:00:00'), NOW, 'es')).toMatch(/^mañana, 9:00/);
    expect(whenText(new Date('2026-11-23T09:00:00'), NOW, 'en-US')).toMatch(/^Mon, Nov 23/);
  });
});
