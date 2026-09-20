// A journey theme turns a goal into a living scene that changes as the goal fills.
// Themes are presentation only: dropping one never affects saved amounts or schedules.
export const THEMES = {
  lotus: {
    id: 'lotus',
    name: 'The Reviving Lotus',
    scene: 'The reviving lotus',
    blurb: 'A thirsty lotus drinks in every contribution and opens into full bloom the day you reach your target.',
    unit: { one: 'drop', many: 'drops' },
    stages: [
      { at: 0, title: 'Parched', line: 'Your lotus is waiting for its very first drop.' },
      { at: 0.01, title: 'First drop', line: 'The soil is dark again. Something is stirring.' },
      { at: 0.25, title: 'Taking root', line: 'The stem lifts a little higher with every contribution.' },
      { at: 0.5, title: 'Halfway up', line: 'Halfway there, and the bud has colour now.' },
      { at: 0.75, title: 'About to open', line: 'The petals are loosening. Very nearly there.' },
      { at: 1, title: 'In full bloom', line: 'You did it. The lotus is wide open.' },
    ],
  },
  pup: {
    id: 'pup',
    name: 'The Hungry Pup',
    scene: 'The hungry pup',
    blurb: 'A tired, hungry pup with an empty bowl. Every contribution is another meal, until he is bright, fed and wagging.',
    unit: { one: 'meal', many: 'meals' },
    stages: [
      { at: 0, title: 'Hungry', line: 'Empty bowl, long day. He has not lifted his head in hours.' },
      { at: 0.01, title: 'First bite', line: 'Something in the bowl at last. One ear twitches.' },
      { at: 0.25, title: 'Perking up', line: 'He is sitting up now, watching that bowl very carefully.' },
      { at: 0.5, title: 'Tail going', line: 'Halfway fed, and the tail will not sit still.' },
      { at: 0.75, title: 'Nearly full', line: 'Almost a full bowl. He can hardly contain himself.' },
      { at: 1, title: 'Happy pup', line: 'Belly full, tail wagging, tongue out. Look at that face.' },
    ],
  },
  cycle: {
    id: 'cycle',
    name: 'The Long Ride',
    scene: 'The long ride',
    blurb: 'A cyclist pedalling down a long road to the dealership. Every contribution carries them further, until the doors open and your car rolls out under the confetti.',
    unit: { one: 'mile', many: 'miles' },
    stages: [
      { at: 0, title: 'At the roadside', line: 'The dealership is a long way down this road. Time to start pedalling.' },
      { at: 0.01, title: 'First mile', line: 'Wheels turning. The first stretch of road is behind you.' },
      { at: 0.25, title: 'Finding a rhythm', line: 'A quarter of the way there and the legs are warm now.' },
      { at: 0.5, title: 'Sign on the horizon', line: 'Halfway down the road, and you can make out the forecourt.' },
      { at: 0.75, title: 'Freewheeling in', line: 'Almost at the gates. Close enough to read the sign.' },
      { at: 1, title: 'Keys in hand', line: 'You made it. Your car is rolling out onto the forecourt.' },
    ],
  },
};

export const THEME_IDS = Object.keys(THEMES);

export function validateThemeId(themeId) {
  if (themeId == null || themeId === '') return null;
  if (typeof themeId !== 'string' || !Object.hasOwn(THEMES, themeId))
    throw new Error('Choose a journey theme from the list.');
  return themeId;
}

export const themeOf = (goal) => (goal.themeId ? THEMES[goal.themeId] ?? null : null);

export function journeyStage(themeId, ratio) {
  const { stages } = THEMES[themeId] ?? THEMES.lotus;
  const value = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
  return stages.reduce((current, stage) => (value >= stage.at ? stage : current), stages[0]);
}
