// FR-1.2 / FR-1.3 / FR-1.4: turn (start date, frequency, target) into a
// concrete list of due dates + per-period amounts.

function toDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

function toISODateString(date) {
  return date.toISOString().slice(0, 10);
}

function addInterval(date, frequency, customIntervalDays) {
  const d = new Date(date);
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'biweekly':
      d.setDate(d.getDate() + 14);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    case 'custom':
      d.setDate(d.getDate() + customIntervalDays);
      break;
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }
  return d;
}

/**
 * Approach A, option 1 ("in 6 months"): given a start and end date, count
 * how many contribution periods fit by walking forward with addInterval.
 */
function calculateNumPeriodsFromEndDate(startDateStr, endDateStr, frequency, customIntervalDays) {
  const start = toDate(startDateStr);
  const end = toDate(endDateStr);
  let cursor = new Date(start);
  let periods = 0;
  const MAX_PERIODS = 10000; // safety cap against bad input looping forever

  while (cursor.getTime() < end.getTime() && periods < MAX_PERIODS) {
    cursor = addInterval(cursor, frequency, customIntervalDays);
    periods += 1;
  }

  return Math.max(periods, 1);
}

/**
 * FR-1.4: build the full list of scheduled contribution dates + amounts.
 */
function generateSchedule(startDateStr, frequency, numPeriods, amountPerPeriod, customIntervalDays) {
  const schedule = [];
  let cursor = toDate(startDateStr);

  for (let i = 1; i <= numPeriods; i++) {
    cursor = addInterval(cursor, frequency, customIntervalDays);
    schedule.push({
      period: i,
      due_date: toISODateString(cursor),
      amount: roundCents(amountPerPeriod),
      status: 'pending',
    });
  }

  return schedule;
}

function roundCents(n) {
  return Math.round(n * 100) / 100;
}

module.exports = {
  addInterval,
  calculateNumPeriodsFromEndDate,
  generateSchedule,
  toDate,
  toISODateString,
  roundCents,
};
