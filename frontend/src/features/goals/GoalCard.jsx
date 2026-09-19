import { Check } from 'lucide-react';
import GoalCover from './GoalCover.jsx';
import { categoryStyle } from '../../../../logic/domain/categories.js';
import { goalProgress } from '../../../../logic/domain/goals.js';
import { money } from '../../../../logic/domain/money.js';
import { nextContribution } from '../../../../logic/domain/schedule.js';
import { formatDate } from '../../../../logic/domain/dates.js';

export default function GoalCard({ goal, onOpen }) {
  const progress = goalProgress(goal);
  const next = nextContribution(goal);
  const style = categoryStyle(goal.category);
  return <button className="goal-card" onClick={onOpen} aria-label={`Open ${goal.name}, ${progress.percent}% saved`}>
    <GoalCover goal={goal} />
    <div className="card-body">
      <h2>{goal.name}</h2>
      <div className="card-amount">
        <span><strong>{money(progress.saved, true)}</strong>
        <span> of {money(goal.targetCents, true)}</span></span>
        <span>{progress.percent}%</span></div>

      <div className="progress-track" role="progressbar" aria-label={`${goal.name} progress`} 
      aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${progress.percent}%`, background: style.accent }} /></div>

      <div className="card-next">{next ? <>
      <span>Next contribution</span><strong>{formatDate(next.dueDate)} · {money(next.remainingCents, true)}</strong></> : 
      <><span>Goal complete</span><strong><Check size={14} />{money(progress.saved, true)} saved</strong></>}</div>
    </div>
  </button>;
}
