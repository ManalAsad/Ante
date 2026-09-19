// Combines Mindful Money's psychological-framing concept with Bloom's
// schedule/contribution engine. The theme is a GLOBAL setting (picked once
// at onboarding, changeable anytime) that changes how EVERY goal's progress
// is interpreted — same underlying data, different feedback logic.
//
// Building 2 of the 4 themes for the hackathon demo (Lotus = calm,
// Crow = urgent), per both source docs' own recommendation to contrast one
// calm theme against one urgent one. Cat/Dog are stubbed so a third theme
// is a small addition, not a rewrite.

const { loadData, saveData } = require('./dataStore');
const { getNextPendingPeriod } = require('./goalLogic');
const { getBudgetProgress } = require('./budgetLogic');
const { toDate } = require('./scheduling');
const { ValidationError } = require('./validation');

const THEMES = ['lotus', 'crow', 'cat', 'dog'];
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getGlobalTheme() {
  const data = loadData();
  return data.settings.theme;
}

// FR (Mindful Money) — user can switch themes anytime and see the same
// data react differently. This is the whole "wow" moment for the demo.
function setGlobalTheme(theme) {
  if (!THEMES.includes(theme)) {
    throw new ValidationError(`Theme must be one of: ${THEMES.join(', ')}`);
  }
  const data = loadData();
  data.settings.theme = theme;
  saveData(data);
  return { theme };
}

// How many days overdue is this goal's next payment? 0 if on pace or fully paid.
function daysOverdue(goal) {
  const next = getNextPendingPeriod(goal);
  if (!next) return 0;
  const due = toDate(next.due_date);
  const today = toDate(new Date().toISOString().slice(0, 10));
  const diffDays = Math.floor((today.getTime() - due.getTime()) / ONE_DAY_MS);
  return diffDays > 0 ? diffDays : 0;
}

// Consecutive paid periods from the start with no gap — used by Dog's
// streak framing, but exposed generally since it's handy for any theme
// (and for the stretch-goal "weekly recap" feature).
function getCurrentStreak(goal) {
  let streak = 0;
  for (const period of goal.schedule) {
    if (period.status === 'paid') streak++;
    else break;
  }
  return streak;
}

/**
 * The core of the psychological-framing concept: same overdue/streak data,
 * completely different state + tone depending on theme.
 *
 * Returns { theme, state, label } — Person C maps `state` to a visual;
 * `label` is a ready-to-display line for anywhere a quick status is needed.
 */
function computeGoalState(goal, theme) {
  const overdue = daysOverdue(goal);
  const isComplete = goal.status === 'completed';

  switch (theme) {
    case 'lotus':
      // Positive reinforcement: progress never reverses, only slows.
      if (isComplete) return { theme, state: 'bloomed', label: 'Fully bloomed!' };
      return overdue === 0
        ? { theme, state: 'blooming', label: 'Blooming steadily' }
        : { theme, state: 'blooming-slowly', label: 'Still blooming, just a little slower' };

    case 'crow':
      // Urgency: dries up fast if you fall behind.
      if (isComplete) return { theme, state: 'soaring', label: 'Soaring — goal reached!' };
      if (overdue === 0) return { theme, state: 'hydrated', label: 'Hydrated and healthy' };
      return overdue <= 3
        ? { theme, state: 'thirsty', label: 'Getting thirsty — log a contribution soon' }
        : { theme, state: 'parched', label: 'Parched! This needs attention now' };

    case 'cat':
      // Caretaking: responsibility to another being.
      if (isComplete) return { theme, state: 'purring', label: 'Purring contentedly — goal reached!' };
      if (overdue === 0) return { theme, state: 'fed', label: 'Well fed' };
      return overdue <= 5
        ? { theme, state: 'hungry', label: 'Getting hungry — it needs you' }
        : { theme, state: 'neglected', label: 'Feeling neglected' };

    case 'dog':
      // Companionship + streaks: daily small wins.
      if (isComplete) return { theme, state: 'celebrating', label: 'Celebrating — goal reached!' };
      if (overdue === 0) {
        const streak = getCurrentStreak(goal);
        return streak >= 3
          ? { theme, state: 'excited', label: `Excited — ${streak}-contribution streak!` }
          : { theme, state: 'happy', label: 'Happy and on track' };
      }
      return { theme, state: 'whimpering', label: 'Whimpering a little — it misses you' };

    default:
      throw new ValidationError(`Theme must be one of: ${THEMES.join(', ')}`);
  }
}

/**
 * Same idea as computeGoalState, but for the "spend vs budget" mechanic
 * instead of "saving vs schedule" — this is Mindful Money's original loop.
 * Reuses the same theme personalities: Lotus never shames overspending,
 * Crow reacts to it fast, Cat/Dog stubs are ready for a third theme.
 */
function computeBudgetState(budget, theme) {
  const { percentUsed, isOverBudget } = getBudgetProgress(budget);

  switch (theme) {
    case 'lotus':
      return isOverBudget
        ? { theme, state: 'blooming-slowly', label: 'Still blooming, just a little slower this period' }
        : { theme, state: 'blooming', label: 'Blooming steadily' };

    case 'crow':
      if (percentUsed < 70) return { theme, state: 'hydrated', label: 'Hydrated and healthy' };
      return percentUsed <= 100
        ? { theme, state: 'thirsty', label: 'Getting thirsty — nearing this period\u2019s limit' }
        : { theme, state: 'parched', label: 'Parched! Over budget this period' };

    case 'cat':
      if (percentUsed <= 100) return { theme, state: 'fed', label: 'Well fed' };
      return percentUsed <= 130
        ? { theme, state: 'hungry', label: 'Getting hungry — over budget' }
        : { theme, state: 'neglected', label: 'Feeling neglected — significantly over budget' };

    case 'dog':
      return isOverBudget
        ? { theme, state: 'whimpering', label: 'Whimpering a little — over budget this period' }
        : { theme, state: 'happy', label: 'Happy and within budget' };

    default:
      throw new ValidationError(`Theme must be one of: ${THEMES.join(', ')}`);
  }
}

module.exports = {
  THEMES,
  getGlobalTheme,
  setGlobalTheme,
  daysOverdue,
  getCurrentStreak,
  computeGoalState,
  computeBudgetState,
};
