import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { ROULETTE_WHEEL_IMAGE } from '@/lib/rouletteAssets';

export const SPIN_DURATION = 4000;

const TAU = Math.PI * 2;
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

// Voile radial (alpha) : supprime les coins du rectangle de l'image sans
// découper la roue, pour que seule la roue tourne en 3D.
function buildAlphaMap() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);

  const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.42, size / 2, size / 2, size * 0.55);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function Plate({ spinToken, targetNumber, onDone }) {
  const meshRef = useRef(null);
  const texture = useLoader(THREE.TextureLoader, ROULETTE_WHEEL_IMAGE);
  const alphaMap = useMemo(buildAlphaMap, []);

  const animation = useRef({ startedAt: 0, from: 0, to: 0, active: false });
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }, [texture]);

  useEffect(() => () => alphaMap.dispose(), [alphaMap]);

  useEffect(() => {
    if (!spinToken || !meshRef.current) return undefined;

    const from = meshRef.current.rotation.z;
    const number = Number(targetNumber) || 0;
    // Cinq tours complets puis arrêt sur un angle propre au numéro tiré.
    const to = from - TAU * 5 - (number / 37) * TAU;

    animation.current = { startedAt: performance.now(), from, to, active: true };

    const timer = setTimeout(() => {
      animation.current.active = false;
      if (meshRef.current) meshRef.current.rotation.z = animation.current.to;
      doneRef.current?.();
    }, SPIN_DURATION);

    return () => clearTimeout(timer);
  }, [spinToken, targetNumber]);

  useFrame(() => {
    const state = animation.current;
    if (!state.active || !meshRef.current) return;

    const progress = Math.min(1, (performance.now() - state.startedAt) / SPIN_DURATION);
    meshRef.current.rotation.z = state.from + (state.to - state.from) * easeOutQuart(progress);
  });

  return (
    <group rotation={[-0.26, 0, 0]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[2, 4 / 3]} />
        <meshBasicMaterial map={texture} alphaMap={alphaMap} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function RouletteImageWheel({ spinToken = 0, targetNumber = 0, onDone }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px] select-none">
      <div
        className="pointer-events-none absolute inset-10 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3), transparent 68%)', filter: 'blur(28px)' }}
      />

      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 2.65], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Plate spinToken={spinToken} targetNumber={targetNumber} onDone={onDone} />
        </Suspense>
      </Canvas>
    </div>
  );
}