// Plain Node smoke tests — no test framework needed. Run with: npm test
// Safe to run repeatedly: backs up and restores your real data.json.

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.json');
const backup = fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE, 'utf-8') : null;
fs.writeFileSync(DATA_FILE, JSON.stringify({ goals: [] }, null, 2));

const {
  createGoal,
  logContribution,
  editGoal,
  deleteGoal,
  getGoalById,
  getProgress,
  getGlobalTheme,
  setGlobalTheme,
  computeGoalState,
  createBudget,
  logExpense,
  editBudget,
  deleteBudget,
  getBudgetById,
  getBudgetProgress,
  computeBudgetState,
  ValidationError,
} = require('../index');

function run() {
  // Create with numPeriods
  const car = createGoal({
    name: 'Save for a car',
    category: 'car',
    targetAmount: 1000,
    startDate: '2026-09-19',
    frequency: 'monthly',
    numPeriods: 10,
  });
  assert.strictEqual(car.num_periods, 10);
  assert.strictEqual(car.amount_per_period, 100);
  assert.strictEqual(car.schedule.length, 10);
  assert.strictEqual(car.schedule[0].due_date, '2026-10-19');
  console.log('✓ createGoal with numPeriods');

  // Create with endDate instead of numPeriods
  const trip = createGoal({
    name: 'Trip',
    category: 'trip',
    targetAmount: 600,
    startDate: '2026-01-01',
    frequency: 'monthly',
    endDate: '2026-07-01',
  });
  assert.strictEqual(trip.num_periods, 6);
  console.log('✓ createGoal with endDate derives numPeriods');

  // Invalid input throws instead of crashing (FR-6.4)
  assert.throws(
    () => createGoal({ name: '', category: 'car', targetAmount: -5, frequency: 'weekly' }),
    ValidationError
  );
  console.log('✓ invalid input throws ValidationError');

  // Log contribution updates progress + schedule status
  let updated = logContribution(car.id, { amount: 100, date: '2026-10-15' });
  assert.strictEqual(updated.total_saved, 100);
  assert.strictEqual(updated.schedule[0].status, 'paid');
  assert.strictEqual(updated.schedule[1].status, 'pending');
  console.log('✓ logContribution updates total_saved and schedule');

  // Overpayment rolls forward onto future periods (FR-3.3)
  updated = logContribution(car.id, { amount: 250, date: '2026-11-15' });
  assert.strictEqual(updated.total_saved, 350);
  assert.strictEqual(updated.schedule[1].status, 'paid'); // cumulative 200
  assert.strictEqual(updated.schedule[2].status, 'paid'); // cumulative 300
  assert.strictEqual(updated.schedule[3].status, 'pending'); // cumulative 400 > 350
  console.log('✓ overpayment rolls forward onto future periods');

  // Completion (FR-4.3)
  updated = logContribution(car.id, { amount: 650, date: '2026-12-01' });
  assert.strictEqual(updated.total_saved, 1000);
  assert.strictEqual(updated.status, 'completed');
  const progress = getProgress(updated);
  assert.strictEqual(progress.isComplete, true);
  assert.strictEqual(progress.percent, 100);
  console.log('✓ goal completes when total_saved reaches target');

  // Edit goal recalculates schedule (FR-5.1)
  const edited = editGoal(trip.id, { targetAmount: 900, numPeriods: 3 });
  assert.strictEqual(edited.num_periods, 3);
  assert.strictEqual(edited.schedule.length, 3);
  assert.strictEqual(edited.amount_per_period, 300); // 900 remaining / 3
  console.log('✓ editGoal recalculates schedule');

  // Delete goal (FR-5.2)
  const result = deleteGoal(trip.id);
  assert.strictEqual(result.deleted, true);
  assert.throws(() => getGoalById(trip.id));
  console.log('✓ deleteGoal removes the goal');

  // Theme: default + switching
  assert.strictEqual(getGlobalTheme(), 'lotus');
  setGlobalTheme('crow');
  assert.strictEqual(getGlobalTheme(), 'crow');
  assert.throws(() => setGlobalTheme('dragon'), ValidationError);
  console.log('✓ getGlobalTheme/setGlobalTheme');

  // Theme: same goal, two themes, different framing when overdue
  const overdueGoal = createGoal({
    name: 'Overdue test',
    category: 'other',
    targetAmount: 100,
    startDate: '2020-01-01', // far in the past -> guaranteed overdue today
    frequency: 'monthly',
    numPeriods: 2,
  });
  const lotusState = computeGoalState(overdueGoal, 'lotus');
  const crowState = computeGoalState(overdueGoal, 'crow');
  assert.strictEqual(lotusState.state, 'blooming-slowly'); // never punitive
  assert.strictEqual(crowState.state, 'parched'); // urgent framing
  console.log('✓ computeGoalState gives different states per theme on identical data');

  // Budgets: create, log expenses, progress calculation
  const groceries = createBudget({
    category: 'Groceries',
    targetAmount: 400,
    period: 'monthly',
    startDate: '2026-09-01',
  });
  assert.strictEqual(groceries.target_amount, 400);
  assert.strictEqual(groceries.expenses.length, 0);
  console.log('✓ createBudget');

  assert.throws(
    () => createBudget({ category: '', targetAmount: -10, period: 'daily' }),
    ValidationError
  );
  console.log('✓ invalid budget input throws ValidationError');

  logExpense(groceries.id, { amount: 120, date: '2026-09-05', note: 'Trader Joe\'s' });
  let updatedBudget = logExpense(groceries.id, { amount: 90, date: '2026-09-12' });
  let budgetProgress = getBudgetProgress(updatedBudget);
  assert.strictEqual(budgetProgress.spent, 210);
  assert.strictEqual(budgetProgress.remaining, 190);
  assert.strictEqual(budgetProgress.isOverBudget, false);
  console.log('✓ logExpense accumulates spend within the current period');

  // Over budget -> theme states diverge, same as goals
  updatedBudget = logExpense(updatedBudget.id, { amount: 350, date: '2026-09-20' });
  budgetProgress = getBudgetProgress(updatedBudget);
  assert.strictEqual(budgetProgress.spent, 560);
  assert.strictEqual(budgetProgress.isOverBudget, true);
  const budgetLotus = computeBudgetState(updatedBudget, 'lotus');
  const budgetCrow = computeBudgetState(updatedBudget, 'crow');
  assert.strictEqual(budgetLotus.state, 'blooming-slowly'); // never punitive
  assert.strictEqual(budgetCrow.state, 'parched'); // urgent framing
  console.log('✓ computeBudgetState gives different states per theme when over budget');

  // Edit + delete budget
  const editedBudget = editBudget(groceries.id, { targetAmount: 500 });
  assert.strictEqual(editedBudget.target_amount, 500);
  console.log('✓ editBudget');

  const deleteResult = deleteBudget(groceries.id);
  assert.strictEqual(deleteResult.deleted, true);
  assert.throws(() => getBudgetById(groceries.id));
  console.log('✓ deleteBudget');

  console.log('\nAll tests passed.');
}

try {
  run();
} finally {
  if (backup !== null) {
    fs.writeFileSync(DATA_FILE, backup);
  } else if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }
}
