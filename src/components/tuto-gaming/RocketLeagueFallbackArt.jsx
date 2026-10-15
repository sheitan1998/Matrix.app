import React, { useId } from 'react';
import { rocketFallbackColors } from './rocketLeagueImages';
import { rocketVehicleProfile } from './rocketLeagueVisualProfile';

const BODY_PATHS = {
  boxy: 'M112 236 145 174 224 142 406 145 485 191 526 242 501 260 137 260Z',
  sport: 'M104 239 158 205 235 158 401 164 482 207 536 242 508 260 130 260Z',
  rally: 'M110 239 154 190 238 151 402 156 478 196 529 242 505 260 133 260Z',
};

const WINDOW_PATHS = {
  boxy: 'M227 153 399 156 445 188 203 187Z',
  sport: 'M242 169 396 173 449 202 197 202Z',
  rally: 'M240 162 395 167 442 195 202 195Z',
};

function Wheel({ cx, cy, radius, spokes }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={radius + 8} fill="#020617" stroke="#a78bfa" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={radius} fill="#111827" stroke="#e2e8f0" strokeWidth="3" />
      {Array.from({ length: spokes }, (_, index) => {
        const angle = (Math.PI * 2 * index) / spokes;
        return (
          <line
            key={index}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * (radius - 7)}
            y2={cy + Math.sin(angle) * (radius - 7)}
            stroke="#c4b5fd"
            strokeWidth="3"
          />
        );
      })}
      <circle cx={cx} cy={cy} r="7" fill="#f8fafc" />
    </g>
  );
}

export default function RocketLeagueFallbackArt({
  label,
  bodyName,
  wheelName,
  accent,
}) {
  const colors = rocketFallbackColors(label, accent);
  const profile = rocketVehicleProfile(bodyName || label, wheelName || label);
  const gradientId = `rocket-${useId().replace(/:/g, '')}`;
  return (
    <div className="absolute inset-0 flex flex-col">
      <svg
        aria-hidden="true"
        viewBox="0 0 640 330"
        preserveAspectRatio="xMidYMid meet"
        className="min-h-0 flex-1"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={colors.primary} />
            <stop offset="1" stopColor={colors.secondary} />
          </linearGradient>
          <radialGradient id={`${gradientId}-bg`} cx=".25" cy=".2">
            <stop stopColor={colors.primary} stopOpacity=".48" />
            <stop offset="1" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          <filter id={`${gradientId}-glow`}>
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <rect width="640" height="330" fill="#020617" />
        <rect width="640" height="330" fill={`url(#${gradientId}-bg)`} />
        <path d="M0 273 640 228V330H0Z" fill="#0f172a" />
        <path d="M0 274 640 229" stroke="#7c3aed" strokeOpacity=".45" strokeWidth="3" />
        <g stroke="#334155" strokeOpacity=".55">
          {Array.from({ length: 9 }, (_, index) => (
            <line key={index} x1={index * 80} y1="330" x2={320 + (index - 4) * 28} y2="230" />
          ))}
        </g>
        <ellipse cx="320" cy="267" rx="232" ry="31" fill="#000" opacity=".7" filter={`url(#${gradientId}-glow)`} />
        <path d={BODY_PATHS[profile.family]} fill={`url(#${gradientId})`} stroke="#f8fafc" strokeWidth="5" strokeLinejoin="round" />
        <path d={WINDOW_PATHS[profile.family]} fill="#0f172a" stroke="#93c5fd" strokeWidth="4" opacity=".95" />
        <path
          d={`M${168 + profile.stripeOffset} 211 430 205 469 226 190 232Z`}
          fill="#fff"
          opacity=".18"
        />
        <path d="M121 231 95 236 87 252 133 253" fill={colors.secondary} stroke="#f8fafc" strokeWidth="4" />
        <path d="M501 224 539 229 550 244 514 249" fill="#f8fafc" opacity=".9" />
        <Wheel cx="193" cy="252" radius={profile.wheelRadius} spokes={profile.wheelSpokes} />
        <Wheel cx="452" cy="252" radius={profile.wheelRadius} spokes={profile.wheelSpokes} />
        <circle cx="536" cy="215" r="22" fill={colors.primary} opacity=".28" filter={`url(#${gradientId}-glow)`} />
      </svg>
      <span className="truncate border-t border-white/10 bg-slate-950/85 px-3 py-1.5 text-center text-[11px] font-semibold text-white">
        {label || 'Rendu MATRIX'}
      </span>
    </div>
  );
}
