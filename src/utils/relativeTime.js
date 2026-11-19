const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * When something happens, in words, in the given language:
 * "in less than a minute", "in 5 minutes", "today, 2:17 PM", "tomorrow, 9:00 AM",
 * or "Mon, Nov 23, 9:00 AM" (and the same in Spanish for 'es').
 *
 * @param {Date} date
 * @param {Date} now
 * @param {string} locale  e.g. 'en-US' or 'es'
 */
export function whenText(date, now, locale) {
  const ms = date.getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const time = date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  if (ms < 60_000) return locale.startsWith('es') ? 'en menos de un minuto' : 'in less than a minute';
  if (ms < 60 * 60_000) return rtf.format(Math.round(ms / 60_000), 'minute');
  if (sameDay(date, now)) return `${rtf.format(0, 'day')}, ${time}`;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(date, tomorrow)) return `${rtf.format(1, 'day')}, ${time}`;
  return date.toLocaleString(locale, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
