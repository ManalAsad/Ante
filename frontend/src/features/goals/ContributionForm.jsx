import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../../components/Modal.jsx';
import { today, formatDate } from '../../../../logic/domain/dates.js';
import { money } from '../../../../logic/domain/money.js';
import { fundedSchedule, nextContribution } from '../../../../logic/domain/schedule.js';

export default function ContributionForm({ goal, onSave, onClose }) {

  const next = nextContribution(goal);
  const [amount, setAmount] = useState(next ? (next.remainingCents / 100).toFixed(2) : '');
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  const [scheduledPeriod, setPeriod] = useState(next?.period ?? 1);
  const [error, setError] = useState('');

  return <Modal title="Log a contribution" subtitle={goal.name} onClose={onClose}>
    <form className="goal-form" onSubmit={(event) => {

      event.preventDefault(); 
      try { onSave({ amount, date, note, scheduledPeriod }); } 
      catch (err) { setError(err.message); }

    }}>
      <label>Amount saved ($)
        <input autoFocus type="number" 
        min="0.01" max="1000000000" 
        step="0.01" required value={amount} 
        onChange={(event) => setAmount(event.target.value)} /></label>

      <label>Date saved<input type="date" 
      required min={goal.startDate} 
      max={today()} value={date} 
      onChange={(event) => setDate(event.target.value)} /></label>

      <label>Planned contribution<select value={scheduledPeriod} 
      onChange={(event) => setPeriod(event.target.value)}>

        {fundedSchedule(goal).map((item) => <option key={item.period} 
        value={item.period}>#{item.period}·{formatDate(item.dueDate)}·{money(item.amountCents)}
        {item.status === 'paid' ? ' · Funded' : ''}</option>)}
      </select></label>

      <p className="field-help">Save more or less—it all counts. Your total savings fund
        the earliest installments first; this selection is a note for your history.</p>

      <label>Note <span className="optional">(optional)</span>
      <input maxLength={160} placeholder="e.g. Weekly savings" 
      value={note} onChange={(event) => setNote(event.target.value)} /></label>

      <p className="field-help">This records money you’ve saved yourself. No money is transferred.</p>

      {error && <p role="alert" className="form-error">{error}</p>}

      <footer className="form-footer">
        <button type="button" className="button secondary" 
        onClick={onClose}>Cancel</button>
        <button className="button primary" type="submit">
          <Plus size={17} />Log contribution</button></footer>
    </form>
  </Modal>;
}
