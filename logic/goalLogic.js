const crypto = require('crypto');
const { loadData, saveData } = require('./dataStore');
const { validateGoalInput, ValidationError, FREQUENCIES } = require('./validation');
const { calculateNumPeriodsFromEndDate, generateSchedule, roundCents } = require('./scheduling');

function generateId() {
  return `goal_${crypto.randomUUID()}`;
}

// FR-2.1: list all goals for the dashboard.
function getGoals() {
  const data = loadData();
  return data.goals;
}

function getGoalById(goalId) {
  const data = loadData();
  const goal = data.goals.find((g) => g.id === goalId);
  if (!goal) {
    throw new Error(`Goal not found: ${goalId}`);
  }
  return goal;
}

/**
 * FR-1.1 to FR-1.4: create a goal, auto-calculate the per-contribution
 * amount, and generate its full schedule.
 *
 * input: {
 *   name, category, targetAmount,
 *   startDate?,            // defaults to today, "YYYY-MM-DD"
 *   frequency,             // one of: daily/weekly/biweekly/monthly/yearly/custom
 *   customIntervalDays?,   // required if frequency === 'custom'
 *   endDate?,              // Approach A option 1: "in 6 months" -> "YYYY-MM-DD"
 *   numPeriods?,           // Approach A option 2: "in 24 contributions"
 * }
 * Provide endDate OR numPeriods, not both required.
 *
 * Throws ValidationError (with .details) on bad input instead of crashing (FR-6.4).
 */
function createGoal(input) {
  const errors = validateGoalInput(input);
  if (errors.length > 0) {
    throw new ValidationError(errors.map((e) => e.message).join(' '), errors);
  }

  const startDate = input.startDate || new Date().toISOString().slice(0, 10);
  const frequency = input.frequency;
  const customIntervalDays = frequency === 'custom' ? input.customIntervalDays : undefined;

  let numPeriods = input.numPeriods;
  if (!numPeriods) {
    numPeriods = calculateNumPeriodsFromEndDate(startDate, input.endDate, frequency, customIntervalDays);
  }

  const amountPerPeriod = roundCents(input.targetAmount / numPeriods);
  const schedule = generateSchedule(startDate, frequency, numPeriods, amountPerPeriod, customIntervalDays);

  const goal = {
    id: generateId(),
    name: input.name.trim(),
    category: input.category.trim(),
    target_amount: roundCents(input.targetAmount),
    total_saved: 0,
    start_date: startDate,
    frequency,
    custom_interval_days: customIntervalDays || null,
    num_periods: numPeriods,
    amount_per_period: amountPerPeriod,
    status: 'active',
    schedule,
    contributions: [],
  };

  const data = loadData();
  data.goals.push(goal);
  saveData(data);

  return goal; // <- show this to the user before final confirm (FR-1.2 preview)
}

/**
 * FR-3.1 / FR-3.2 / FR-3.3: log a contribution against a goal.
 *
 * options: {
 *   amount,   // required, > 0
 *   date?,    // defaults to today, "YYYY-MM-DD"
 *   period?,  // optional, just recorded for reference; doesn't gate anything
 * }
 *
 * Progress rule (FR-3.3, simplified per the spec's own recommendation):
 * total_saved is the single source of truth. A schedule period flips to
 * "paid" once the cumulative scheduled amount up to it is covered by
 * total_saved, in order — so overpaying rolls the surplus forward onto
 * future periods automatically, and underpaying leaves later periods
 * pending even if their date has passed. No manual reconciliation needed.
 */
function logContribution(goalId, options) {
  const { amount, date, period } = options;

  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw new ValidationError('Contribution amount must be a number greater than 0.');
  }

  const data = loadData();
  const goal = data.goals.find((g) => g.id === goalId);
  if (!goal) {
    throw new Error(`Goal not found: ${goalId}`);
  }

  const contribution = {
    date: date || new Date().toISOString().slice(0, 10),
    amount: roundCents(amount),
  };
  if (period) contribution.period = period;

  goal.contributions.push(contribution);
  goal.total_saved = roundCents(goal.total_saved + contribution.amount);

  applyProgressToSchedule(goal);

  if (goal.total_saved >= goal.target_amount && goal.status !== 'completed') {
    goal.status = 'completed'; // FR-4.3: drives the celebration screen on Person C's side
  }

  saveData(data);
  return goal;
}

