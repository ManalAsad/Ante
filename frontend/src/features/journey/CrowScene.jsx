import { useId } from 'react';
import { lerp, mix } from '../../utils/color.js';

// Aesop's crow and the pitcher, drawn entirely from the goal's 0–1 progress.
// At 0 the bird is dusty and panting beside a pitcher it cannot reach into;
// every contribution is another pebble, and at 1 the water is at the brim and
// the crow has its beak in it.
// A square card crops this 440-wide frame to roughly x 55–385, so the bird,
// the pitcher and the pebbles all live inside that band.
const PARCHED = { x: 208, y: 228, tilt: 12, gape: 13 };
const PERKED = { x: 212, y: 210, tilt: -2, gape: 3 };
const DRINKING = { x: 232, y: 174, tilt: 40, gape: 2 };

// The pitcher's outline, and the same shape inset so water and pebbles stay inside it.
const PITCHER = 'M251 196C249 212 236 224 232 248C228 274 240 292 268 292C296 292 308 274 304 248C300 224 287 212 285 196Z';
const INSIDE = 'M256 202C254 214 241 227 237 249C233 271 245 287 268 287C291 287 303 271 299 249C295 227 282 214 280 202Z';

// Where each pebble lands, bottom row first, so the pile grows as they go in.
const PEBBLES = [
  [268, 282], [250, 280], [286, 281], [259, 272], [277, 271], [243, 267], [293, 268],
  [268, 263], [252, 257], [284, 256], [268, 248], [246, 249], [290, 248], [259, 241], [277, 240],
];

// Dusty and parched on the left, glossy and watered on the right.
const PALETTE = {
  skyTop: ['#b6b1a8', '#a7c3d4'],
  skyMid: ['#d0c9bd', '#c9d7de'],
  skyLow: ['#e4dbcb', '#ecdfd0'],
  sun: ['#dbd2be', '#f2e6c4'],
  ground: ['#d6ccb8', '#a8bf9d'],
  crow: ['#7b756f', '#31363c'],
  crowLight: ['#938c84', '#55646f'],
  beak: ['#8d8579', '#242a30'],
  leg: ['#8f8779', '#3c4248'],
  clay: ['#bda894', '#c78f72'],
  clayDark: ['#a08c79', '#a97356'],
  clayLight: ['#cfbfad', '#ddae92'],
  water: ['#c3bcae', '#7fb0c9'],
  waterLight: ['#d4cec2', '#b6dcea'],
  pebble: ['#a89f95', '#8b9299'],
  pebbleDark: ['#8f867c', '#6d757c'],
};

const shade = (key, r) => mix(PALETTE[key][0], PALETTE[key][1], r);

