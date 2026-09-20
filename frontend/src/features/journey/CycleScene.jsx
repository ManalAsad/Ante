import { useId } from 'react';
import { lerp, mix } from '../../utils/color.js';

// A cyclist riding to the dealership, drawn entirely from the goal's 0–1 progress.
// At 0 they are at the far kerb on a grey morning; at 1 they are on the forecourt
// and the car is rolling out through the doors under the confetti.
// A square card crops this 440-wide frame to roughly x 55–385, so the ride, the
// doors and the confetti all have to live inside that band.
const START_X = 88;
const ARRIVED_X = 186;
const ROAD_Y = 302;

// Overcast and far away on the left, bright and arrived on the right.
const PALETTE = {
  skyTop: ['#b0b4b8', '#a7c3d4'],
  skyMid: ['#c7c9ca', '#c9d7de'],
  skyLow: ['#dcd8d3', '#f0e3cd'],
  sun: ['#cfd2d4', '#f2e6c4'],
  ground: ['#cfcabf', '#a8bf9d'],
  road: ['#a6a5a3', '#8e9297'],
  roadDark: ['#8d8c8a', '#767a7f'],
  line: ['#c6c3bd', '#f1e7cf'],
  wall: ['#b4b1ac', '#e8e3d9'],
  wallDark: ['#9a9792', '#cfc7b8'],
  glass: ['#a9adb0', '#a9c8dc'],
  frame: ['#8d8b87', '#7f8d97'],
  sign: ['#a7a4a0', '#cb8ba0'],
  bike: ['#8c8985', '#4f5a62'],
  jersey: ['#a09a95', '#cb8ba0'],
  skin: ['#a79d95', '#c9a284'],
  helmet: ['#939089', '#7d9ab0'],
  car: ['#aeaba6', '#e0c37c'],
  carDark: ['#94918d', '#b2914c'],
  bunting: ['#b0aca7', '#e0c37c'],
};

const CONFETTI = ['#e00b0b', '#e7ab14', '#a7c3d4', '#88a980'];

const shade = (key, r) => mix(PALETTE[key][0], PALETTE[key][1], r);

// One pennant per step across the forecourt, hanging from a line between the posts.
function Bunting({ fill, opacity }) {
  return <g opacity={opacity}>
    <path d="M246 164Q330 186 414 162" fill="none" stroke={fill} strokeWidth="1.6" opacity="0.8" />
    {Array.from({ length: 7 }, (_, index) => {
      const t = (index + 0.5) / 7;
      const x = 246 + t * 168;
      const y = 164 + Math.sin(t * Math.PI) * 18 - t * 2;
      return <path key={index} d={`M${x - 6} ${y}H${x + 6}L${x} ${y + 12}Z`} fill={fill}
        opacity={index % 2 ? 0.75 : 1} />;
    })}
  </g>;
}

