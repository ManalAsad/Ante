import { useEffect, useState } from 'react';

function readRoute() {
  const match = window.location.hash.match(/^#\/goals\/([^/]+)$/);
  try { return match ? decodeURIComponent(match[1]) : null; }
  catch { return null; }
}

export function useGoalRoute() {
  const [goalId, setGoalId] = useState(readRoute);
  useEffect(() => {
    const update = () => { setGoalId(readRoute()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return { goalId, openGoal: (id) => { window.location.hash = `/goals/${encodeURIComponent(id)}`; },
    goHome: () => { window.location.hash = '/'; } };
}
