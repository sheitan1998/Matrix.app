/* eslint-disable react/no-unknown-property */
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const MODEL_URL = '/models/roulette.glb';
const SPIN_DURATION = 4200;
const TAU = Math.PI * 2;
const WHEEL_RADIUS = 5;
const BALL_SIZE = 0.18;

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

function Scene({ spinToken, targetNumber, onDone }) {
  const { gl, scene: view } = useThree();
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => scene.clone(true), [scene]);
  const spinRef = useRef(null);
  const ballRef = useRef(null);
  const ball = useRef({ radius: WHEEL_RADIUS * 0.62, y: 0.35 });
  const anim = useRef({ active: false, finished: true, start: 0, angle: 0, fromWheel: 0, toWheel: 0, fromBall: 0, toBall: 0 });
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const [fit, setFit] = useState(null);

  // Environnement studio : indispensable pour que l'or métallique du modèle réfléchisse.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    view.environment = env.texture;
    return () => {
      view.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, view]);

  // Cadrage : on recale la roue sur l'origine à partir de son propre volume.
  useEffect(() => {
    model.traverse((o) => {
      if (o.name === 'Object_36') o.visible = false; // bille d'origine, remplacée par la bille animée
    });

    const rotor = new THREE.Box3();
    model.traverse((o) => {
      if (o.isMesh && (o.name || '').toUpperCase().includes('ROULETTE')) rotor.expandByObject(o);
    });
    const box = rotor.isEmpty() ? new THREE.Box3().setFromObject(model) : rotor;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.z) / 2 || 1;
    const scale = WHEEL_RADIUS / radius;

    setFit({ center, scale });
    ball.current.y = (box.max.y - center.y) * scale + BALL_SIZE;
    ball.current.radius = WHEEL_RADIUS * 0.62;
  }, [model]);

  useEffect(() => {
    if (!spinRef.current || !spinToken) return;
    const from = spinRef.current.rotation.y;
    const to = from - TAU * 5 - ((Number(targetNumber) || 0) / 37) * TAU;
    const a = anim.current;
    a.active = true;
    a.finished = false;
    a.start = performance.now();
    a.fromWheel = from;
    a.toWheel = to;
    a.fromBall = a.angle;
    a.toBall = a.angle + TAU * 7;
    a.angle = a.toBall;
  }, [spinToken, targetNumber]);

  useFrame(() => {
    const a = anim.current;
    const b = ballRef.current;

    if (!a.active) {
      if (b) {
        b.position.set(Math.cos(a.angle) * ball.current.radius, ball.current.y, Math.sin(a.angle) * ball.current.radius);
      }
      return;
    }

    const t = Math.min(1, (performance.now() - a.start) / SPIN_DURATION);
    const eased = easeOutQuart(t);

    if (spinRef.current) {
      spinRef.current.rotation.y = a.fromWheel + (a.toWheel - a.fromWheel) * eased;
    }

    if (b) {
      const angle = a.fromBall + (a.toBall - a.fromBall) * eased;
      const drop = Math.max(0, (t - 0.72) / 0.28);
      const radius = ball.current.radius * (1 - drop * 0.22);
      b.position.set(Math.cos(angle) * radius, ball.current.y - drop * 0.045, Math.sin(angle) * radius);
    }

    if (t >= 1 && !a.finished) {
      a.finished = true;
      a.active = false;
      doneRef.current?.();
    }
  });

  return (
    <group>
      {fit && (
        <group
          scale={fit.scale}
          position={[-fit.center.x * fit.scale, -fit.center.y * fit.scale, -fit.center.z * fit.scale]}
        >
          <group ref={spinRef}>
            <primitive object={model} />
          </group>

          <mesh ref={ballRef}>
            <sphereGeometry args={[BALL_SIZE, 24, 24]} />
            <meshStandardMaterial
              color="#fff6e2"
              metalness={0.45}
              roughness={0.18}
              emissive="#ffdda0"
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

function LoadingTable() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400/30 border-t-amber-300" />
        <p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
          Chargement de la table
        </p>
      </div>
    </Html>
  );
}

export default function Roulette3DWheel(props) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px] select-none">
      <div
        className="pointer-events-none absolute inset-8 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.34), rgba(230,192,105,0.08) 58%, transparent 72%)',
          filter: 'blur(30px)',
        }}
      />
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 10, 11], fov: 45, near: 0.1, far: 200 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.15} />
        <directionalLight position={[6, 12, 7]} intensity={2.6} />
        <directionalLight position={[-8, 7, -6]} intensity={1.3} color="#b06bff" />
        <pointLight position={[0, 7, -8]} intensity={45} color="#c084fc" />
        <pointLight position={[7, 4, 8]} intensity={22} color="#f5c451" />
        <Suspense fallback={<LoadingTable />}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);