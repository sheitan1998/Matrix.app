import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ROULETTE_WHEEL_IMAGE } from '@/lib/rouletteAssets';

export const SPIN_DURATION = 4000;

const TAU = Math.PI * 2;
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

// Voile radial : rend transparents les coins du rectangle de la texture,
// sans découper la roue. Aucun calque n'est ajouté par-dessus le disque.
function buildAlphaMap() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.42,
    size / 2,
    size / 2,
    size * 0.55,
  );
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function Plate({ spinToken = 0, targetNumber = 0, onDone }) {
  const animation = useRef({ startedAt: 0, from: 0, to: 0, active: false });
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // Objets Three.js construits une seule fois : rien n'est ré-appliqué au
  // rendu, donc aucune désynchronisation possible entre React et la scène.
  const scene = useMemo(() => {
    const texture = new THREE.TextureLoader().load(ROULETTE_WHEEL_IMAGE);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    const alphaMap = buildAlphaMap();
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaMap,
      transparent: true,
      toneMapped: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 4 / 3), material);
    const group = new THREE.Group();
    group.rotation.x = -0.26; // inclinaison du plateau
    group.add(mesh);

    return { group, mesh, material, texture, alphaMap, geometry: mesh.geometry };
  }, []);

  useEffect(
    () => () => {
      scene.geometry.dispose();
      scene.material.dispose();
      scene.texture.dispose();
      scene.alphaMap.dispose();
    },
    [scene],
  );

  useEffect(() => {
    if (!spinToken) return undefined;

    const number = Number(targetNumber) || 0;
    const from = scene.mesh.rotation.z;
    // Cinq tours complets, puis un arrêt propre lié au numéro tiré.
    const to = from - TAU * 5 - (number / 37) * TAU;

    animation.current = { startedAt: performance.now(), from, to, active: true };

    const timer = setTimeout(() => {
      animation.current.active = false;
      scene.mesh.rotation.z = to;
      doneRef.current?.();
    }, SPIN_DURATION);

    return () => clearTimeout(timer);
  }, [spinToken, targetNumber, scene]);

  useFrame(() => {
    const state = animation.current;
    if (!state.active) return;

    const progress = Math.min(1, (performance.now() - state.startedAt) / SPIN_DURATION);
    scene.mesh.rotation.z = state.from + (state.to - state.from) * easeOutQuart(progress);
  });

  return <primitive object={scene.group} />;
}

export default function RouletteImageWheel({ spinToken = 0, targetNumber = 0, onDone }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px] select-none">
      <div
        className="pointer-events-none absolute inset-10 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.3), transparent 68%)',
          filter: 'blur(28px)',
        }}
      />

      <Canvas
        dpr={[1, 2]}
        flat
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 2.65], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <Plate spinToken={spinToken} targetNumber={targetNumber} onDone={onDone} />
      </Canvas>
    </div>
  );
}