export const CATEGORIES = ['Personal', 'Travel', 'Car', 'Education', 'Home', 'Emergency fund', 'Other'];
const styles = {
  Car: { background: '#f4e4da', accent: '#b75b35' },
  Travel: { background: '#dfe9f5', accent: '#356897' },
  Education: { background: '#eae5f2', accent: '#756191' },
  Home: { background: '#e8ecdf', accent: '#6c7e54' },
  'Emergency fund': { background: '#e6ece6', accent: '#527560' },
  Personal: { background: '#f1e8e5', accent: '#9a6c60' },
  Other: { background: '#eceef0', accent: '#68727c' },
};
export const categoryStyle = (category) => styles[category] ?? styles.Other;
