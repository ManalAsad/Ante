import { useEffect, useState } from 'react';

const HOME = { view: 'home', goalId: null };

function readRoute() {
  const hash = window.location.hash;
  if (hash === '#/journey') return { view: 'journey', goalId: null };
  if (hash === '#/completed') return { view: 'completed', goalId: null };
  const match = hash.match(/^#\/goals\/([^/]+)$/);
  try { return match ? { view: 'goal', goalId: decodeURIComponent(match[1]) } : HOME; }
  catch { return HOME; }
}

export function useGoalRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const update = () => { setRoute(readRoute()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return { ...route, openGoal: (id) => { window.location.hash = `/goals/${encodeURIComponent(id)}`; },
    goHome: () => { window.location.hash = '/'; },
    goJourney: () => { window.location.hash = '/journey'; },
    goCompleted: () => { window.location.hash = '/completed'; } };
}