export default function CrowScene({ ratio, filling = false, still = false }) {
  const r = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ref = (name) => `${name}-${uid}`;

  // The bird straightens up as the water rises, then leans in over the last
  // stretch, so the drink itself is the reward for finishing.
  const lift = Math.min(1, r / 0.88);
  const drink = Math.max(0, (r - 0.88) / 0.12);
  const head = Object.fromEntries(Object.keys(PARCHED).map((key) =>
    [key, lerp(lerp(PARCHED[key], PERKED[key], lift), DRINKING[key], drink)]));

  const waterTop = lerp(285, 203, r);
  const dropped = Math.round(r * PEBBLES.length);
  const crow = shade('crow', r);

  return <svg className={`journey-scene crow-scene ${still ? 'is-still' : ''} ${filling ? 'is-filling' : ''} ${r >= 0.999 ? 'is-drinking' : ''}`}
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
      <clipPath id={ref('inside')}>
        <path d={INSIDE} />
      </clipPath>
    </defs>

    <rect width="440" height="330" fill={`url(#${ref('sky')})`} />

    <circle className="scene-halo" cx="344" cy="74" r="84" fill={`url(#${ref('sun')})`} opacity={0.4 + 0.5 * r} />
    <circle cx="344" cy="74" r={19 + 6 * r} fill={mix('#ded5c2', '#f8f0d8', r)} opacity={0.72 + 0.28 * r} />

    <g className="scene-motes" opacity={0.12 + 0.8 * r}>
      {[[70, 202, 0], [124, 146, 1.7], [330, 184, 0.9], [388, 126, 2.6], [268, 88, 3.4], [166, 62, 1.2]].map(([x, y, delay], index) =>
        <circle key={index} cx={x} cy={y} r={index % 2 ? 3.4 : 2.2} fill={mix('#ded7c9', '#f4ecd2', r)}
          style={{ animationDelay: `${delay}s` }} />)}
    </g>

    {/* the same horizon the other journeys use, so the set feels like one place */}
    <path d="M0 268C88 246 148 262 222 258C300 254 360 240 440 262V330H0Z" fill={mix('#d8d3c8', '#b3cca6', r)} opacity="0.55" />
    <path d="M0 292C96 276 168 288 240 284C316 280 372 272 440 288V330H0Z" fill={shade('ground', r)} />

    {/* dry ground that cracks less the further along the goal is */}
    <g stroke={mix('#b3a68f', '#9db08f', r)} strokeWidth="2" strokeLinecap="round" opacity={Math.max(0, 0.45 - r)}>
      <path d="M104 308L128 302L150 310" /><path d="M186 316L216 311" /><path d="M296 306L322 312" />
    </g>
    <g opacity={Math.max(0, r - 0.45) * 1.8} stroke={mix('#a9b39a', '#7d9a72', r)} strokeWidth="3" strokeLinecap="round">
      {[[62, 302], [96, 310], [382, 304], [352, 312]].map(([x, y], index) =>
        <g key={index}><path d={`M${x} ${y + 12}V${y}`} /><path d={`M${x} ${y + 12}L${x - 8} ${y + 2}`} /><path d={`M${x} ${y + 12}L${x + 8} ${y + 1}`} /></g>)}
    </g>

    <ellipse cx="200" cy="296" rx="120" ry="12" fill="#2b2418" opacity={0.1 + 0.07 * r} />

    {/* the pitcher, its water rising pebble by pebble */}
    <g>
      <path d={PITCHER} fill={shade('clay', r)} />
      <path d="M232 248C228 274 240 292 268 292C276 292 282 290 287 287C258 288 240 272 244 248C247 226 258 214 260 196H251C249 212 236 224 232 248Z"
        fill={shade('clayLight', r)} opacity="0.55" />

      <g clipPath={`url(#${ref('inside')})`}>
        <rect x="230" y={waterTop} width="80" height="100" fill={shade('water', r)} />
        <rect x="230" y={waterTop} width="80" height="4" fill={shade('waterLight', r)} />
        <g className="crow-shimmer" opacity={0.25 + 0.5 * r}>
          <ellipse cx="256" cy={waterTop + 7} rx="9" ry="2.4" fill={shade('waterLight', r)} />
          <ellipse cx="284" cy={waterTop + 13} rx="6" ry="1.8" fill={shade('waterLight', r)} />
        </g>

        {PEBBLES.slice(0, dropped).map(([x, y], index) =>
          <ellipse key={index} cx={x} cy={y} rx="8.5" ry="6.5"
            fill={shade(index % 3 ? 'pebble' : 'pebbleDark', r)} />)}

        {/* the pebble going in while the scene catches up to a contribution */}
        <g className="crow-pebble">
          <ellipse cx="268" cy="150" rx="8" ry="6.5" fill={shade('pebbleDark', r)} />
        </g>
      </g>

      <ellipse cx="268" cy="196" rx="17.5" ry="5.5" fill={shade('clayDark', r)} />
      <ellipse cx="268" cy="196" rx="12.5" ry="3.4" fill={r > 0.94 ? shade('water', r) : mix('#6e665c', '#2f3b42', r)} />
      <path d="M254 200C253 210 246 218 242 230" fill="none" stroke="#f7f2e8" strokeWidth="3"
        strokeLinecap="round" opacity={0.12 + 0.3 * r} />
    </g>

    {/* the crow, drawn over the pitcher so the beak dips into the mouth
        rather than disappearing behind the clay */}
    <g>
      <g className="crow-tail">
        <path d="M138 250L98 232L106 250L96 262L136 266Z" fill={crow} />
      </g>

      <g stroke={shade('leg', r)} strokeWidth="4" strokeLinecap="round">
        {[162, 180].map((x) => <g key={x}>
          <path d={`M${x} 272V292`} />
          <path d={`M${x} 292H${x + 9}`} /><path d={`M${x} 292L${x - 7} 294`} />
        </g>)}
      </g>

      <ellipse cx="166" cy="250" rx="37" ry="27" fill={crow} />

      {/* neck, drawn from the shoulder to wherever the head has got to, and
          thinning as the bird stretches out over the rim */}
      <path d={`M184 238Q${184 + (head.x - 191) * 0.2} ${238 + (head.y - 229) * 0.75} ${head.x - 7} ${head.y + 9}`}
        fill="none" stroke={crow} strokeWidth={lerp(19, 12, drink)} strokeLinecap="round" />

      <g className="crow-wing">
        <path d="M190 234C172 227 144 235 134 257C148 267 182 262 194 246Z" fill={shade('crowLight', r)} />
        <path d="M150 250C162 245 176 246 184 251" fill="none" stroke={crow} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      </g>

      <g transform={`translate(${head.x} ${head.y}) rotate(${head.tilt})`}>
        <ellipse rx="15.5" ry="14" fill={crow} />

        {/* beak, open and panting while the bird is still thirsty */}
        <g transform="translate(12 -1)">
          <path transform={`rotate(${-head.gape / 2})`} d="M0 -5L26 0L0 2Z" fill={shade('beak', r)} />
          <path transform={`rotate(${head.gape / 2})`} d="M0 3L26 0L0 -1Z" fill={mix('#7d766b', '#171b1f', r)} />
        </g>

        {/* a tired squint that opens into a bright eye as the water comes up */}
        <path d="M-2 -5Q4 -1 10 -5" fill="none" stroke={mix('#6f6a63', '#11151a', r)} strokeWidth="2.2"
          strokeLinecap="round" opacity={Math.max(0, 1 - r * 1.6)} />
        <g className="crow-eye" opacity={Math.max(0, r * 1.6 - 0.6)}>
          <ellipse cx="4" cy="-5" rx="5.4" ry="6" fill="#f7f4ec" />
          <circle cx="5" cy="-4.4" r="3.4" fill="#22262b" />
          <circle cx="6.2" cy="-6" r="1.4" fill="#f7f4ec" />
        </g>
      </g>
    </g>

    {/* a drop or two off the beak once the bird is actually drinking */}
    <g className="crow-drops" fill={shade('water', r)} opacity={drink}>
      {[0, 1].map((index) => <ellipse key={index} cx={256 + index * 9} cy="204" rx="2.6" ry="3.6"
        style={{ animationDelay: `${index * 0.55}s` }} />)}
    </g>

    <g className="scene-sparkles" opacity={drink} fill="#f4ead3">
      {[[214, 150], [310, 136], [166, 186], [340, 190]].map(([x, y], index) =>
        <path key={index} d={`M${x} ${y - 8}L${x + 2.6} ${y - 2.6}L${x + 8} ${y}L${x + 2.6} ${y + 2.6}L${x} ${y + 8}L${x - 2.6} ${y + 2.6}L${x - 8} ${y}L${x - 2.6} ${y - 2.6}Z`}
          style={{ animationDelay: `${index * 0.42}s` }} />)}
    </g>
  </svg>;
}
