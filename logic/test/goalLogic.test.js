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
  ValidationError,
} = require('../index');

function run() {
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

  assert.throws(
    () => createGoal({ name: '', category: 'car', targetAmount: -5, frequency: 'weekly' }),
    ValidationError
  );
  console.log('✓ invalid input throws ValidationError');

  let updated = logContribution(car.id, { amount: 100, date: '2026-10-15' });
  assert.strictEqual(updated.total_saved, 100);
  assert.strictEqual(updated.schedule[0].status, 'paid');
  assert.strictEqual(updated.schedule[1].status, 'pending');
  console.log('✓ logContribution updates total_saved and schedule');

  updated = logContribution(car.id, { amount: 250, date: '2026-11-15' });
  assert.strictEqual(updated.total_saved, 350);
  assert.strictEqual(updated.schedule[1].status, 'paid');
  assert.strictEqual(updated.schedule[2].status, 'paid');
  assert.strictEqual(updated.schedule[3].status, 'pending');
  console.log('✓ overpayment rolls forward onto future periods');

  updated = logContribution(car.id, { amount: 650, date: '2026-12-01' });
  assert.strictEqual(updated.total_saved, 1000);
  assert.strictEqual(updated.status, 'completed');
  const progress = getProgress(updated);
  assert.strictEqual(progress.isComplete, true);
  assert.strictEqual(progress.percent, 100);
  console.log('✓ goal completes when total_saved reaches target');

  const edited = editGoal(trip.id, { targetAmount: 900, numPeriods: 3 });
  assert.strictEqual(edited.num_periods, 3);
  assert.strictEqual(edited.schedule.length, 3);
  assert.strictEqual(edited.amount_per_period, 300);
  console.log('✓ editGoal recalculates schedule');

  const result = deleteGoal(trip.id);
  assert.strictEqual(result.deleted, true);
  assert.throws(() => getGoalById(trip.id));
  console.log('✓ deleteGoal removes the goal');

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