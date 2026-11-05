import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { WHEEL_ORDER } from '@/lib/rouletteTable';
import { ROULETTE_WHEEL_IMAGE } from '@/lib/rouletteAssets';

export const SPIN_DURATION = 4600;

const POCKET_ANGLE = 360 / WHEEL_ORDER.length;
const SPIN_EASE = [0.12, 0.72, 0.08, 1];

/**
 * Roue dorée fournie en visuel : l'image pivote avec une inertie (ease-out)
 * jusqu'à amener le numéro gagnant sous le repère doré, où la bille se pose.
 */
export default function RouletteImageWheel({ targetNumber = null, spinToken = 0, onDone }) {
  const [rotation, setRotation] = useState(0);
  const [ballSpinning, setBallSpinning] = useState(false);
  const rotationRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!spinToken || targetNumber === null || targetNumber === undefined) return undefined;
    const index = WHEEL_ORDER.indexOf(Number(targetNumber));
    if (index < 0) return undefined;

    const current = rotationRef.current;
    const startAngle = ((current % 360) + 360) % 360;
    const winAngle = (360 - index * POCKET_ANGLE) % 360;
    const delta = ((winAngle - startAngle + 360) % 360) + 360 * 5;

    rotationRef.current = current + delta;
    setRotation(rotationRef.current);
    setBallSpinning(true);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setBallSpinning(false);
      onDone?.();
    }, SPIN_DURATION);

    return () => clearTimeout(timerRef.current);
  }, [spinToken, targetNumber, onDone]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px] select-none">
      <div
        className="pointer-events-none absolute inset-6 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.30), transparent 68%)', filter: 'blur(26px)' }}
      />

      <motion.div
        className="absolute inset-0 overflow-hidden rounded-full"
        animate={{ rotate: rotation }}
        transition={{ duration: SPIN_DURATION / 1000, ease: SPIN_EASE }}
        style={{ willChange: 'transform' }}
      >
        <img
          src={ROULETTE_WHEEL_IMAGE}
          alt="Roue de roulette européenne dorée"
          draggable={false}
          className="h-full w-full scale-[0.96] object-contain"
        />
      </motion.div>

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

      {/* Bille : elle orbite pendant le lancer puis se pose sous le repère. */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        animate={{ rotate: ballSpinning ? -1440 : 0 }}
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