// Mindful Money's original MVP loop: recurring budget targets by category,
// with manual expense entry tracked against them. This is a different
// mechanic from goals (ongoing spend-vs-budget, not saving toward a fixed
// target), so it lives alongside goalLogic.js rather than inside it.

const crypto = require('crypto');
const { loadData, saveData } = require('./dataStore');
const { validateBudgetInput, validateExpenseInput, ValidationError, BUDGET_PERIODS } = require('./validation');
const { addInterval, toDate, roundCents } = require('./scheduling');

function generateBudgetId() {
  return `budget_${crypto.randomUUID()}`;
}

function generateExpenseId() {
  return `expense_${crypto.randomUUID()}`;
}

// For the dashboard's budget list.
function getBudgets() {
  const data = loadData();
  return data.budgets;
}

function getBudgetById(budgetId) {
  const data = loadData();
  const budget = data.budgets.find((b) => b.id === budgetId);
  if (!budget) {
    throw new Error(`Budget not found: ${budgetId}`);
  }
  return budget;
}

/**
 * input: { category, targetAmount, period, startDate? }
 * period: 'weekly' | 'monthly' | 'yearly'
 *
 * Throws ValidationError on bad input instead of crashing.
 */
function createBudget(input) {
  const errors = validateBudgetInput(input);
  if (errors.length > 0) {
    throw new ValidationError(errors.map((e) => e.message).join(' '), errors);
  }

  const startDate = input.startDate || new Date().toISOString().slice(0, 10);

  const budget = {
    id: generateBudgetId(),
    category: input.category.trim(),
    target_amount: roundCents(input.targetAmount),
    period: input.period,
    period_start_date: startDate, // fixed anchor date; the *current* period is
                                   // recomputed from this each time rather than
                                   // stored, the same way goal "overdue" status
                                   // is derived rather than persisted
    expenses: [],
  };

  const data = loadData();
  data.budgets.push(budget);
  saveData(data);
  return budget;
}

/**
 * Walks forward from the budget's anchor date in period-sized steps until
 * it finds the window that contains today. Recomputing this on every call
 * means budgets never need a background job to "roll over" — the current
 * period is just whatever the math says right now.
 */
function getCurrentPeriodBounds(budget) {
  const anchor = toDate(budget.period_start_date);
  const today = toDate(new Date().toISOString().slice(0, 10));

  let periodStart = new Date(anchor);
  let periodEnd = addInterval(periodStart, budget.period);

  const MAX_ITER = 10000; // safety cap
  let i = 0;
  while (periodEnd.getTime() <= today.getTime() && i < MAX_ITER) {
    periodStart = periodEnd;
    periodEnd = addInterval(periodStart, budget.period);
    i += 1;
  }

  return { periodStart, periodEnd };
}

/**
 * Everything the UI needs for one budget: how much of the current period's
 * target has been spent, based only on expenses that fall inside the
 * current period window.
 */
function getBudgetProgress(budget) {
  const { periodStart, periodEnd } = getCurrentPeriodBounds(budget);

  const spent = roundCents(
    budget.expenses
      .filter((e) => {
        const d = toDate(e.date);
        return d.getTime() >= periodStart.getTime() && d.getTime() < periodEnd.getTime();
      })
      .reduce((sum, e) => sum + e.amount, 0)
  );

  const target = budget.target_amount;
  const remaining = roundCents(target - spent);
  const percentUsed = target > 0 ? Math.round((spent / target) * 1000) / 10 : 0;

  return {
    periodStart: periodStart.toISOString().slice(0, 10),
    periodEnd: periodEnd.toISOString().slice(0, 10),
    spent,
    target,
    remaining,
    percentUsed,
    isOverBudget: spent > target,
  };
}

/**
 * Manual expense entry (FR: "simple expense logging").
 * options: { amount, date?, note? }
 */
function logExpense(budgetId, options) {
  const errors = validateExpenseInput(options);
  if (errors.length > 0) {
    throw new ValidationError(errors.map((e) => e.message).join(' '), errors);
  }

  const data = loadData();
  const budget = data.budgets.find((b) => b.id === budgetId);
  if (!budget) {
    throw new Error(`Budget not found: ${budgetId}`);
  }

  const expense = {
    id: generateExpenseId(),
    date: options.date || new Date().toISOString().slice(0, 10),
    amount: roundCents(options.amount),
    note: options.note ? String(options.note).trim() : '',
  };

  budget.expenses.push(expense);
  saveData(data);
  return budget;
}

function editBudget(budgetId, updates) {
  const data = loadData();
  const budget = data.budgets.find((b) => b.id === budgetId);
  if (!budget) {
    throw new Error(`Budget not found: ${budgetId}`);
  }

  if (updates.category !== undefined) {
    if (!updates.category.trim()) throw new ValidationError('Category cannot be empty.');
    budget.category = updates.category.trim();
  }

  if (updates.targetAmount !== undefined) {
    if (typeof updates.targetAmount !== 'number' || updates.targetAmount <= 0) {
      throw new ValidationError('Target amount must be a number greater than 0.');
    }
    budget.target_amount = roundCents(updates.targetAmount);
  }

  if (updates.period !== undefined) {
    if (!BUDGET_PERIODS.includes(updates.period)) {
      throw new ValidationError(`Period must be one of: ${BUDGET_PERIODS.join(', ')}`);
    }
    budget.period = updates.period;
  }

  saveData(data);
  return budget;
}

function deleteBudget(budgetId) {
  const data = loadData();
  const index = data.budgets.findIndex((b) => b.id === budgetId);
  if (index === -1) {
    throw new Error(`Budget not found: ${budgetId}`);
  }
  data.budgets.splice(index, 1);
  saveData(data);
  return { deleted: true, id: budgetId };
}

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  logExpense,
  editBudget,
  deleteBudget,
  getBudgetProgress,
  getCurrentPeriodBounds,
};
