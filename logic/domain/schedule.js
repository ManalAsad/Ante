import { addDays, addMonths } from './dates.js';
import { savedCents } from './money.js';

export const FREQUENCIES = {
  daily: 'Daily', weekly: 'Weekly', biweekly: 'Every two weeks',
  monthly: 'Monthly', yearly: 'Yearly', custom: 'Custom interval',
};

export function buildSchedule(goal) {
  const { targetCents, periods, startDate, frequency, customDays } = goal;
  const base = Math.floor(targetCents / periods);
  const remainder = targetCents % periods;
  return Array.from({ length: periods }, (_, index) => {
    const period = index + 1;
    const dueDate = frequency === 'monthly' || frequency === 'yearly'
      ? addMonths(startDate, period * (frequency === 'yearly' ? 12 : 1))
      : addDays(startDate, period * ({ daily: 1, weekly: 7, biweekly: 14 }[frequency] ?? customDays));
    return { period, dueDate, amountCents: base + (index < remainder ? 1 : 0) };
  });
}

// Total savings fund the earliest scheduled installments first, including overpayments.
export function fundedSchedule(goal) {
  let available = savedCents(goal);
  return buildSchedule(goal).map((item) => {
    const paidCents = Math.min(available, item.amountCents);
    available -= paidCents;
    return { ...item, paidCents, remainingCents: item.amountCents - paidCents,
      status: paidCents === item.amountCents ? 'paid' : paidCents > 0 ? 'partial' : 'pending' };
  });
}

export function nextContribution(goal) {
  return fundedSchedule(goal).find((item) => item.remainingCents > 0) ?? null;
}
