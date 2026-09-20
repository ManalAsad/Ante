// Blends two #rrggbb colours so a scene can shift from parched to vivid as a goal fills.
const channels = (hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));

export function mix(from, to, amount) {
  const t = Math.max(0, Math.min(1, amount));
  const [fr, fg, fb] = channels(from);
  const [tr, tg, tb] = channels(to);
  const blend = (a, b) => Math.round(a + (b - a) * t).toString(16).padStart(2, '0');
  return `#${blend(fr, tr)}${blend(fg, tg)}${blend(fb, tb)}`;
}

export const lerp = (from, to, amount) => from + (to - from) * Math.max(0, Math.min(1, amount));
