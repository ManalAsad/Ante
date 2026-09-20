// FR-6.4: reject/flag invalid input with a clear message instead of crashing.

const FREQUENCIES = ['daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom'];
const BUDGET_PERIODS = ['weekly', 'monthly', 'yearly'];

class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details || [];
  }
}

function isValidDateString(str) {
  if (typeof str !== 'string') return false;
  const d = new Date(str);
  return !isNaN(d.getTime());
}

function validateGoalInput(input) {
  const errors = [];

  if (!input.name || typeof input.name !== 'string' || !input.name.trim()) {
    errors.push({ field: 'name', message: 'Goal name is required.' });
  }

  if (!input.category || typeof input.category !== 'string' || !input.category.trim()) {
    errors.push({ field: 'category', message: 'Category/theme is required.' });
  }

  if (typeof input.targetAmount !== 'number' || isNaN(input.targetAmount) || input.targetAmount <= 0) {
    errors.push({ field: 'targetAmount', message: 'Target amount must be a number greater than 0.' });
  }

  const startDate = input.startDate || new Date().toISOString().slice(0, 10);
  if (!isValidDateString(startDate)) {
    errors.push({ field: 'startDate', message: 'Start date is invalid.' });
  }

  if (!FREQUENCIES.includes(input.frequency)) {
    errors.push({ field: 'frequency', message: `Frequency must be one of: ${FREQUENCIES.join(', ')}` });
  }

  if (input.frequency === 'custom') {
    if (typeof input.customIntervalDays !== 'number' || input.customIntervalDays <= 0) {
      errors.push({ field: 'customIntervalDays', message: 'Custom interval (in days) must be a number greater than 0.' });
    }
  }

  const hasEndDate = input.endDate !== undefined && input.endDate !== null && input.endDate !== '';
  const hasNumPeriods = input.numPeriods !== undefined && input.numPeriods !== null;

  if (!hasEndDate && !hasNumPeriods) {
    errors.push({ field: 'endDate/numPeriods', message: 'Provide either an end date or a number of contribution periods.' });
  }

  if (hasEndDate && !isValidDateString(input.endDate)) {
    errors.push({ field: 'endDate', message: 'End date is invalid.' });
  }

  if (hasEndDate && isValidDateString(startDate) && isValidDateString(input.endDate)) {
    if (new Date(input.endDate).getTime() <= new Date(startDate).getTime()) {
      errors.push({ field: 'endDate', message: 'End date must be after the start date.' });
    }
  }

  if (hasNumPeriods) {
    if (!Number.isInteger(input.numPeriods) || input.numPeriods <= 0) {
      errors.push({ field: 'numPeriods', message: 'Number of periods must be a positive integer.' });
    }
  }

  return errors;
}

/**
 * FR (Mindful Money) — budget setup: category + target + recurring period.
 */
function validateBudgetInput(input) {
  const errors = [];

  if (!input.category || typeof input.category !== 'string' || !input.category.trim()) {
    errors.push({ field: 'category', message: 'Budget category is required.' });
  }

  if (typeof input.targetAmount !== 'number' || isNaN(input.targetAmount) || input.targetAmount <= 0) {
    errors.push({ field: 'targetAmount', message: 'Target amount must be a number greater than 0.' });
  }

  if (!BUDGET_PERIODS.includes(input.period)) {
    errors.push({ field: 'period', message: `Period must be one of: ${BUDGET_PERIODS.join(', ')}` });
  }

  const startDate = input.startDate || new Date().toISOString().slice(0, 10);
  if (!isValidDateString(startDate)) {
    errors.push({ field: 'startDate', message: 'Start date is invalid.' });
  }

  return errors;
}

/**
 * FR (Mindful Money) — simple manual expense entry against a budget.
 */
function validateExpenseInput(input) {
  const errors = [];

  if (typeof input.amount !== 'number' || isNaN(input.amount) || input.amount <= 0) {
    errors.push({ field: 'amount', message: 'Expense amount must be a number greater than 0.' });
  }

  if (input.date !== undefined && input.date !== null && !isValidDateString(input.date)) {
    errors.push({ field: 'date', message: 'Expense date is invalid.' });
  }

  return errors;
}

module.exports = {
  FREQUENCIES,
  BUDGET_PERIODS,
  ValidationError,
  isValidDateString,
  validateGoalInput,
  validateBudgetInput,
  validateExpenseInput,
};
