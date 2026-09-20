import { goalFromInput, addContribution } from '../domain/goals.js';
import { goalsToCsv } from '../domain/csv.js';

// UI-independent application layer. A future API adapter can replace the repository.
export function createGoalService(repository) {
  const commit = (goals) => { repository.save(goals); return goals; };
  const find = (goals, id) => {
    const goal = goals.find((item) => item.id === id);
    if (!goal) throw new Error('This goal could not be found.');
    return goal;
  };
  return {
    load: () => repository.load(),
    create: (goals, input) => commit([...goals, goalFromInput(input)]),
    update(goals, id, input) {
      const updated = goalFromInput(input, find(goals, id));
      return commit(goals.map((goal) => goal.id === id ? updated : goal));
    },
    contribute(goals, id, input) {
      const updated = addContribution(find(goals, id), input);
      return commit(goals.map((goal) => goal.id === id ? updated : goal));
    },
    remove(goals, id) { find(goals, id); return commit(goals.filter((goal) => goal.id !== id)); },
    replace: (goals) => commit(goals),
    exportCsv: (goals) => goalsToCsv(goals),
  };
}
