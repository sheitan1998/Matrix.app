import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WHEEL_ORDER, rouletteColor } from '@/lib/rouletteTable';

const SIZE = 400;
const C = SIZE / 2;
const STEP = 360 / WHEEL_ORDER.length;
const SPIN_DURATION = 4200;
const POCKET_INNER = 74;
const POCKET_OUTER = 150;
const NUMBER_RADIUS = 122;
const TRACK_RADIUS = 169;
const BALL_ANGLE = -52;
const BALL_RADIUS = 8.6;

const polar = (radius, angle) => {
  const rad = (angle * Math.PI) / 180;
  return [C + radius * Math.cos(rad), C + radius * Math.sin(rad)];
};

const wedgePath = (start, end) => {
  const [x1, y1] = polar(POCKET_OUTER, start);
  const [x2, y2] = polar(POCKET_OUTER, end);
  const [x3, y3] = polar(POCKET_INNER, end);
  const [x4, y4] = polar(POCKET_INNER, start);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${POCKET_OUTER} ${POCKET_OUTER} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${POCKET_INNER} ${POCKET_INNER} 0 0 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
};

const POCKET_FILL = {
  red: 'url(#roulettePocketRed)',
  black: 'url(#roulettePocketBlack)',
  green: 'url(#roulettePocketGreen)',
};

const SLICES = WHEEL_ORDER.map((number, index) => {
  const start = -90 + index * STEP;
  const mid = start + STEP / 2;
  return {
    number,
    start,
    end: start + STEP,
    mid,
    fill: POCKET_FILL[rouletteColor(number)],
  };
});

const [BALL_X, BALL_Y] = polar(TRACK_RADIUS, BALL_ANGLE);

