import { useId, useRef, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import GoalCover from './GoalCover.jsx';
import { preparePhoto } from '../../utils/preparePhoto.js';

export default function PhotoPicker({ photo, photoPosition, category, onChange, onPositionChange, onBusyChange }) {
  const input = useRef(null);
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function choose(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true); onBusyChange(true); setError('');
    try { onChange(await preparePhoto(file)); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); onBusyChange(false); }

  }
  return <fieldset className="photo-picker">
    <legend>Cover photo <span className="optional">(optional)</span>
    </legend>
    <GoalCover goal={{ name: 'your goal', category, photo, photoPosition }} 
    showCategory={false} className="photo-preview" />

    <input ref={input} id={id} className="sr-only" type="file" tabIndex={-1} 
    accept="image/jpeg,image/png,image/webp" onChange={choose} 
    aria-label="Upload goal photo" disabled={busy} />

    <div className="photo-actions">
      <button type="button" 
      className="button secondary small-button"
       disabled={busy} onClick={() => input.current?.click()}>
        <Upload size={15} />{busy ? 'Preparing photo…' : photo ? 'Change photo' : 'Choose photo'}</button>

      {photo && <button type="button" className="text-button remove-photo" disabled={busy} onClick={() => 
        { onChange(null); setError(''); }}><Trash2 size={14} />Remove</button>}

      <span className="field-help">JPG, PNG, or WebP · up to 10 MB</span></div>

    {photo && <label className="photo-position">Photo position
      <input type="range" min="0" max="100" value={photoPosition} 
      onChange={(event) => 
      onPositionChange(Number(event.target.value))} />
      <span className="field-help">Move the slider to adjust the visible part of your photo.</span></label>}

    <p className="field-help">Choose a photo or a vision board. Your image stays in this browser.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    
  </fieldset>;
}
