import { MAX_CENTS, savedCents, toCents } from './money.js';
import { parseDate, today } from './dates.js';
import { buildSchedule, FREQUENCIES } from './schedule.js';
import { CATEGORIES } from './categories.js';
import { validatePhoto, validatePhotoPosition } from './photos.js';

export function validateGoal(goal) {
  if (typeof goal.name !== 'string' || !goal.name.trim() || goal.name.length > 80) 
    throw new Error('Give your goal a name of 1–80 characters.');

  if (!Number.isSafeInteger(goal.targetCents) || goal.targetCents <= 0 || goal.targetCents > MAX_CENTS) 
    throw new Error('Choose a valid target amount.');

  if (!Object.hasOwn(FREQUENCIES, goal.frequency)) 
    throw new Error('Choose a contribution frequency.');

  if (!Number.isInteger(goal.periods) || goal.periods < 1 || goal.periods > 600) 
    throw new Error('Choose between 1 and 600 contributions.');

  if (goal.targetCents < goal.periods) 
    throw new Error('Each planned contribution must be at least $0.01.');

  if (goal.frequency === 'custom' && (!Number.isInteger(goal.customDays) || goal.customDays < 1 || goal.customDays > 365)) 
    throw new Error('Choose a custom interval of 1–365 days.');

  validatePhoto(goal.photo);

  validatePhotoPosition(goal.photoPosition ?? 50);

  if (!CATEGORIES.includes(goal.category)) 
    throw new Error('Choose a goal category.');
  parseDate(goal.startDate);

  if (Number(goal.startDate.slice(0, 4)) < 1900 || Number(goal.startDate.slice(0, 4)) > 2200) 
    throw new Error('Choose a start date between 1900 and 2200.');
  return goal;
}

export function goalFromInput(input, existing = null) {
  const goal = validateGoal({
    id: existing?.id ?? crypto.randomUUID(), name: input.name.trim(), category: input.category,
    targetCents: toCents(input.targetAmount),
    photo: validatePhoto(input.photo ?? null), photoPosition: validatePhotoPosition(Number(input.photoPosition ?? 50)),
    startDate: input.startDate, frequency: input.frequency, periods: Number(input.periods),
    customDays: Number(input.customDays ?? 1),
    contributions: existing?.contributions ?? [], createdAt: existing?.createdAt ?? new Date().toISOString(),
  });

  return { ...goal, schedule: buildSchedule(goal) };
}

export function addContribution(goal, input) {
  const amountCents = toCents(input.amount);
  parseDate(input.date);
  if (input.date > today()) 
    throw new Error('A contribution date cannot be in the future.');

  if (input.date < goal.startDate) 
    throw new Error('A contribution cannot be dated before the goal starts.');

  if (savedCents(goal) + amountCents > MAX_CENTS) 
    throw new Error('This contribution exceeds the supported savings limit.');

  const scheduledPeriod = Number(input.scheduledPeriod);

  if (!Number.isInteger(scheduledPeriod) || scheduledPeriod < 1 || scheduledPeriod > goal.periods) 
    throw new Error('Choose a scheduled contribution.');

  if (String(input.note ?? '').length > 160) 
    throw new Error('Keep your note under 160 characters.');
  
  return { ...goal, contributions: [...goal.contributions, {
    id: crypto.randomUUID(), amountCents, date: input.date, scheduledPeriod, note: String(input.note ?? '').trim(),
  }] };
}

export function goalProgress(goal) {
  const saved = savedCents(goal);
  const ratio = Math.min(1, saved / goal.targetCents);
  return { saved, ratio, percent: Math.floor(ratio * 100), 
    completed: saved >= goal.targetCents, remaining: Math.max(0, goal.targetCents - saved) };
}
