// FR-6.3: pre-made example goals with partial progress, so the demo doesn't
// start from an empty dashboard. Run with: npm run seed

const { createGoal, logContribution } = require('./index');

function seed() {
  console.log('Seeding demo data...\n');

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
  logContribution(trip.id, { amount: 300, date: '2026-09-05' });
  console.log(`Created "${trip.name}" — $${trip.total_saved}/$${trip.target_amount}`);

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

  console.log('\nSeed complete. Data written to data.json.');
}

seed();