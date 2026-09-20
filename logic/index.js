const goalLogic = require('./goalLogic');
const budgetLogic = require('./budgetLogic');
const themes = require('./themes');
const { ValidationError, FREQUENCIES, BUDGET_PERIODS } = require('./validation');
const { DATA_FILE } = require('./dataStore');

module.exports = {
  ...goalLogic,
  ...budgetLogic,
  ...themes,
  ValidationError,
  FREQUENCIES,
  BUDGET_PERIODS,
  DATA_FILE,
};
