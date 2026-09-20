import { Trophy } from 'lucide-react';
import GoalCard from './GoalCard.jsx';
import { goalProgress } from '../../../../logic/domain/goals.js';
import { money } from '../../../../logic/domain/money.js';

export default function Completed({ goals, onOpen, onHome }) {
  const done = goals.filter((goal) => goalProgress(goal).completed);
  const total = done.reduce((sum, goal) => sum + goalProgress(goal).saved, 0);
  // When nothing has landed here yet, say how close the nearest goal is, so an
  // empty page reads as "not finished" rather than "something is broken".
  const closest = goals.filter((goal) => !goalProgress(goal).completed)
    .sort((a, b) => goalProgress(b).ratio - goalProgress(a).ratio)[0];

  return <>
    <header className="page-heading"><div>
      <span className="eyebrow">Finished</span>
      <h1>Completed goals</h1></div>
      {done.length > 0 && <div className="completed-total">
        <strong>{money(total, true)}</strong><span>saved across {done.length} {done.length === 1 ? 'goal' : 'goals'}</span>
      </div>}</header>

    {done.length === 0 ? <div className="empty-intro">
      <h2>Nothing finished yet</h2>
      <p>{closest
        ? <>A goal moves here on its own once its full target is saved. Closest so far is
          <strong> {closest.name}</strong> at {goalProgress(closest).percent}% — {money(goalProgress(closest).remaining, true)} to go.</>
        : 'Goals move here on their own once you have saved the full target.'}</p>
      <button className="button secondary" onClick={onHome}>Back to my goals</button>
    </div> : <section className="goal-grid" aria-label="Completed goals">
      {done.map((goal) => <GoalCard key={goal.id} goal={goal} muted onOpen={() => onOpen(goal.id)} />)}
    </section>}

    {done.length > 0 && <p className="field-help completed-note">
      <Trophy size={13} /> Reached in full. Open one to look back at how you got there.</p>}
  </>;
}
