import { Sparkles } from 'lucide-react';
import { artFor } from './scenes.js';
import { useGrowth } from '../../hooks/useGrowth.js';
import { goalProgress } from '../../../../logic/domain/goals.js';
import { journeyStage, themeOf } from '../../../../logic/domain/themes.js';
import { money } from '../../../../logic/domain/money.js';

export default function JourneyCard({ goal, index = 0, onOpen }) {
  const progress = goalProgress(goal);
  const theme = themeOf(goal);
  const { Scene, Icon } = artFor(goal.themeId);
  const [grown, growing] = useGrowth(progress.ratio, { delay: index * 240 });
  const stage = journeyStage(goal.themeId, grown);
  const count = goal.contributions.length;

  return <button className={`journey-card ${progress.completed ? 'is-bloomed' : ''}`} onClick={onOpen}
    style={{ animationDelay: `${index * 90}ms` }}
    aria-label={`Open ${goal.name}. ${theme.name} journey, ${progress.percent}% saved.`}>

    <span className="journey-art">
      <Scene ratio={grown} filling={growing} />
    </span>

    <span className="journey-panel">
      <span className="journey-top">
        <span className="journey-theme">{theme.scene}</span>
        <span className="journey-percent">{Math.round(grown * 100)}<i>%</i></span>
      </span>

      <h2>{goal.name}</h2>

      <span className="journey-stage">
        {progress.completed ? <Sparkles size={13} /> : <Icon size={13} />}{stage.title}</span>
      <span className="journey-line">{stage.line}</span>

      <span className="journey-meter" role="progressbar" aria-label={`${goal.name} progress`}
        aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${Math.max(2, grown * 100)}%` }} />
      </span>

      <span className="journey-stats">
        <span><strong>{money(progress.saved, true)}</strong> of {money(goal.targetCents, true)}</span>
        <span>{count} {count === 1 ? theme.unit.one : theme.unit.many}</span>
      </span>
    </span>
  </button>;
}
