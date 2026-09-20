// FR-6.3: pre-made example goals with partial progress, so the demo doesn't
// start from an empty dashboard. Run with: npm run seed

const { createGoal, logContribution, getGoalById, createBudget, logExpense, setGlobalTheme, computeGoalState, computeBudgetState } = require('./index');

function seed() {
  console.log('Seeding demo data...\n');

  // Goal 1: Car — monthly, partially funded (matches the spec's own example)
  const car = createGoal({
    name: 'Save for a car',
    category: 'car',
    targetAmount: 1000,
    startDate: '2026-09-19',
    frequency: 'monthly',
    numPeriods: 10,
  });
  logContribution(car.id, { amount: 200, date: '2026-10-15' });
  logContribution(car.id, { amount: 200, date: '2026-11-18' });
  console.log(`Created "${car.name}" — $${car.total_saved}/$${car.target_amount}`);

  // Goal 2: Trip — weekly, demonstrates overpayment rolling forward
  const trip = createGoal({
    name: 'Japan trip',
    category: 'trip',
    targetAmount: 1500,
    startDate: '2026-08-01',
    frequency: 'weekly',
    numPeriods: 20,
  });
  logContribution(trip.id, { amount: 75, date: '2026-08-08' });
  logContribution(trip.id, { amount: 75, date: '2026-08-15' });
  logContribution(trip.id, { amount: 75, date: '2026-08-22' });
  logContribution(trip.id, { amount: 300, date: '2026-09-05' }); // overpayment
  console.log(`Created "${trip.name}" — $${trip.total_saved}/$${trip.target_amount}`);

  // Goal 3: near-complete, so it's easy to trigger the celebration screen live
  const laptop = createGoal({
    name: 'New laptop',
    category: 'other',
    targetAmount: 500,
    startDate: '2026-08-01',
    frequency: 'biweekly',
    numPeriods: 5,
  });
  logContribution(laptop.id, { amount: 450, date: '2026-09-01' });
  console.log(
    `Created "${laptop.name}" — $${laptop.total_saved}/$${laptop.target_amount} ` +
    `(log ~$50 more live in the demo to trigger completion)`
  );

  // A goal that's currently behind schedule — this is the one to switch
  // themes on live during the demo, since it's where Lotus and Crow
  // visibly disagree about how to react to the exact same data.
  const overdue = createGoal({
    name: 'Emergency fund',
    category: 'other',
    targetAmount: 300,
    startDate: '2026-01-01',
    frequency: 'monthly',
    numPeriods: 6,
  });
  logContribution(overdue.id, { amount: 50, date: '2026-02-01' }); // one payment, then fell behind
  const updatedOverdue = getGoalById(overdue.id);
  console.log(`Created "${overdue.name}" — deliberately behind schedule for the theme-contrast demo`);

  setGlobalTheme('lotus');
  console.log('\nDefault theme set to "lotus".');
  console.log(`  Under lotus: ${computeGoalState(updatedOverdue, 'lotus').label}`);
  console.log(`  Under crow:  ${computeGoalState(updatedOverdue, 'crow').label}`);
  console.log('  (call setGlobalTheme("crow") to see the app actually switch)');

  // Budgets (Mindful Money's original loop): one under budget, one over —
  // another good pair for the theme-switch demo.
  const groceries = createBudget({
    category: 'Groceries',
    targetAmount: 400,
    period: 'monthly',
    startDate: '2026-09-01',
  });
  logExpense(groceries.id, { amount: 120, date: '2026-09-05', note: 'Weekly shop' });
  logExpense(groceries.id, { amount: 90, date: '2026-09-12', note: 'Weekly shop' });
  console.log(`\nCreated budget "${groceries.category}" — under budget so far`);

  const dining = createBudget({
    category: 'Dining out',
    targetAmount: 150,
    period: 'monthly',
    startDate: '2026-09-01',
  });
  logExpense(dining.id, { amount: 80, date: '2026-09-03' });
  const updatedDining = logExpense(dining.id, { amount: 95, date: '2026-09-14' });
  console.log(`Created budget "${dining.category}" — deliberately over budget`);
  console.log(`  Under lotus: ${computeBudgetState(updatedDining, 'lotus').label}`);
  console.log(`  Under crow:  ${computeBudgetState(updatedDining, 'crow').label}`);

  console.log('\nSeed complete. Data written to data.json.');
}

seed();