function applyProgressToSchedule(goal) {
  let cumulativeDue = 0;
  for (const period of goal.schedule) {
    cumulativeDue = roundCents(cumulativeDue + period.amount);
    period.status = goal.total_saved >= cumulativeDue ? 'paid' : 'pending';
  }
}

// FR-2.1 / FR-3.1 / FR-4.4: "next contribution due" everywhere it's needed.
function getNextPendingPeriod(goal) {
  return goal.schedule.find((p) => p.status === 'pending') || null;
}

/**
 * FR-5.1: edit a goal. Changing target amount / frequency / custom interval /
 * numPeriods regenerates the schedule from scratch (per the spec's own
 * "simplest for hackathon scope" recommendation) for the *remaining*
 * amount, starting today, over the (possibly new) number of periods.
 *
 * updates: { name?, targetAmount?, frequency?, customIntervalDays?, numPeriods? }
 */
function editGoal(goalId, updates) {
  const data = loadData();
  const goal = data.goals.find((g) => g.id === goalId);
  if (!goal) {
    throw new Error(`Goal not found: ${goalId}`);
  }

  if (updates.name !== undefined) {
    if (!updates.name.trim()) throw new ValidationError('Goal name cannot be empty.');
    goal.name = updates.name.trim();
  }

  const changingScheduleShape =
    updates.targetAmount !== undefined ||
    updates.frequency !== undefined ||
    updates.customIntervalDays !== undefined ||
    updates.numPeriods !== undefined;

  if (updates.targetAmount !== undefined) {
    if (typeof updates.targetAmount !== 'number' || updates.targetAmount <= 0) {
      throw new ValidationError('Target amount must be a number greater than 0.');
    }
    goal.target_amount = roundCents(updates.targetAmount);
  }

  if (updates.frequency !== undefined) {
    if (!FREQUENCIES.includes(updates.frequency)) {
      throw new ValidationError(`Frequency must be one of: ${FREQUENCIES.join(', ')}`);
    }
    goal.frequency = updates.frequency;
  }

  if (updates.customIntervalDays !== undefined) {
    goal.custom_interval_days = updates.customIntervalDays;
  }

  if (changingScheduleShape) {
    const remaining = Math.max(roundCents(goal.target_amount - goal.total_saved), 0);
    const numPeriods = updates.numPeriods || goal.num_periods;
    const today = new Date().toISOString().slice(0, 10);

    goal.num_periods = numPeriods;
    goal.amount_per_period = numPeriods > 0 ? roundCents(remaining / numPeriods) : 0;
    goal.schedule = generateSchedule(
      today,
      goal.frequency,
      numPeriods,
      goal.amount_per_period,
      goal.custom_interval_days
    );
    applyProgressToSchedule(goal); // in case total_saved already covers some new periods
  }

  saveData(data);
  return goal;
}

/**
 * FR-5.2: delete a goal. The confirmation dialog is Person B's UI
 * responsibility — this just performs the deletion once confirmed.
 */
function deleteGoal(goalId) {
  const data = loadData();
  const index = data.goals.findIndex((g) => g.id === goalId);
  if (index === -1) {
    throw new Error(`Goal not found: ${goalId}`);
  }
  data.goals.splice(index, 1);
  saveData(data);
  return { deleted: true, id: goalId };
}

/**
 * Convenience helper for Person B/C: everything the UI usually needs
 * derived from a goal in one call.
 */
function getProgress(goal) {
  const percent = goal.target_amount > 0
    ? Math.min(100, Math.round((goal.total_saved / goal.target_amount) * 1000) / 10)
    : 0;
  return {
    totalSaved: goal.total_saved,
    targetAmount: goal.target_amount,
    percent,
    nextPeriod: getNextPendingPeriod(goal),
    isComplete: goal.total_saved >= goal.target_amount,
  };
}

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  logContribution,
  editGoal,
  deleteGoal,
  getNextPendingPeriod,
  getProgress,
};
