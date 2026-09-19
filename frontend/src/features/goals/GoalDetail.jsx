import { ArrowLeft, Pencil, Plus, Trash2, Check, ImageIcon } from 'lucide-react';
import GoalCover from './GoalCover.jsx';
import ContributionHistory from './ContributionHistory.jsx';
import ContributionSchedule from './ContributionSchedule.jsx';
import { categoryStyle } from '../../../../logic/domain/categories.js';
import { goalProgress } from '../../../../logic/domain/goals.js';
import { money } from '../../../../logic/domain/money.js';
import { formatDate, today } from '../../../../logic/domain/dates.js';
import { nextContribution } from '../../../../logic/domain/schedule.js';

export default function GoalDetail({ goal, onBack, onEdit, onDelete, onContribute }) {
  const progress = goalProgress(goal);
  const next = nextContribution(goal);
  const style = categoryStyle(goal.category);
  return <section>
    <button className="text-button back-button" onClick={onBack}>
      <ArrowLeft size={16} />All goals</button>

    <header className="page-heading detail-heading"><div>
      <span className="eyebrow">{goal.category}</span>
      <h1>{goal.name}</h1></div>

      <div className="heading-actions">
        <button className="button secondary" onClick={onEdit}>
          <Pencil size={15} />Edit goal</button><button className="icon-button 
          delete-button" onClick={onDelete} aria-label="Delete goal"><Trash2 size={18} /></button></div></header>
          
    <div className="detail-grid"><div className="detail-photo">
      <GoalCover goal={goal} showCategory={false} />
      <button className="button photo-edit-button" onClick={onEdit}>
        <ImageIcon size={15} />{goal.photo ? 'Change photo' : 'Add a photo'}</button></div>

      <section className="savings-panel" aria-label="Savings progress">
        <span className="eyebrow">Total saved</span><h2>{money(progress.saved, true)}</h2>
        <p>of {money(goal.targetCents, true)}</p>

        <div className="progress-label">
          <span>{progress.completed ? 'Goal complete' : `${money(progress.remaining, true)} to go`}</span>
          <strong>{progress.percent}%</strong></div>

        <div className="progress-track" 
        role="progressbar" 
        aria-label="Goal progress" 
        ariavaluenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress.percent}%`, background: style.accent }} /></div>

        {next ? <div className="next-box">
          <span>{next.dueDate < today() ? 'Next contribution · overdue' : 'Next contribution'}</span>
          <strong>{formatDate(next.dueDate)} · {money(next.remainingCents, true)}</strong></div> : <div className="next-box complete-note"><Check size={17} />
          <span>You reached your savings goal.</span></div>}

        <button className="button primary full-width" onClick={onContribute}>
          <Plus size={17} />{progress.completed ? 'Add more savings' : 'Log a contribution'}</button>
          
      </section>
    </div>
    <div className="history-grid"><ContributionHistory contributions={goal.contributions} /><ContributionSchedule goal={goal} /></div>
  </section>;
}
