import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ROULETTE_WHEEL_IMAGE } from '@/lib/rouletteAssets';

const SPIN_DURATION = 4000;
const TAU = Math.PI * 2;
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

/**
 * Roue de la fortune 3D (plateau incliné) — scène Three.js pilotée
 * directement, sans réconciliateur React : un seul rendu continu, aucune
 * ré-application de propriétés, donc aucun risque de crash au montage.
 */
export default function RouletteImageWheel({ spinToken = 0, targetNumber = 0, onDone }) {
  const mountRef = useRef(null);
  const wheelRef = useRef(null);
  const animRef = useRef({ active: false, start: 0, from: 0, to: 0 });
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 2.65;

    const texture = new THREE.TextureLoader().load(ROULETTE_WHEEL_IMAGE);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const geometry = new THREE.PlaneGeometry(2, 4 / 3);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });

    const wheel = new THREE.Mesh(geometry, material);
    scene.add(wheel);
    wheelRef.current = wheel;

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let frameId = 0;
    const render = () => {
      frameId = requestAnimationFrame(render);
      const anim = animRef.current;
      if (anim.active) {
        const progress = Math.min(1, (performance.now() - anim.start) / SPIN_DURATION);
        wheel.rotation.z = anim.from + (anim.to - anim.from) * easeOutQuart(progress);
      }
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      wheelRef.current = null;
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!spinToken) return undefined;
    const wheel = wheelRef.current;
    if (!wheel) return undefined;

    const from = wheel.rotation.z;
    // Cinq tours complets, puis l'arrêt tombe sur le numéro tiré.
    const to = from - TAU * 5 - ((Number(targetNumber) || 0) / 37) * TAU;
    animRef.current = { active: true, start: performance.now(), from, to };

    const timer = setTimeout(() => {
      animRef.current.active = false;
      wheel.rotation.z = to;
      doneRef.current?.();
    }, SPIN_DURATION);

    return () => clearTimeout(timer);
  }, [spinToken, targetNumber]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px] select-none">
      <div
        className="pointer-events-none absolute inset-10 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.3), transparent 68%)',
          filter: 'blur(28px)',
        }}
      />
      <div ref={mountRef} className="relative h-full w-full" />
    </div>
  );
}