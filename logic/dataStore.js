// FR-0 / FR-6.1 / FR-6.2: local-only persistence, no database, survives restarts.
// Option B from the spec: a single data.json with a goals array, each goal
// containing its own nested schedule + contributions.

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    saveData({ goals: [], budgets: [], settings: { theme: 'lotus' } });
  }
}

function loadData() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse ${DATA_FILE}: ${err.message}`);
  }
  // Migrations for data.json files created before a field existed.
  if (!data.settings) data.settings = { theme: 'lotus' };
  if (!data.budgets) data.budgets = [];
  return data;
}

// Write-to-temp-then-rename so a crash mid-write can't corrupt data.json
// (cheap insurance for a live demo).
function saveData(data) {
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DATA_FILE);
}

module.exports = { DATA_FILE, loadData, saveData };
