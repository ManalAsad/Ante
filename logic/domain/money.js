// Keep all saved amounts as integer cents; format only at the UI boundary.
export const MAX_CENTS = 100_000_000_000;

export function toCents(value) {
  const text = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    throw new Error('Enter a positive amount with no more than two decimal places.');
  }
  const [whole, decimal = ''] = text.split('.');
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > MAX_CENTS) {
    throw new Error('Enter an amount between $0.01 and $1,000,000,000.');
  }
  return cents;
}

export function money(cents, compact = false) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: compact && cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function savedCents(goal) {
  return goal.contributions.reduce((sum, contribution) => sum + contribution.amountCents, 0);
}
