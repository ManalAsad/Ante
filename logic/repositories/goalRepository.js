import { validateGoal } from '../domain/goals.js';
import { buildSchedule } from '../domain/schedule.js';
import { MAX_CENTS } from '../domain/money.js';
import { parseDate } from '../domain/dates.js';
import { THEME_IDS } from '../domain/themes.js';

export const STORAGE_KEY = 'bloom.goals.v1';
export function decodeData(raw) {
  const data = JSON.parse(raw);

  if (data?.version !== 1 || !Array.isArray(data.goals) || data.goals.length > 500) 
    throw new Error('This is not a supported Bloom backup.');

  const ids = new Set();

  return data.goals.map((stored) => {
    // Old backups still load; a journey theme we no longer ship is simply dropped.
    const goal = { ...stored, themeId: THEME_IDS.includes(stored.themeId) ? stored.themeId : null };
    validateGoal(goal);
    if (typeof goal.id !== 'string' || !goal.id || ids.has(goal.id) || !Array.isArray(goal.contributions)) 
      throw new Error('This backup contains an invalid goal.');

    ids.add(goal.id);

    let total = 0;
    const contributionIds = new Set();
    
    goal.contributions.forEach((item) => {
      if (typeof item.id !== 'string' || !item.id || contributionIds.has(item.id) || !Number.isSafeInteger(item.amountCents) || item.amountCents <= 0 || (item.note != null && (typeof item.note !== 'string' || item.note.length > 160))) 
        throw new Error('This backup contains an invalid contribution.');

      contributionIds.add(item.id);
      parseDate(item.date);
      total += item.amountCents;
    });
    if (!Number.isSafeInteger(total) || total > MAX_CENTS) 
      throw new Error('Saved amount exceeds the supported limit.');

    return { ...goal, photo: goal.photo || null, photoPosition: goal.photoPosition ?? 50, schedule: buildSchedule(goal) };
  });
}

export function createGoalRepository(getStorage = () => window.localStorage) {
  return {
    load() {
      const raw = getStorage().getItem(STORAGE_KEY);
      return raw === null ? [] : decodeData(raw);
    },
    save(goals) {
      const raw = JSON.stringify({ version: 1, goals });
      decodeData(raw);
      try { getStorage().setItem(STORAGE_KEY, raw); }
      catch { throw new Error('Your browser could not save this change.Storage may be full or disabled. Export a backup before continuing.'); }
    },
    exportRaw() { return getStorage().getItem(STORAGE_KEY) ?? JSON.stringify({ version: 1, goals: [] }); },
  };
}
