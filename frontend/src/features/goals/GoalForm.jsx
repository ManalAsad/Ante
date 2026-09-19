import { useState } from 'react';
import Modal from '../../components/Modal.jsx';
import PhotoPicker from './PhotoPicker.jsx';
import { today, formatDate } from '../../../../logic/domain/dates.js';
import { money, toCents } from '../../../../logic/domain/money.js';
import { FREQUENCIES, buildSchedule } from '../../../../logic/domain/schedule.js';
import { CATEGORIES } from '../../../../logic/domain/categories.js';

export default function GoalForm({ goal, onSave, onClose }) {
  const [values, setValues] = useState({ name: goal?.name ?? '', category: goal?.category ?? 'Personal',
    targetAmount: goal ? (goal.targetCents / 100).toFixed(2) : '', photo: goal?.photo ?? null, photoPosition: goal?.photoPosition ?? 50,
    startDate: goal?.startDate ?? today(), frequency: goal?.frequency ?? 'weekly', periods: goal?.periods ?? 12,
    customDays: goal?.customDays ?? 10 });

  const [error, setError] = useState('');

  const [photoBusy, setPhotoBusy] = useState(false);

  const field = (name) => ({ name, value: values[name], 
    onChange: (event) => 
      setValues({ ...values, [name]: event.target.value }) });

  let preview = null;

  try {
    const periods = Number(values.periods);
    if (periods > 0 && periods <= 600 && Number.isInteger(periods)) {
      const schedule = buildSchedule({ ...values, targetCents: toCents(values.targetAmount), periods, customDays: Number(values.customDays) });
      preview = { amount: schedule[0].amountCents, endDate: schedule.at(-1).dueDate };
    }

  } catch { /* A preview appears as soon as valid amounts and dates are entered. */ }
  const submit = (event) => {
    event.preventDefault();
    if (photoBusy) return;
    try { onSave(values); } catch (err) { setError(err.message); }
  };
  return <Modal title={goal ? 'Edit goal' : 'Create a new goal'} 
  subtitle={goal ? 'Update your photo or plan. Your savings stay with you.' : 'Make room for something you’re looking forward to.'} onClose={onClose} wide>

    <form onSubmit={submit} className="goal-form">
      <label>What are you saving for?
        <input {...field('name')} autoFocus placeholder="e.g. My next big adventure" maxLength={80} required /></label>

      <div className="form-grid">
        <label>Target amount ($)
          <input {...field('targetAmount')} type="number" min="0.01" max="1000000000" step="0.01" placeholder="1,200" required /></label>

        <label>Category
          <select {...field('category')}>{CATEGORIES.map((category) => 
            <option key={category}>{category}</option>)}</select></label></div>

      <PhotoPicker photo={values.photo} 
      photoPosition={values.photoPosition} 
      category={values.category}
        onChange={(photo) => 
          setValues((current) => 
            ({ ...current, photo, photoPosition: 50 }))}
        onPositionChange={(photoPosition) => 
        setValues((current) => ({ ...current, photoPosition }))} 
        onBusyChange={setPhotoBusy} />

      <div className="form-grid">
        <label>Start date<input {...field('startDate')} type="date" min="1900-01-01" max="2200-12-31" required /></label>

        <label>Save how often?<select {...field('frequency')}>
          {Object.entries(FREQUENCIES).map(([id, label]) => 
          <option key={id} value={id}>{label}</option>)}</select></label>

        <label>Number of contributions<input {...field('periods')} type="number" min="1" max="600" step="1" required /></label>

        {values.frequency === 'custom' && <label>Days between contributions
          <input {...field('customDays')} type="number" min="1" max="365" step="1" required /></label>}
      </div>

      {preview && <div className="schedule-preview">
        <span>YOUR SAVINGS PLAN</span>
        <strong>About {money(preview.amount)} each contribution</strong>
        <p>First payment one interval after your start date. Finish by {formatDate(preview.endDate, true)}.</p></div>}

      {goal && <p className="field-help">Editing the plan rebuilds its schedule 
        from the start date. Existing savings cover the earliest installments first.</p>}

      {error && <p role="alert" className="form-error">{error}</p>}
      <footer className="form-footer">
        <button type="button" className="button secondary" 
        onClick={onClose}>Cancel</button><button className="button primary"
         type="submit" disabled={photoBusy}>{goal ? 'Save changes' : 'Create goal'}</button></footer>
         
    </form>
  </Modal>;
}
