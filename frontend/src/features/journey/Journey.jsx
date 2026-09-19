import { Plus } from 'lucide-react';
import JourneyCard from './JourneyCard.jsx';
import { artFor } from './scenes.js';
import { THEME_IDS, themeOf } from '../../../../logic/domain/themes.js';

export default function Journey({ goals, onOpen, onCreate }) {
  const journeys = goals.filter(themeOf);
  const plain = goals.length - journeys.length;

  return <>
    <header className="page-heading journey-heading">
      <div>
        <span className="eyebrow">Your journey</span>
        <h1>Watch them bloom</h1>
      </div>
      <button className="button primary" onClick={onCreate}><Plus size={17} />New goal</button>
    </header>

    {journeys.length === 0 ? <div className="journey-empty">
      <div className="journey-empty-art">{THEME_IDS.map((id) => {
        const { Scene } = artFor(id);
        return <span key={id}><Scene ratio={0.9} still /></span>;
      })}</div>
      <div>
        <h2>No journeys yet</h2>
        <p>Pick a theme when you create a goal and it grows into a living scene here — a lotus that revives
          every time you save, or a hungry pup who gets happier with every meal you put in his bowl.</p>
        <button className="button primary" onClick={onCreate}><Plus size={17} />Create a goal with a theme</button>
        {plain > 0 && <p className="field-help journey-hint">
          {plain === 1 ? 'One existing goal has' : `${plain} existing goals have`} no theme yet.
          Open {plain === 1 ? 'it' : 'one'} and choose Edit to add one.</p>}
      </div>
    </div> : <>
      <section className="journey-grid" aria-label="Goal journeys">
        {journeys.map((goal, index) =>
          <JourneyCard key={goal.id} goal={goal} index={index} onOpen={() => onOpen(goal.id)} />)}
      </section>
      {plain > 0 && <p className="field-help journey-hint">
        {plain === 1 ? 'One other goal has' : `${plain} other goals have`} no theme yet.
        Open {plain === 1 ? 'it' : 'one'} and choose Edit to give it a scene.</p>}
    </>}
  </>;
}
