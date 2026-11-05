import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ROULETTE_WHEEL_IMAGE } from '@/lib/rouletteAssets';

export const SPIN_DURATION = 4600;

const SPIN_EASE = [0.12, 0.72, 0.08, 1];
const HUB_SIZE = 36; // % du plateau : le disque doré central qui tourne

/**
 * Le visuel de la roue reste un plateau parfaitement statique (forme et
 * perspective figées). Seul le mécanisme intérieur tourne : le disque doré
 * central, balayé par un halo lumineux, pendant que la bille orbite puis
 * se pose sous le repère.
 */
export default function RouletteImageWheel({ spinToken = 0, onDone }) {
  const [spinning, setSpinning] = useState(false);
  const [hubRotation, setHubRotation] = useState(0);
  const [sweepRotation, setSweepRotation] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!spinToken) return undefined;

    setSpinning(true);
    setHubRotation((current) => current + 360 * 4);
    setSweepRotation((current) => current + 360 * 3);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSpinning(false);
      onDone?.();
    }, SPIN_DURATION);

    return () => clearTimeout(timerRef.current);
  }, [spinToken, onDone]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px] select-none">
      <div
        className="pointer-events-none absolute inset-8 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.28), transparent 68%)', filter: 'blur(26px)' }}
      />

      {/* Plateau fixe : aucune transformation, perspective intacte. */}
      <img
        src={ROULETTE_WHEEL_IMAGE}
        alt="Roue de roulette européenne dorée"
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain"
      />

      {/* Mécanisme intérieur : disque doré en rotation douce. */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: `${HUB_SIZE}%`,
          height: `${HUB_SIZE}%`,
          marginLeft: `-${HUB_SIZE / 2}%`,
          marginTop: `-${HUB_SIZE / 2}%`,
          backgroundImage: `url(${ROULETTE_WHEEL_IMAGE})`,
          backgroundSize: `${(100 / HUB_SIZE) * 100}% auto`,
          backgroundPosition: 'center',
          WebkitMaskImage: 'radial-gradient(circle, #000 44%, transparent 70%)',
          maskImage: 'radial-gradient(circle, #000 44%, transparent 70%)',
          willChange: 'transform',
        }}
        animate={{ rotate: hubRotation }}
        transition={{ duration: SPIN_DURATION / 1000, ease: SPIN_EASE }}
      />

      {/* Balayage lumineux du tirage, masqué sur l'ellipse du plateau. */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{ clipPath: 'ellipse(50% 33% at 50% 50%)' }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.14) 18deg, transparent 58deg, transparent 300deg, rgba(168,85,247,0.16) 338deg, transparent 360deg)',
          }}
          animate={{ rotate: sweepRotation, opacity: spinning ? 1 : 0 }}
          transition={{
            rotate: { duration: SPIN_DURATION / 1000, ease: SPIN_EASE },
            opacity: { duration: 0.45 },
          }}
        />
      </div>

      {/* Repère doré : la bille s'y arrête. */}
      <div className="pointer-events-none absolute left-1/2 top-[16%] z-20 -translate-x-1/2">
        <div
          className="h-0 w-0"
          style={{
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '17px solid #f5c451',
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.75)) drop-shadow(0 0 6px rgba(245,196,81,0.6))',
          }}
        />
      </div>

      {/* Bille : elle orbite pendant le tirage puis se pose sous le repère. */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        animate={{ rotate: spinning ? -1440 : 0 }}
        transition={{ duration: SPIN_DURATION / 1000, ease: SPIN_EASE }}
      >
        <span
          className="absolute left-1/2 top-[19.5%] h-3 w-3 -translate-x-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle at 33% 28%, #ffffff, #d8d8d2 58%, #8b8a85)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.65), 0 0 10px rgba(255,255,255,0.4)',
          }}
        />
      </motion.div>
    </div>
  );
}