import { goalProgress } from './goals.js';
import { FREQUENCIES } from './schedule.js';
import { themeOf } from './themes.js';

// One row per goal, for opening in a spreadsheet. Amounts are plain decimals
// rather than formatted money so a spreadsheet reads them as numbers.
const COLUMNS = ['Goal', 'Category', 'Theme', 'Target', 'Saved', 'Remaining', 'Progress %', 'Status',
  'Frequency', 'Planned contributions', 'Contributions made', 'Start date', 'Last contribution', 'Created'];

const amount = (cents) => (cents / 100).toFixed(2);

// Anything holding a comma, a quote or a line break has to be quoted, and inner
// quotes are doubled — a goal named `Mum's "car", 2026` still lands in one cell.
function cell(value) {
  const text = value == null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function row(goal) {
  const progress = goalProgress(goal);
  const dates = goal.contributions.map((contribution) => contribution.date).sort();
  return [
    goal.name,
    goal.category,
    themeOf(goal)?.name ?? '',
    amount(goal.targetCents),
    amount(progress.saved),
    amount(progress.remaining),
    progress.percent,
    progress.completed ? 'Completed' : 'In progress',
    FREQUENCIES[goal.frequency] ?? goal.frequency,
    goal.periods,
    goal.contributions.length,
    goal.startDate,
    dates.at(-1) ?? '',
    typeof goal.createdAt === 'string' ? goal.createdAt.slice(0, 10) : '',
  ];
}

export function goalsToCsv(goals) {
  return [COLUMNS, ...goals.map(row)]
    .map((line) => line.map(cell).join(','))
    .join('\r\n') + '\r\n';
}
