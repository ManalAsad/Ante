import { Plus } from 'lucide-react';
import { money } from '../../../../logic/domain/money.js';
import { formatDate } from '../../../../logic/domain/dates.js';

export default function ContributionHistory({ contributions }) {

  return <section className="history-panel">
    <div className="section-heading">
      <h2>Contribution history</h2>
      <span>{contributions.length} {contributions.length === 1 ? 'contribution' : 'contributions'}</span></div>

    {contributions.length === 0 ? <p className="history-empty">Your contributions will appear here.</p> :

      <ul className="history-list">{[...contributions].reverse().map((item) => 
      <li key={item.id}><span className="history-icon"><Plus size={16} />
      </span><div><strong>{item.note || 'Contribution'}</strong><small>{formatDate(item.date, true)}</small>
      </div><b>+{money(item.amountCents)}</b></li>)}</ul>}
      
  </section>;
}