export default function RouletteLuxuryWheel({ spinToken, targetNumber, onDone }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const rotationRef = useRef(0);
  const timer = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!spinToken) return;
    const index = WHEEL_ORDER.indexOf(Number(targetNumber));
    if (index < 0) return;

    // The marker sits at -90° (top). Rotating the rotor by θ moves the pocket
    // centre (start + step/2) to θ + centre, so θ = -90 - centre.
    const desired = -90 - SLICES[index].mid;
    const base = rotationRef.current + 5 * 360;
    const delta = (((desired % 360) + 360) % 360 - (((base % 360) + 360) % 360) + 360) % 360;
    const next = base + delta;

    rotationRef.current = next;
    setSpinning(true);
    setRotation(next);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSpinning(false);
      doneRef.current?.();
    }, SPIN_DURATION);
  }, [spinToken, targetNumber]);

  const rotorStyle = useMemo(
    () => ({
      transform: `rotate(${rotation}deg)`,
      transformOrigin: `${C}px ${C}px`,
      transformBox: 'view-box',
      transition: spinning ? `transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.7, 0.12, 1)` : 'none',
      willChange: 'transform',
    }),
    [rotation, spinning],
  );

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px] select-none">
      <div
        className="pointer-events-none absolute inset-6 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(245,196,81,0.22), rgba(139,92,246,0.24) 54%, transparent 74%)',
          filter: 'blur(34px)',
        }}
      />

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="relative h-full w-full"
        role="img"
        aria-label="Roue de roulette en acajou et or"
        style={{ filter: 'drop-shadow(0 20px 42px rgba(0,0,0,0.55))' }}
      >
        <defs>
          <linearGradient id="rouletteWood" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#9a5527" />
            <stop offset="24%" stopColor="#703819" />
            <stop offset="48%" stopColor="#8d4a1f" />
            <stop offset="72%" stopColor="#582a11" />
            <stop offset="100%" stopColor="#351707" />
          </linearGradient>
          <linearGradient id="rouletteGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff4c9" />
            <stop offset="20%" stopColor="#eccd77" />
            <stop offset="46%" stopColor="#b9862c" />
            <stop offset="70%" stopColor="#f6e0a0" />
            <stop offset="100%" stopColor="#94651a" />
          </linearGradient>
          <linearGradient id="rouletteGoldSoft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e9c977" />
            <stop offset="100%" stopColor="#a9791f" />
          </linearGradient>

          <linearGradient id="roulettePocketRed" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#c52a3c" />
            <stop offset="55%" stopColor="#94182a" />
            <stop offset="100%" stopColor="#650d1b" />
          </linearGradient>
          <linearGradient id="roulettePocketBlack" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#2a2a33" />
            <stop offset="55%" stopColor="#15151b" />
            <stop offset="100%" stopColor="#08080b" />
          </linearGradient>
          <linearGradient id="roulettePocketGreen" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#189a5c" />
            <stop offset="55%" stopColor="#0d7143" />
            <stop offset="100%" stopColor="#07502f" />
          </linearGradient>

          <radialGradient id="rouletteHub" cx="38%" cy="30%" r="82%">
            <stop offset="0%" stopColor="#33173f" />
            <stop offset="55%" stopColor="#180c21" />
            <stop offset="100%" stopColor="#07040a" />
          </radialGradient>
          <radialGradient id="roulettePearl" cx="34%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="52%" stopColor="#f6eedd" />
            <stop offset="100%" stopColor="#b6ab96" />
          </radialGradient>

          <filter id="rouletteWoodGrain" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.5" numOctaves="4" seed="17" result="noise" />
            <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
            <feComponentTransfer in="mono" result="grain">
              <feFuncA type="linear" slope="0.55" />
            </feComponentTransfer>
            <feComposite in="grain" in2="SourceGraphic" operator="in" result="grainMasked" />
            <feBlend in="SourceGraphic" in2="grainMasked" mode="overlay" />
          </filter>
        </defs>

        {/* Bezel extérieur doré + structure en bois noble */}
        <circle cx={C} cy={C} r="197" fill="url(#rouletteGold)" />
        <circle cx={C} cy={C} r="193.5" fill="#160a04" />
        <circle cx={C} cy={C} r="192" fill="url(#rouletteWood)" filter="url(#rouletteWoodGrain)" />
        <circle cx={C} cy={C} r="190" fill="none" stroke="url(#rouletteGold)" strokeWidth="1.6" opacity="0.85" />
        <circle cx={C} cy={C} r="187.5" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />

        {/* Piste creusée accueillant la bille */}
        <circle cx={C} cy={C} r="170" fill="none" stroke="#170b03" strokeWidth="27" />
        <circle cx={C} cy={C} r="170" fill="none" stroke="url(#rouletteWood)" strokeWidth="24" opacity="0.9" />
        <circle cx={C} cy={C} r="183.5" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="4" />
        <circle cx={C} cy={C} r="156.5" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="4" />
        <circle cx={C} cy={C} r="170" fill="none" stroke="rgba(255,232,180,0.16)" strokeWidth="1.2" />

        {/* Filet d'or entre la piste et le cylindre */}
        <circle cx={C} cy={C} r="153" fill="none" stroke="url(#rouletteGold)" strokeWidth="3" />

        {/* Cylindre rotatif : cases, séparateurs et numéros */}
        <g style={rotorStyle}>
          {SLICES.map((slice) => (
            <path
              key={slice.number}
              d={wedgePath(slice.start, slice.end)}
              fill={slice.fill}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth="0.4"
            />
          ))}

          {SLICES.map((slice) => {
            const [x1, y1] = polar(POCKET_INNER, slice.start);
            const [x2, y2] = polar(POCKET_OUTER, slice.start);
            const [px, py] = polar(145, slice.start);
            return (
              <g key={`sep-${slice.number}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#rouletteGoldSoft)"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
                <circle cx={px} cy={py} r="1.5" fill="url(#rouletteGold)" opacity="0.9" />
              </g>
            );
          })}

          <circle cx={C} cy={C} r={POCKET_OUTER} fill="none" stroke="url(#rouletteGold)" strokeWidth="2.2" />
          <circle cx={C} cy={C} r={POCKET_INNER} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="3" />

          {SLICES.map((slice) => {
            const [x, y] = polar(NUMBER_RADIUS, slice.mid);
            return (
              <text
                key={`num-${slice.number}`}
                x={x}
                y={y}
                transform={`rotate(${slice.mid + 90} ${x} ${y})`}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="11.5"
                fontWeight="800"
                fontFamily="Inter, system-ui, sans-serif"
                fill="#f9edcd"
                stroke="rgba(28,12,2,0.6)"
                strokeWidth="1.7"
                paintOrder="stroke"
              >
                {slice.number}
              </text>
            );
          })}
        </g>

        {/* Moyeu central fixe */}
        <circle cx={C} cy={C} r="76" fill="url(#rouletteGold)" />
        <circle cx={C} cy={C} r="71" fill="#0d0709" />
        <circle cx={C} cy={C} r="66" fill="url(#rouletteHub)" />
        <circle cx={C} cy={C} r="58" fill="none" stroke="url(#rouletteGold)" strokeWidth="1" opacity="0.55" />

        <g>
          <path d="M200 156 L228 200 L200 244 L172 200 Z" fill="url(#rouletteGold)" opacity="0.94" />
          <path d="M200 170 L216 200 L200 230 L184 200 Z" fill="#120a16" />
          <circle cx={C} cy={C} r="6.5" fill="#a855f7" />
          <circle cx={C} cy={C} r="2.6" fill="#f3e3ff" />
        </g>

        {/* Bille fixe sur la piste */}
        <g>
          <ellipse
            cx={BALL_X + 1.6}
            cy={BALL_Y + 3}
            rx={BALL_RADIUS + 1.6}
            ry={BALL_RADIUS * 0.85}
            fill="rgba(0,0,0,0.55)"
          />
          <circle
            cx={BALL_X}
            cy={BALL_Y}
            r={BALL_RADIUS}
            fill="url(#roulettePearl)"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="0.4"
          />
          <circle cx={BALL_X - 2.7} cy={BALL_Y - 2.9} r="2.1" fill="#ffffff" opacity="0.95" />
          <circle cx={BALL_X + 2.5} cy={BALL_Y + 2.7} r="1.6" fill="#f0c977" opacity="0.5" />
        </g>

        {/* Repère doré du numéro gagnant */}
        <path d="M200 20 L207 33 L200 30 L193 33 Z" fill="url(#rouletteGold)" />
        <path
          d="M 200 6 A 194 194 0 0 1 332 58"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}