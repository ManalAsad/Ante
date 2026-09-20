import { Sparkles } from 'lucide-react';
import JourneyCard from './JourneyCard.jsx';
import { artFor } from './scenes.js';
import { goalProgress } from '../../../../logic/domain/goals.js';
import { themeOf } from '../../../../logic/domain/themes.js';

export default function BloomedJourneys({ goals, onOpen, onJourney }) {
  const journeys = goals.filter(themeOf);
  const done = journeys.filter((goal) => goalProgress(goal).completed);
  // With nothing finished yet, point at the journey that is furthest along so the
  // page reads as "still growing" rather than empty for no reason.
  const closest = journeys.filter((goal) => !goalProgress(goal).completed)
    .sort((a, b) => goalProgress(b).ratio - goalProgress(a).ratio)[0];
  const { Scene } = artFor(closest?.themeId);

  return <>
    <header className="page-heading journey-heading"><div>
      <span className="eyebrow">The pot is yours.</span>
      <h1>You Did it!</h1></div>
      {done.length > 0 && <div className="completed-total">
        <strong>{done.length}</strong><span>{done.length === 1 ? 'scene' : 'scenes'} in full bloom</span>
      </div>}</header>

    {done.length === 0 ? <div className="journey-empty">
      <div className="journey-empty-art"><span><Scene ratio={1} still /></span></div>
      <div>
        <h2>No journeys finished yet</h2>
        <p>{closest
          ? <>A journey settles here once its goal is fully saved. Closest so far is <strong>{closest.name}</strong> at
            {' '}{goalProgress(closest).percent}% — keep going and its scene will finish growing.</>
          : 'Give a goal a theme and its scene will land here once you have saved the full target.'}</p>
        <button className="button secondary" onClick={onJourney}>Back to my journey</button>
      </div>
    </div> : <>
      <section className="journey-grid" aria-label="Completed journeys">
        {done.map((goal, index) =>
          <JourneyCard key={goal.id} goal={goal} index={index} muted onOpen={() => onOpen(goal.id)} />)}
      </section>
      <p className="field-help completed-note">
        <Sparkles size={13} />Open one to look back at how it got there.</p>
    </>}
  </>;
}
