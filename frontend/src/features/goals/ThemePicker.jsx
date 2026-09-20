import { Check } from 'lucide-react';
import { artFor } from '../journey/scenes.js';
import { THEMES, THEME_IDS } from '../../../../logic/domain/themes.js';

export default function ThemePicker({ themeId, onChange }) {
  const option = (id, title, blurb, preview) => {
    const active = themeId === id;
    return <button key={id ?? 'none'} type="button" aria-pressed={active}
      className={`theme-option ${active ? 'is-active' : ''}`} onClick={() => onChange(id)}>
      <span className="theme-thumb">{preview}</span>
      <span className="theme-copy">
        <strong>{title}{active && <Check size={14} />}</strong>
        <span>{blurb}</span>
      </span>
    </button>;
  };

  return <fieldset className="theme-picker">
    <legend>Journey theme <span className="optional">Optional</span></legend>
    <p className="field-help">A theme gives this goal a scene on the Journey tab that grows with every contribution.</p>

    <div className="theme-options">
      {THEME_IDS.map((id) => {
        const { Scene } = artFor(id);
        return option(id, THEMES[id].name, THEMES[id].blurb, <Scene ratio={0.9} still />);
      })}
      {option(null, 'No theme', 'Keep this goal to the dashboard only.',
        <span className="theme-thumb-plain" />)}
    </div>
  </fieldset>;
}
