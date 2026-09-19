import { Check } from 'lucide-react';
import { money } from '../../../../logic/domain/money.js';
import { formatDate } from '../../../../logic/domain/dates.js';
import { fundedSchedule } from '../../../../logic/domain/schedule.js';

export default function ContributionSchedule({ goal }) {
  return <section className="history-panel">
    <div className="section-heading">
      <h2>Savings schedule</h2>
      <span>{goal.periods} contributions</span>
    </div>
    <div className="schedule-list" tabIndex="0" aria-label="Contribution schedule">
      {fundedSchedule(goal).map((item) => (
        <div className="schedule-row" key={item.period}>
          <span className={`schedule-status ${item.status}`}>
            {item.status === 'paid' ? <Check size={14} /> : item.period}
          </span>
          <div>
            <strong>{formatDate(item.dueDate, true)}</strong>
            <small>
              {item.status === 'paid' ? 'Funded' : item.status === 'partial' ? `${money(item.remainingCents)} remaining` : 'Planned'}
            </small>
          </div>
          <span>{money(item.amountCents)}</span>
        </div>
      ))}
    </div>
  </section>;
}
