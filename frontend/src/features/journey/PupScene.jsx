import { useId } from 'react';
import { lerp, mix } from '../../utils/color.js';

// A pup sitting beside his bowl, drawn entirely from the goal's 0–1 progress.
// At 0 he is grey, thin and slumped over an empty bowl; at 1 he is golden, fed and wagging.
const TIRED = { head: { x: 266, y: 248, turn: 28 }, ear: 18, tail: { c1x: 112, c1y: 258, c2x: 110, c2y: 274, x: 115, y: 288 } };
const ALERT = { head: { x: 250, y: 196, turn: -7 }, ear: -26, tail: { c1x: 102, c1y: 222, c2x: 112, c2y: 198, x: 136, y: 200 } };

// Grey and hungry on the left, warm and fed on the right. Muted on purpose:
// the pup should look content, not neon.
const PALETTE = {
  skyTop: ['#adb2b8', '#a7c3d4'],
  skyMid: ['#c6c9cc', '#c9d7de'],
  skyLow: ['#dcd8d3', '#eee0cd'],
  sun: ['#cdd1d4', '#f2e6c4'],
  ground: ['#cfcabf', '#a8bf9d'],
  coat: ['#a89f94', '#d6a76a'],
  coatDark: ['#8f887d', '#b78a55'],
  coatLight: ['#c2bbb1', '#e9d3af'],
  nose: ['#7a756f', '#4e4842'],
  collar: ['#9a9490', '#bf8098'],
  tag: ['#aaa6a1', '#d7bd82'],
  bowl: ['#9aa0a6', '#bd8090'],
  bowlDark: ['#828990', '#9f6577'],
  kibble: ['#a3978a', '#9b7654'],
  tongue: ['#b8a2a4', '#d6959f'],
};

const shade = (key, r) => mix(PALETTE[key][0], PALETTE[key][1], r);

