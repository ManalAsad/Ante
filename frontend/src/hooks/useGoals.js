import { useState } from 'react';
import { createGoalRepository } from '../../../logic/repositories/goalRepository.js';
import { createGoalService } from '../../../logic/services/goalService.js';
//import { createDemoGoals } from '../../../logic/data/demoGoals.js';

const service = createGoalService(createGoalRepository());
export function useGoals() {
  const [state, setState] = useState(() => {
    try { return { goals: service.load(), loadError: '' }; }
    catch { return { goals: [], loadError: 'Your saved data could not be read. Download a backup before resetting or restoring it.' }; }
  });
  const apply = (operation) => {
    if (state.loadError) throw new Error(state.loadError);
    setState({ goals: operation(), loadError: '' });
  };
  return { ...state,
    create: (input) => apply(() => service.create(state.goals, input)),
    update: (id, input) => apply(() => service.update(state.goals, id, input)),
    contribute: (id, input) => apply(() => service.contribute(state.goals, id, input)),
    remove: (id) => apply(() => service.remove(state.goals, id)),
    seed: () => apply(() => service.replace([...state.goals, ...createDemoGoals()])),
    importBackup: (raw) => setState({ goals: service.import(raw), loadError: '' }),
    reset: () => setState({ goals: service.replace([]), loadError: '' }),
    exportBackup: () => {
      const url = URL.createObjectURL(new Blob([service.export()], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url; link.download = `bloom-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
  };
}
