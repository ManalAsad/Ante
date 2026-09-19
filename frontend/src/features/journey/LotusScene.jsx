import { useId } from 'react';
import { lerp, mix } from '../../utils/color.js';

// A side-on lotus in a water pot, drawn entirely from the goal's 0–1 progress.
// At 0 the pot is cracked and dry and the flower hangs dead; at 1 it is wide open.
const BASE = { x: 220, y: 252 };
const DROOP = { tip: { x: 150, y: 228 }, control: { x: 194, y: 250 }, head: 152 };
const RISEN = { tip: { x: 222, y: 106 }, control: { x: 205, y: 178 }, head: 0 };

// Parched on the left, revived on the right. Kept dusty rather than saturated
// so the scene sits quietly next to the rest of the app.
const PALETTE = {
  skyTop: ['#cabfae', '#a7c3d4'],
  skyMid: ['#ded2be', '#c9d7de'],
  skyLow: ['#ebe2d2', '#ecd9e2'],
  sun: ['#dcd0ba', '#f2e6c4'],
  ground: ['#d8cebb', '#a8bf9d'],
  pot: ['#bda894', '#c78f72'],
  potDark: ['#a08c79', '#a97356'],
  water: ['#c9bfae', '#adc8d4'],
  stem: ['#9e9282', '#7f9c78'],
  leaf: ['#a49883', '#88a980'],
  outer: ['#b6aa9c', '#d78aab'],
  mid: ['#c5bbae', '#e3a9c1'],
  inner: ['#d6cec3', '#f0d8e2'],
  core: ['#b3a893', '#e0c37c'],
};

const shade = (key, r) => mix(PALETTE[key][0], PALETTE[key][1], r);

function petalPath(length, width) {
  return `M0 0C${-width} ${-length * 0.34} ${-width * 0.58} ${-length * 0.79} 0 ${-length}`
    + `C${width * 0.58} ${-length * 0.79} ${width} ${-length * 0.34} 0 0Z`;
}

function Ring({ count, spread, length, width, fill, stroke }) {
  return Array.from({ length: count }, (_, index) => {
    const angle = count < 2 ? 0 : (index / (count - 1) - 0.5) * 2 * spread;
    return <path key={index} d={petalPath(length, width)} transform={`rotate(${angle.toFixed(2)})`}
      fill={fill} stroke={stroke} strokeWidth="0.9" strokeLinejoin="round" />;
  });
}

