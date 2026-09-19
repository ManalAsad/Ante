export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Choose a valid date.');
  const result = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(result.getTime()) || result.toISOString().slice(0, 10) !== value) {
    throw new Error('Choose a valid date.');
  }
  return result;
}

export function formatDate(value, long = false) {
  return new Intl.DateTimeFormat('en-US', {
    month: long ? 'long' : 'short', day: 'numeric', ...(long ? { year: 'numeric' } : {}), timeZone: 'UTC',
  }).format(parseDate(value));
}

export function addDays(value, days) {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Anchor every due date to the original day: Jan 31 → Feb 28 → Mar 31.
export function addMonths(value, months) {
  const date = parseDate(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}