export default function PupScene({ ratio, filling = false, still = false }) {
  const r = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ref = (name) => `${name}-${uid}`;

  const head = {
    x: lerp(TIRED.head.x, ALERT.head.x, r),
    y: lerp(TIRED.head.y, ALERT.head.y, r),
    turn: lerp(TIRED.head.turn, ALERT.head.turn, r),
  };
  const tail = Object.fromEntries(Object.keys(TIRED.tail).map((key) => [key, lerp(TIRED.tail[key], ALERT.tail[key], r)]));
  const ear = lerp(TIRED.ear, ALERT.ear, r);
  const joy = Math.max(0, (r - 0.6) / 0.4);
  const foodTop = lerp(295, 267, r);
  const coat = shade('coat', r);

  return <svg className={`journey-scene pup-scene ${still ? 'is-still' : ''} ${filling ? 'is-filling' : ''} ${r >= 0.999 ? 'is-happy' : ''}`}
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
      <clipPath id={ref('bowlClip')}>
        <path d="M286 266H354L347 295H293Z" />
      </clipPath>
    </defs>

    <rect width="440" height="330" fill={`url(#${ref('sky')})`} />

    <circle className="scene-halo" cx="356" cy="72" r="86" fill={`url(#${ref('sun')})`} opacity={0.35 + 0.55 * r} />
    <circle cx="356" cy="72" r={19 + 6 * r} fill={mix('#d6d9db', '#f8f0d8', r)} opacity={0.7 + 0.3 * r} />

    <g className="scene-motes" opacity={0.12 + 0.8 * r}>
      {[[62, 206, 0], [116, 152, 1.7], [336, 188, 0.9], [392, 130, 2.6], [274, 92, 3.4], [158, 66, 1.2]].map(([x, y, delay], index) =>
        <circle key={index} cx={x} cy={y} r={index % 2 ? 3.4 : 2.2} fill={mix('#dcd8d0', '#f4ecd2', r)}
          style={{ animationDelay: `${delay}s` }} />)}
    </g>

    {/* the same horizon the other journeys use, so the set feels like one place */}
    <path d="M0 268C88 246 148 262 222 258C300 254 360 240 440 262V330H0Z" fill={mix('#d8d3c8', '#b3cca6', r)} opacity="0.55" />
    <path d="M0 292C96 276 168 288 240 284C316 280 372 272 440 288V330H0Z" fill={shade('ground', r)} />
    <g opacity={Math.max(0, r - 0.45) * 1.8} stroke={mix('#a9b39a', '#7d9a72', r)} strokeWidth="3" strokeLinecap="round">
      {[[40, 300], [82, 307], [398, 302], [372, 311]].map(([x, y], index) =>
        <g key={index}><path d={`M${x} ${y + 12}V${y}`} /><path d={`M${x} ${y + 12}L${x - 8} ${y + 2}`} /><path d={`M${x} ${y + 12}L${x + 8} ${y + 1}`} /></g>)}
    </g>

    <ellipse cx="204" cy="298" rx="96" ry="12" fill="#2b2418" opacity={0.1 + 0.08 * r} />

    <g className="pup-bounce">
      {/* tail: limp and low when hungry, curled high and wagging when fed */}
      <g className="pup-tail" style={{ animationDuration: `${lerp(2.6, 0.4, r).toFixed(2)}s`, animationPlayState: r < 0.06 ? 'paused' : 'running' }}>
        <path d={`M124 246C${tail.c1x} ${tail.c1y} ${tail.c2x} ${tail.c2y} ${tail.x} ${tail.y}`}
          fill="none" stroke={coat} strokeWidth={13 + 3 * r} strokeLinecap="round" />
      </g>

      {/* back legs and paws */}
      <ellipse cx="196" cy="290" rx="20" ry="9" fill={shade('coatDark', r)} />
      <rect x="244" y="256" width="15" height="42" rx="7.5" fill={shade('coatDark', r)} />
      <ellipse cx="253" cy="294" rx="12" ry="7" fill={shade('coatDark', r)} />

      {/* body: overlapping masses in one fill read as a single silhouette */}
      <g fill={coat}>
        <ellipse cx="156" cy="256" rx="40" ry={40 + 2 * r} />
        <ellipse cx="200" cy="258" rx="46" ry={29 + 6 * r} />
        <ellipse cx="236" cy="256" rx="26" ry={26 + 4 * r} />
      </g>
      <ellipse cx="226" cy="266" rx="18" ry={17 + 3 * r} fill={shade('coatLight', r)} opacity="0.85" />

      {/* ribs showing through while he is still going hungry */}
      <g fill="none" stroke="#7f776c" strokeWidth="2.4" strokeLinecap="round"
        opacity={Math.max(0, 0.55 - r * 1.1)}>
        <path d="M182 240C186 252 184 262 180 270" />
        <path d="M196 238C200 250 198 261 194 269" />
        <path d="M210 239C214 250 212 260 208 268" />
      </g>

      {/* front legs */}
      <rect x="226" y="254" width="16" height="44" rx="8" fill={coat} />
      <ellipse cx="236" cy="296" rx="13" ry="7.5" fill={coat} />

      {/* neck */}
      <path d={`M228 256L${head.x - 6} ${head.y + 10}`} fill="none" stroke={coat} strokeWidth="30" strokeLinecap="round" />

      {/* collar and tag */}
      <g transform={`translate(${lerp(238, 234, r)} ${lerp(250, 232, r)}) rotate(${lerp(48, 6, r)})`}>
        <rect x="-15" y="-6" width="30" height="12" rx="4" fill={shade('collar', r)} />
        <circle cy="11" r={5 + 1.5 * r} fill={shade('tag', r)} />
      </g>

      <g transform={`translate(${head.x} ${head.y}) rotate(${head.turn})`}>
        {/* ear, drooping flat when tired and perked when fed */}
        <g className="pup-ear">
          <path transform={`translate(-8 -16) rotate(${ear})`} fill={shade('coatDark', r)}
            d="M0 0C-17 7 -21 27 -12 42C-3 54 11 49 13 35C15 22 10 7 0 0Z" />
        </g>

        {/* skull and muzzle */}
        <ellipse rx="30" ry="27" fill={coat} />
        <path d="M14 3C30 -6 51 -4 57 3C61 8 58 14 52 16C41 19 22 17 14 11Z" fill={shade('coatLight', r)} />
        <ellipse cx="55" cy="2" rx="7.5" ry="6.5" fill={shade('nose', r)} />

        {/* mouth, and a panting tongue once he is genuinely pleased */}
        <path d={`M38 13Q46 ${lerp(16, 21, r)} 52 15`} fill="none" stroke={shade('nose', r)} strokeWidth="2" strokeLinecap="round" />
        <g className="pup-tongue" opacity={joy}>
          <ellipse cx="45" cy={19 + 4 * joy} rx="7" ry={6 + 3 * joy} fill={shade('tongue', r)} />
        </g>

        {/* eyes crossfade from a tired squint to a wide-awake shine */}
        <g opacity={Math.max(0, 1 - r * 1.6)}>
          <path d="M9 -8Q17 0 25 -8" fill="none" stroke={shade('nose', r)} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M6 -20Q14 -25 22 -19" fill="none" stroke={shade('nose', r)} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </g>
        <g className="pup-eye" opacity={Math.max(0, r * 1.6 - 0.6)}>
          <ellipse cx="17" cy="-9" rx="6.5" ry="7.5" fill="#fbfbfa" />
          <circle cx="18" cy="-8" r="4.2" fill="#3f3a36" />
          <circle cx="19.6" cy="-10" r="1.7" fill="#fbfbfa" />
          <path d="M9 -21Q17 -25 25 -20" fill="none" stroke={shade('nose', r)} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        </g>
      </g>
    </g>

    {/* the bowl, filling up meal by meal */}
    <g>
      <path d="M286 266H354L347 295H293Z" fill={shade('bowlDark', r)} />
      <g clipPath={`url(#${ref('bowlClip')})`}>
        <rect x="284" y={foodTop} width="72" height="40" fill={shade('kibble', r)} />
        <g opacity={r} fill={mix('#8d8175', '#806046', r)}>
          {[[302, 6], [316, -3], [330, 5], [324, 12], [308, 14]].map(([x, dy], index) =>
            <circle key={index} cx={x} cy={foodTop + 6 + dy} r="4" />)}
        </g>
      </g>
      <ellipse cx="320" cy="266" rx="37" ry="8.5" fill={shade('bowl', r)} stroke={shade('bowlDark', r)} strokeWidth="2" />
      <ellipse cx="320" cy="266" rx="30" ry="5.5" fill={shade('kibble', r)} opacity={Math.max(0, r * 1.6 - 0.6)} />
      <g opacity={joy}>
        <ellipse cx="320" cy={262 - 4 * joy} rx={14 + 16 * joy} ry={4 + 6 * joy} fill={shade('kibble', r)} />
        {[[310, -2], [322, -6], [331, 0]].map(([x, dy], index) =>
          <circle key={index} cx={x} cy={258 - 4 * joy + dy} r="4" fill={mix('#8d8175', '#806046', r)} />)}
      </g>
      <path d="M292 262Q300 256 310 255" fill="none" stroke="#f4f1ec" strokeWidth="2.5" strokeLinecap="round" opacity={0.12 + 0.4 * r} />
    </g>

    {/* kibble raining in while the scene fills up to its current progress */}
    <g className="pup-kibble" fill={shade('kibble', r)}>
      {[306, 320, 334, 313, 327].map((x, index) =>
        <circle key={x} cx={x} cy="58" r="5" style={{ animationDelay: `${index * 0.32}s` }} />)}
    </g>

    {/* hearts for a very happy dog */}
    <g className="pup-hearts" opacity={joy} fill={mix('#d4a6b0', '#cb8ba0', r)}>
      {[[286, 176, 0], [318, 150, 0.9], [258, 142, 1.8]].map(([x, y, delay], index) =>
        <path key={index} style={{ animationDelay: `${delay}s` }}
          d={`M${x} ${y + 11}C${x - 13} ${y + 1} ${x - 10} ${y - 11} ${x} ${y - 4}C${x + 10} ${y - 11} ${x + 13} ${y + 1} ${x} ${y + 11}Z`} />)}
    </g>

    <g className="scene-sparkles" opacity={joy} fill="#f4ead3">
      {[[150, 100], [300, 86], [206, 54], [372, 168], [112, 158]].map(([x, y], index) =>
        <path key={index} d={`M${x} ${y - 8}L${x + 2.6} ${y - 2.6}L${x + 8} ${y}L${x + 2.6} ${y + 2.6}L${x} ${y + 8}L${x - 2.6} ${y + 2.6}L${x - 8} ${y}L${x - 2.6} ${y - 2.6}Z`}
          style={{ animationDelay: `${index * 0.42}s` }} />)}
    </g>
  </svg>;
}