export default function CycleScene({ ratio, filling = false, still = false }) {
  const r = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ref = (name) => `${name}-${uid}`;

  const arrived = r >= 0.999;
  // Nothing turns before the first contribution or after the last one: the rider
  // is either still at the kerb or already parked on the forecourt.
  const moving = r > 0.004 && !arrived;
  // The doors only start to open over the last stretch, so the car is a reward
  // for finishing rather than something visible most of the way along.
  const handover = Math.max(0, (r - 0.9) / 0.1);
  const ride = lerp(START_X, ARRIVED_X, r);
  const effort = Math.max(0, 1 - r * 0.45);
  const bike = shade('bike', r);
  const skin = shade('skin', r);

  return <svg className={`journey-scene cycle-scene ${still ? 'is-still' : ''} ${filling ? 'is-filling' : ''} ${arrived ? 'is-arrived' : ''} ${moving ? '' : 'is-parked'}`}
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
      <clipPath id={ref('doorway')}>
        <rect x="312" y="180" width="62" height="108" />
      </clipPath>
    </defs>

    <rect width="440" height="330" fill={`url(#${ref('sky')})`} />

    <circle className="scene-halo" cx="140" cy="70" r="82" fill={`url(#${ref('sun')})`} opacity={0.3 + 0.6 * r} />
    <circle cx="140" cy="70" r={18 + 6 * r} fill={mix('#d6d9db', '#f8f0d8', r)} opacity={0.65 + 0.35 * r} />

    <g className="scene-motes" opacity={0.12 + 0.7 * r}>
      {[[58, 196, 0], [132, 140, 1.7], [246, 102, 0.9], [318, 148, 2.6], [386, 96, 3.4], [178, 58, 1.2]].map(([x, y, delay], index) =>
        <circle key={index} cx={x} cy={y} r={index % 2 ? 3.4 : 2.2} fill={mix('#dcd8d0', '#f4ecd2', r)}
          style={{ animationDelay: `${delay}s` }} />)}
    </g>

    {/* the same horizon the other journeys use, so the set feels like one place */}
    <path d="M0 268C88 246 148 262 222 258C300 254 360 240 440 262V330H0Z" fill={mix('#d8d3c8', '#b3cca6', r)} opacity="0.55" />
    <path d="M0 288C96 276 168 288 240 284C316 280 372 276 440 286V330H0Z" fill={shade('ground', r)} />

    {/* the dealership: glass front on the left, the doors the car comes through on the right */}
    <g>
      <rect x="250" y="166" width="186" height="124" fill={shade('wall', r)} />
      <rect x="242" y="152" width="198" height="16" rx="4" fill={shade('wallDark', r)} />
      <rect x="250" y="166" width="186" height="6" fill="#2b2418" opacity="0.07" />

      {[262, 286].map((x) => <g key={x}>
        <rect x={x} y="184" width="20" height="104" fill={shade('glass', r)} opacity="0.92" />
        <path d={`M${x} 288L${x + 20} 184`} stroke="#f7f4ee" strokeWidth="5" opacity={0.1 + 0.25 * r} />
        <rect x={x} y="184" width="20" height="104" fill="none" stroke={shade('frame', r)} strokeWidth="2.5" />
      </g>)}

      {/* the doorway, glazed over until the car noses out of it */}
      <rect x="312" y="180" width="62" height="108" fill={mix('#8a8884', '#6b7a85', r)} />
      {/* showroom light spilling out of the open doors */}
      <rect x="316" y="196" width="54" height="92" fill={mix('#9d9a95', '#cfd9dd', r)} opacity={0.35 + 0.5 * handover} />
      <rect x="316" y="268" width="54" height="20" fill={mix('#8d8a86', '#b3bfc6', r)} opacity={0.4 + 0.4 * handover} />
      <rect x="312" y="180" width="62" height="108" fill="none" stroke={shade('frame', r)} strokeWidth="3" />
      <g clipPath={`url(#${ref('doorway')})`}>
        {[318, 344].map((x) => <rect key={x} x={x} y="183" width="25" height="102" fill={shade('glass', r)}
          opacity={0.75 * (1 - handover)} />)}
      </g>

      {/* roof sign, with a little car of its own */}
      <g transform="translate(296 118)">
        <rect width="78" height="30" rx="6" fill={shade('sign', r)} />
        <rect x="34" y="30" width="10" height="12" fill={shade('wallDark', r)} />
        <g fill={mix('#d7d4cf', '#fdf6e8', r)} opacity={0.5 + 0.5 * r}>
          <path d="M16 19h46l-4-7c-1-2-3-3-5-3H27c-2 0-4 1-5 3z" />
          <rect x="14" y="19" width="50" height="5" rx="2.5" />
        </g>
      </g>

      <Bunting fill={shade('bunting', r)} opacity={0.25 + 0.75 * r} />
    </g>

    {/* the road, running off both edges of the frame */}
    <rect x="-10" y="288" width="460" height="42" fill={shade('road', r)} />
    <rect x="-10" y="288" width="460" height="3" fill={shade('roadDark', r)} />
    <path className="cycle-road-line" d="M-40 312H480" stroke={shade('line', r)} strokeWidth="4"
      strokeDasharray="26 22" strokeLinecap="round" opacity={0.45 + 0.4 * r} />

    {/* the car, rolling out of the doors once the target is paid off */}
    <g opacity={handover} transform={`translate(${lerp(348, 316, handover)} ${ROAD_Y}) scale(1.15)`}>
      <ellipse cy="2" rx="56" ry="7" fill="#2b2418" opacity={0.16 * handover} />
      <path d="M-52 -14C-48 -26 -42 -32 -30 -34C-14 -37 12 -37 26 -33C34 -31 42 -24 50 -15C54 -11 52 -5 46 -5H-48C-53 -5 -54 -9 -52 -14Z"
        fill={shade('car', r)} />
      <path d="M-30 -33C-18 -36 10 -36 22 -32C28 -30 34 -25 38 -20H-36C-34 -26 -33 -31 -30 -33Z"
        fill={mix('#c8c5c0', '#dff0f7', r)} opacity="0.9" />
      <path d="M-4 -35V-20" stroke={shade('carDark', r)} strokeWidth="2.5" />
      <rect x="-54" y="-14" width="108" height="6" rx="3" fill={shade('carDark', r)} opacity="0.5" />
      <circle cx="44" cy="-13" r="4" fill={mix('#e6e2da', '#fff3cf', r)} />
      {[-30, 30].map((x) => <g key={x}>
        <circle cx={x} cy="-5" r="10" fill="#33383c" />
        <circle cx={x} cy="-5" r="4.2" fill={mix('#c9c6c1', '#e7e2d6', r)} />
      </g>)}
    </g>

    {/* the rider, further along the road with every contribution */}
    <g transform={`translate(${ride} ${ROAD_Y}) scale(0.74)`}>
      <ellipse cy="1" rx="34" ry="5.5" fill="#2b2418" opacity={0.12 + 0.06 * r} />

      <g className="cycle-dust" fill={shade('roadDark', r)}>
        {[0, 1, 2].map((index) => <circle key={index} cx={-34 - index * 9} cy={-6 - index * 3} r={4 - index}
          style={{ animationDelay: `${index * 0.22}s` }} />)}
      </g>

      <g className="cycle-speed" stroke={mix('#cfccc6', '#f2ead9', r)} strokeWidth="2.5" strokeLinecap="round">
        <path d="M-46 -34H-70" /><path d="M-52 -46H-68" /><path d="M-50 -22H-72" />
      </g>

      <g className="cycle-bob">
        {/* wheels */}
        {[-24, 24].map((x) => <g key={x} className="cycle-wheel"
          style={{ animationPlayState: moving ? 'running' : 'paused' }}>
          <circle cx={x} cy="-20" r="19" fill="none" stroke={mix('#7d7a77', '#33383c', r)} strokeWidth="3.4" />
          <g stroke={mix('#b3b0ac', '#8e969c', r)} strokeWidth="1.2">
            {[0, 45, 90, 135].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              return <path key={angle} d={`M${x - Math.cos(rad) * 17} ${-20 - Math.sin(rad) * 17}L${x + Math.cos(rad) * 17} ${-20 + Math.sin(rad) * 17}`} />;
            })}
          </g>
          <circle cx={x} cy="-20" r="2.4" fill={bike} />
        </g>)}

        {/* frame, bars and saddle */}
        <g fill="none" stroke={bike} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-24 -20H0L-11 -47H-24" />
          <path d="M0 -20L20 -46H-11" />
          <path d="M20 -46L24 -20" />
        </g>
        <path d="M-19 -50H-3L-6 -45H-17Z" fill={bike} />
        <path d="M17 -50H31" stroke={bike} strokeWidth="3.4" strokeLinecap="round" />

        {/* crank and pedals */}
        <g className="cycle-crank" style={{ animationPlayState: moving ? 'running' : 'paused' }}>
          <circle cx="0" cy="-20" r="6.5" fill="none" stroke={bike} strokeWidth="2" />
          <path d="M-9 -26L9 -14" stroke={bike} strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* rider: two legs pedalling out of phase, chest low over the bars */}
        <g className="cycle-leg cycle-leg-back" style={{ animationPlayState: moving ? 'running' : 'paused' }}>
          <path d="M-9 -52L-14 -34L2 -22" fill="none" stroke={mix('#8f8b86', '#46525c', r)}
            strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <path d={`M-12 -52C-6 ${-62 - 4 * effort} 6 -66 14 -70`} fill="none" stroke={shade('jersey', r)}
          strokeWidth="15" strokeLinecap="round" />
        <path d="M13 -69L23 -50" fill="none" stroke={skin} strokeWidth="5.5" strokeLinecap="round" />

        <g className="cycle-leg cycle-leg-front" style={{ animationPlayState: moving ? 'running' : 'paused' }}>
          <path d="M-9 -52L-8 -32L4 -19" fill="none" stroke={mix('#9a958f', '#55626c', r)}
            strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <g transform={`translate(18 -76) rotate(${lerp(14, 4, r)})`}>
          <circle r="8.5" fill={skin} />
          <path d="M-10 -3C-9 -11 -2 -14 4 -13C9 -12 12 -8 12 -3Z" fill={shade('helmet', r)} />
          <path d="M-10 -3H12" stroke={shade('helmet', r)} strokeWidth="3" strokeLinecap="round" />
          <circle cx="5" cy="1" r="1.6" fill="#3f3a36" opacity={0.35 + 0.6 * r} />
          {/* a grin once the forecourt is in reach */}
          <path d="M2 5Q6 8 9 4" fill="none" stroke="#3f3a36" strokeWidth="1.5" strokeLinecap="round"
            opacity={Math.max(0, r * 1.8 - 0.9)} />
        </g>

        {/* a fist thrown up behind the helmet at the finish */}
        <g opacity={handover}>
          <path d="M11 -68L-2 -92" fill="none" stroke={skin} strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="-3" cy="-95" r="4.5" fill={skin} />
        </g>
      </g>
    </g>

    {/* confetti over the forecourt, only once the car is out */}
    <g className="cycle-confetti">
      {Array.from({ length: 16 }, (_, index) => {
        const x = 212 + ((index * 53) % 172);
        return <rect key={index} x={x} y={-18 - (index % 4) * 26} width="7" height="11" rx="1.5"
          fill={CONFETTI[index % CONFETTI.length]}
          style={{ animationDelay: `${(index % 8) * 0.34}s`, animationDuration: `${2.6 + (index % 3) * 0.7}s` }} />;
      })}
    </g>

    <g className="scene-sparkles" opacity={handover} fill="#f4ead3">
      {[[268, 128], [352, 110], [226, 166], [378, 152]].map(([x, y], index) =>
        <path key={index} d={`M${x} ${y - 8}L${x + 2.6} ${y - 2.6}L${x + 8} ${y}L${x + 2.6} ${y + 2.6}L${x} ${y + 8}L${x - 2.6} ${y + 2.6}L${x - 8} ${y}L${x - 2.6} ${y - 2.6}Z`}
          style={{ animationDelay: `${index * 0.42}s` }} />)}
    </g>
  </svg>;
}
