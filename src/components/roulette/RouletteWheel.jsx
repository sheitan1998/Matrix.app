import React, { useEffect, useRef } from 'react';
import { WHEEL_ORDER, isRedNumber } from '@/lib/rouletteTable';

const SLICE = (Math.PI * 2) / 37;
const TAU = Math.PI * 2;

/**
 * Canvas roulette wheel. The parent applies the 3D perspective transform,
 * while the wheel rotation and the ball are animated here.
 */
export default function RouletteWheel({ targetNumber = null, spinToken = 0, onDone }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const frameRef = useRef(0);

  const draw = (rotation, ball) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.36;
    const rimR = size * 0.455;

    ctx.clearRect(0, 0, size, size);

    // Outer mahogany bowl
    const bowl = ctx.createRadialGradient(cx, cy - size * 0.08, R * 0.4, cx, cy, rimR);
    bowl.addColorStop(0, '#3a2410');
    bowl.addColorStop(0.55, '#7a4b1d');
    bowl.addColorStop(0.86, '#c08a3e');
    bowl.addColorStop(1, '#4a2b10');
    ctx.beginPath();
    ctx.arc(cx, cy, rimR, 0, TAU);
    ctx.fillStyle = bowl;
    ctx.fill();

    // Polished brass band
    ctx.beginPath();
    ctx.arc(cx, cy, rimR * 0.93, 0, TAU);
    ctx.strokeStyle = '#e6c069';
    ctx.lineWidth = size * 0.012;
    ctx.stroke();

    // Ball track
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.22, 0, TAU);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = size * 0.05;
    ctx.stroke();

    // Number ring
    const ringGrad = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R);
    ringGrad.addColorStop(0, '#141014');
    ringGrad.addColorStop(1, '#0a070a');
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.04, 0, TAU);
    ctx.fillStyle = ringGrad;
    ctx.fill();

    WHEEL_ORDER.forEach((number, index) => {
      const start = rotation + index * SLICE - Math.PI / 2;
      const end = start + SLICE;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, start, end);
      ctx.closePath();

      const red = isRedNumber(number);
      const grad = ctx.createRadialGradient(cx, cy, R * 0.25, cx, cy, R);
      if (number === 0) {
        grad.addColorStop(0, '#2fbd54');
        grad.addColorStop(1, '#0f6b26');
      } else if (red) {
        grad.addColorStop(0, '#d84545');
        grad.addColorStop(1, '#7d1414');
      } else {
        grad.addColorStop(0, '#33333a');
        grad.addColorStop(1, '#08080a');
      }
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(start), cy + R * Math.sin(start));
      ctx.strokeStyle = 'rgba(230, 192, 105, 0.45)';
      ctx.lineWidth = size * 0.0022;
      ctx.stroke();

      const mid = start + SLICE / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${Math.round(size * 0.026)}px Inter, Arial, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 3;
      ctx.fillText(String(number), R * 0.82, 0);
      ctx.restore();
    });

    // Inner gold cone
    const cone = ctx.createRadialGradient(cx - R * 0.12, cy - R * 0.12, R * 0.05, cx, cy, R * 0.55);
    cone.addColorStop(0, '#f6e2a8');
    cone.addColorStop(0.45, '#c9a24a');
    cone.addColorStop(1, '#5a3d12');
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.55, 0, TAU);
    ctx.fillStyle = cone;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.34, 0, TAU);
    ctx.fillStyle = 'rgba(20, 12, 6, 0.65)';
    ctx.fill();

    // Turret diamonds
    for (let i = 0; i < 4; i += 1) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation + (i * TAU) / 4);
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.46);
      ctx.lineTo(R * 0.06, -R * 0.36);
      ctx.lineTo(0, -R * 0.26);
      ctx.lineTo(-R * 0.06, -R * 0.36);
      ctx.closePath();
      ctx.fillStyle = '#f4dc9a';
      ctx.fill();
      ctx.restore();
    }

    if (ball) {
      const bx = cx + ball.radius * size * Math.cos(ball.angle);
      const by = cy + ball.radius * size * Math.sin(ball.angle);
      const ballR = size * 0.019;

      ctx.beginPath();
      ctx.arc(bx + ballR * 0.4, by + ballR * 0.7, ballR * 1.05, 0, TAU);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fill();

      const gloss = ctx.createRadialGradient(bx - ballR * 0.35, by - ballR * 0.35, ballR * 0.15, bx, by, ballR);
      gloss.addColorStop(0, '#ffffff');
      gloss.addColorStop(0.5, '#f2f2f2');
      gloss.addColorStop(1, '#9aa0a6');
      ctx.beginPath();
      ctx.arc(bx, by, ballR, 0, TAU);
      ctx.fillStyle = gloss;
      ctx.shadowColor = 'rgba(255,255,255,0.75)';
      ctx.shadowBlur = size * 0.02;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  useEffect(() => {
    draw(rotationRef.current, null);
  }, []);

  useEffect(() => {
    if (!spinToken || targetNumber === null || targetNumber === undefined) return undefined;
    const index = WHEEL_ORDER.indexOf(Number(targetNumber));
    const start = rotationRef.current;
    const restAngle = -(index + 0.5) * SLICE;
    const align = ((restAngle - start) % TAU + TAU) % TAU;
    const end = start + TAU * 5 + align;
    const duration = 4600;
    const ballStart = -Math.PI / 2 + TAU * 2;
    const ballEnd = -Math.PI / 2 - TAU * 5;
    let origin = 0;

    const step = (timestamp) => {
      if (!origin) origin = timestamp;
      const progress = Math.min((timestamp - origin) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const ballEased = 1 - Math.pow(1 - progress, 2.6);
      draw(start + (end - start) * eased, {
        angle: ballStart + (ballEnd - ballStart) * ballEased,
        radius: 0.455 - 0.14 * ballEased,
      });
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        rotationRef.current = end;
        onDone?.();
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [spinToken, targetNumber, onDone]);

  return (
    <canvas
      ref={canvasRef}
      width={720}
      height={720}
      className="block h-auto w-full rounded-full"
      style={{ filter: 'drop-shadow(0 26px 34px rgba(0,0,0,0.75))' }}
      aria-label="Roue de roulette européenne"
    />
  );
}