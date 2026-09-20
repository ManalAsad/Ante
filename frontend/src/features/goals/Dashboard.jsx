import { Plus } from 'lucide-react';
import GoalCard from './GoalCard.jsx';
import { goalProgress } from '../../../../logic/domain/goals.js';

export default function Dashboard({ goals, onCreate, onOpen, onDemo }) {
  const active = goals.filter((goal) => !goalProgress(goal).completed);

  return <>
    <header className="page-heading dashboard-heading"><div>
      <span className="eyebrow">Savings</span>
      <h1>Bloom</h1></div>
      <button className="button primary" onClick={onCreate}>
        <Plus size={17} />New goal</button></header>

    {goals.length === 0 && <div className="empty-intro">
      <h2>What are you saving for?</h2><p>Add a goal, choose a photo, and start making progress.</p>
      <button className="text-button" onClick={onDemo}>Try sample goals</button>
      </div>}

    {goals.length > 0 && active.length === 0 && <div className="empty-intro">
      <h2>Every goal is finished</h2><p>Nothing left in progress. Start something new, or open Completed in the sidebar to look back.</p>
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
