const goalLogic = require('./goalLogic');
const { ValidationError, FREQUENCIES } = require('./validation');
const { DATA_FILE } = require('./dataStore');

module.exports = {
  ...goalLogic,
  ValidationError,
  FREQUENCIES,
  DATA_FILE,
};