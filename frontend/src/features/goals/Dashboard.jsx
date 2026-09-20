import { Plus } from 'lucide-react';
import GoalCard from './GoalCard.jsx';
import { goalProgress } from '../../../../logic/domain/goals.js';

export default function Dashboard({ goals, onCreate, onOpen, onDemo }) {
  const active = goals.filter((goal) => !goalProgress(goal).completed);

  return <>
    <header className="page-heading dashboard-heading"><div>
      <span className="eyebrow">Put something in. Watch it grow.</span>
      <h1>Your Table</h1></div>
      <button className="button primary" onClick={onCreate}>
        <Plus size={17} />New goal</button></header>

    {goals.length === 0 && <div className="empty-intro">
      <h2>Every Player start somewhere.</h2><p>What's your first ante?</p>
      </div>}

    {goals.length > 0 && active.length === 0 && <div className="empty-intro">
      <h2>Table cleared.</h2><p>Ready to play again?</p>
      </div>}

    <section className="goal-grid" aria-label="Savings goals in progress">
      {active.map((goal) =>
      <GoalCard key={goal.id} goal={goal} onOpen={() =>
      onOpen(goal.id)} />)}
      <button className="new-goal-card" onClick={onCreate}>
        <Plus size={25} strokeWidth={1.5} /><span>New goal</span></button>
    </section>
  </>;
}