export default function LotusScene({ ratio, filling = false, still = false }) {
  const r = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ref = (name) => `${name}-${uid}`;

  const tip = { x: lerp(DROOP.tip.x, RISEN.tip.x, r), y: lerp(DROOP.tip.y, RISEN.tip.y, r) };
  const control = { x: lerp(DROOP.control.x, RISEN.control.x, r), y: lerp(DROOP.control.y, RISEN.control.y, r) };
  const head = lerp(DROOP.head, RISEN.head, r);
  const waterTop = lerp(316, 258, r);
  const bloom = Math.max(0, (r - 0.72) / 0.28);
  const life = r;

  const petals = [
    { count: 9, spread: 16 + 92 * r, length: 30 + 52 * r, width: 12 + 12 * r, fill: shade('outer', r), stroke: mix('#a08d78', '#b56b8c', r) },
    { count: 7, spread: 11 + 58 * r, length: 22 + 38 * r, width: 9 + 9 * r, fill: shade('mid', r), stroke: mix('#b1a08c', '#c98aa9', r) },
    { count: 5, spread: 7 + 30 * r, length: 15 + 24 * r, width: 7 + 6 * r, fill: shade('inner', r), stroke: mix('#c0b1a0', '#dcb0c6', r) },
  ];

  return <svg className={`journey-scene lotus-scene ${still ? 'is-still' : ''} ${filling ? 'is-filling' : ''}`}
    viewBox="0 0 440 330" preserveAspectRatio="xMidYMax slice" role="presentation" focusable="false">
    <defs>
      <linearGradient id={ref('sky')} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stopColor={shade('skyTop', r)} />
        <stop offset="52%" stopColor={shade('skyMid', r)} />
        <stop offset="100%" stopColor={shade('skyLow', r)} />
      </linearGradient>
      <radialGradient id={ref('sun')}>
        <stop offset="0%" stopColor={shade('sun', r)} stopOpacity="0.95" />
        <stop offset="100%" stopColor={shade('sun', r)} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={ref('halo')}>
        <stop offset="0%" stopColor="#f4e8cd" stopOpacity={0.7 * bloom} />
        <stop offset="60%" stopColor="#d9a8bd" stopOpacity={0.3 * bloom} />
        <stop offset="100%" stopColor="#d78aab" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={ref('pot')} x1="0" y1="0" x2="1" y2="0.4">
        <stop offset="0%" stopColor={shade('potDark', r)} />
        <stop offset="45%" stopColor={shade('pot', r)} />
        <stop offset="100%" stopColor={shade('potDark', r)} />
      </linearGradient>
      <linearGradient id={ref('water')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={mix('#ddcdb4', '#cfe0e7', r)} />
        <stop offset="100%" stopColor={shade('water', r)} />
      </linearGradient>
      <clipPath id={ref('potClip')}>
        <path d="M163 250H277L266 318H174Z" />
      </clipPath>
    </defs>

    <rect width="440" height="330" fill={`url(#${ref('sky')})`} />

    {/* sun and its breathing halo */}
    <circle className="scene-halo" cx="356" cy="72" r="86" fill={`url(#${ref('sun')})`} opacity={0.4 + 0.5 * r} />
    <circle cx="356" cy="72" r={19 + 6 * r} fill={mix('#e6d6b8', '#f8f0d8', r)} opacity={0.75 + 0.25 * r} />

    {/* drifting pollen, only once there is life in the scene */}
    <g className="scene-motes" opacity={0.15 + 0.75 * life}>
      {[[58, 210, 0], [110, 160, 1.7], [330, 195, 0.9], [386, 138, 2.6], [268, 96, 3.4], [150, 70, 1.2]].map(([x, y, delay], index) =>
        <circle key={index} cx={x} cy={y} r={index % 2 ? 3.4 : 2.2} fill={mix('#e0d2b6', '#f4ecd2', r)}
          style={{ animationDelay: `${delay}s` }} />)}
    </g>

    {/* horizon and ground */}
    <path d="M0 268C88 246 148 262 222 258C300 254 360 240 440 262V330H0Z" fill={mix('#e0d4bc', '#b3cca6', r)} opacity="0.55" />
    <path d="M0 292C96 276 168 288 240 284C316 280 372 272 440 288V330H0Z" fill={shade('ground', r)} />
    <g opacity={Math.max(0, r - 0.45) * 1.8} stroke={mix('#a8b394', '#7d9a72', r)} strokeWidth="3" strokeLinecap="round">
      {[[44, 300], [86, 306], [372, 300], [406, 307], [318, 310]].map(([x, y], index) =>
        <g key={index}><path d={`M${x} ${y + 12}V${y}`} /><path d={`M${x} ${y + 12}L${x - 8} ${y + 2}`} /><path d={`M${x} ${y + 12}L${x + 8} ${y + 1}`} /></g>)}
    </g>

    {/* the pot, its water, and the cracks that heal as the goal fills */}
    <g>
      <ellipse cx="220" cy="320" rx="72" ry="11" fill="#2b1d12" opacity={0.12 + 0.1 * r} />
      <path d="M163 250H277L266 318H174Z" fill={`url(#${ref('pot')})`} />
      <g clipPath={`url(#${ref('potClip')})`}>
        <rect x="160" y={waterTop} width="120" height="80" fill={`url(#${ref('water')})`} opacity="0.92" />
        <ellipse cx="220" cy={waterTop} rx="58" ry="6" fill={mix('#e8dcc6', '#dceaef', r)} opacity="0.9" />
        <g className="lotus-ripples" opacity={0.2 + 0.8 * r}>
          <ellipse cx="204" cy={waterTop} rx="10" ry="3" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          <ellipse cx="240" cy={waterTop} rx="10" ry="3" fill="none" stroke="#ffffff" strokeWidth="1.5" style={{ animationDelay: '1.1s' }} />
        </g>
      </g>
      <path d="M160 244H280L277 259H163Z" fill={shade('pot', r)} stroke={shade('potDark', r)} strokeWidth="1.5" />
      <g stroke="#8a7462" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity={Math.max(0, 0.8 - r * 1.1)}>
        <path d="M196 264L190 282L199 296L193 312" />
        <path d="M246 268L253 284L244 298L250 310" />
        <path d="M220 288L214 302" />
      </g>
    </g>

    {/* lily pads rest on the water once it is high enough */}
    <g opacity={Math.max(0, r - 0.2) * 1.4}>
      {[[188, -14], [256, 12]].map(([x, spin], index) =>
        <g key={index} transform={`translate(${x} ${waterTop + 2}) rotate(${spin})`}>
          <ellipse rx={14 + 6 * r} ry={5 + 2 * r} fill={shade('leaf', r)} />
          <path d={`M0 0L${10 + 4 * r} ${-2}`} stroke={mix('#8e8271', '#6f8f6a', r)} strokeWidth="1.4" />
        </g>)}
    </g>

    {/* fallen petals fade away as the flower recovers */}
    <g opacity={Math.max(0, 1 - r * 2.2)} fill="#a8917a">
      <ellipse cx="128" cy="300" rx="11" ry="4" transform="rotate(-18 128 300)" />
      <ellipse cx="306" cy="306" rx="9" ry="3.5" transform="rotate(24 306 306)" />
    </g>

    <g className="lotus-sway">
      {/* stem */}
      <path d={`M${BASE.x} ${BASE.y}Q${control.x} ${control.y} ${tip.x} ${tip.y}`}
        fill="none" stroke={shade('stem', r)} strokeWidth={4.5 + 2 * r} strokeLinecap="round" />

      {/* leaves partway up the stem */}
      <g transform={`translate(${control.x} ${control.y}) rotate(${lerp(46, 8, r)})`}>
        <ellipse rx={9 + 13 * r} ry={5 + 6 * r} cx={-(9 + 13 * r)} fill={shade('leaf', r)} opacity="0.95" />
      </g>
      <g transform={`translate(${lerp(control.x + 10, control.x + 6, r)} ${control.y + 26}) rotate(${lerp(-38, -12, r)})`}>
        <ellipse rx={8 + 11 * r} ry={4 + 5 * r} cx={8 + 11 * r} fill={mix('#9c9078', '#7ba073', r)} opacity="0.95" />
      </g>

      {/* the flower itself */}
      <g transform={`translate(${tip.x} ${tip.y}) rotate(${head})`}>
        <circle r={54 * bloom} fill={`url(#${ref('halo')})`} className="scene-halo" />
        {petals.map((ring, index) => <g key={index} className={`lotus-ring lotus-ring-${index}`}><Ring {...ring} /></g>)}
        <circle r={4 + 7 * r} fill={shade('core', r)} />
        <g opacity={bloom} stroke={mix('#c2b393', '#d4b268', r)} strokeWidth="1.6" strokeLinecap="round">
          {[-34, -17, 0, 17, 34].map((angle) => <g key={angle} transform={`rotate(${angle})`}>
            <path d="M0 -2V-16" /><circle cy="-18" r="2.4" fill="#f2e6c6" stroke="none" /></g>)}
        </g>
      </g>
    </g>

    {/* falling water, shown while the scene is being topped up */}
    <g className="lotus-drops" fill={mix('#d3e0e6', '#aecdd8', r)}>
      {[196, 220, 244, 208, 233].map((x, index) =>
        <path key={x} d={`M${x} 40C${x + 5} 50 ${x + 6} 56 ${x} 60C${x - 6} 56 ${x - 5} 50 ${x} 40Z`}
          style={{ animationDelay: `${index * 0.34}s` }} />)}
    </g>

    {/* sparkles for the finished bloom */}
    <g className="scene-sparkles" opacity={bloom} fill="#f4ead3">
      {[[150, 92], [292, 78], [196, 46], [258, 132], [120, 150], [330, 160]].map(([x, y], index) =>
        <path key={index} d={`M${x} ${y - 8}L${x + 2.6} ${y - 2.6}L${x + 8} ${y}L${x + 2.6} ${y + 2.6}L${x} ${y + 8}L${x - 2.6} ${y + 2.6}L${x - 8} ${y}L${x - 2.6} ${y - 2.6}Z`}
          style={{ animationDelay: `${index * 0.42}s` }} />)}
    </g>
  </svg>;
}
