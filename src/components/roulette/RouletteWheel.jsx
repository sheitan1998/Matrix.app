import React, { useEffect, useRef } from 'react';
import { WHEEL_ORDER, isRedNumber } from '@/lib/rouletteTable';

const SLICE = (Math.PI * 2) / 37;
const TAU = Math.PI * 2;
const SIZE = 720;

// Radii as a fraction of the canvas size.
const WOOD_EDGE = 0.468;
const TRACK_OUT = 0.404;
const TRACK_IN = 0.344;
const RING_IN = 0.224;
const BALL_REST = 0.284;

/**
 * European roulette wheel, shaded like a luxury table: dark rosewood bowl,
 * polished brass bands, ivory ball track and a gold turret. The parent applies
 * the 3/4 perspective; the rotor and the ball are animated here.
 */
export default function RouletteWheel({ targetNumber = null, spinToken = 0, onDone }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const frameRef = useRef(0);

  const draw = (rotation, ball) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = SIZE;
    const cx = s / 2;
    const cy = s / 2;

    const goldBand = ctx.createLinearGradient(cx - s * 0.4, cy - s * 0.4, cx + s * 0.4, cy + s * 0.4);
    goldBand.addColorStop(0, '#ffedb8');
    goldBand.addColorStop(0.45, '#e2bd69');
    goldBand.addColorStop(0.75, '#a87c2c');
    goldBand.addColorStop(1, '#6d4c12');

    ctx.clearRect(0, 0, s, s);

    // Bowl thickness (stacked offset rings fake the solid edge under perspective).
    for (let step = 10; step >= 1; step -= 1) {
      ctx.beginPath();
      ctx.arc(cx, cy + step * s * 0.0024, s * WOOD_EDGE, 0, TAU);
      ctx.fillStyle = `rgba(10, 5, 2, ${0.05 * step})`;
      ctx.fill();
    }

    // Dark rosewood bowl.
    const bowl = ctx.createRadialGradient(
      cx - s * 0.16,
      cy - s * 0.22,
      s * 0.05,
      cx,
      cy,
      s * WOOD_EDGE,
    );
    bowl.addColorStop(0, '#7b4a20');
    bowl.addColorStop(0.38, '#55301a');
    bowl.addColorStop(0.72, '#33190c');
    bowl.addColorStop(1, '#150a04');
    ctx.beginPath();
    ctx.arc(cx, cy, s * WOOD_EDGE, 0, TAU);
    ctx.fillStyle = bowl;
    ctx.fill();

    // Brass edge.
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.462, 0, TAU);
    ctx.strokeStyle = goldBand;
    ctx.lineWidth = s * 0.012;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.438, 0, TAU);
    ctx.strokeStyle = 'rgba(255, 236, 184, 0.28)';
    ctx.lineWidth = s * 0.003;
    ctx.stroke();

    // Ivory ball track.
    ctx.beginPath();
    ctx.arc(cx, cy, s * TRACK_OUT, 0, TAU);
    ctx.arc(cx, cy, s * TRACK_IN, 0, TAU, true);
    ctx.closePath();
    const track = ctx.createRadialGradient(cx, cy, s * TRACK_IN, cx, cy, s * TRACK_OUT);
    track.addColorStop(0, '#b9a179');
    track.addColorStop(0.35, '#f1e3bf');
    track.addColorStop(0.72, '#d9c39a');
    track.addColorStop(1, '#9d8459');
    ctx.fillStyle = track;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, s * TRACK_IN + s * 0.005, 0, TAU);
    ctx.strokeStyle = 'rgba(58, 34, 12, 0.55)';
    ctx.lineWidth = s * 0.006;
    ctx.stroke();

    // Number ring base.
    ctx.beginPath();
    ctx.arc(cx, cy, s * TRACK_IN, 0, TAU);
    ctx.fillStyle = '#0b0705';
    ctx.fill();

    const rOut = s * TRACK_IN;
    const redWedge = ctx.createRadialGradient(cx, cy, s * RING_IN * 0.6, cx, cy, rOut);
    redWedge.addColorStop(0, '#d1463f');
    redWedge.addColorStop(1, '#6f100e');
    const blackWedge = ctx.createRadialGradient(cx, cy, s * RING_IN * 0.6, cx, cy, rOut);
    blackWedge.addColorStop(0, '#2f2f36');
    blackWedge.addColorStop(1, '#08080a');
    const greenWedge = ctx.createRadialGradient(cx, cy, s * RING_IN * 0.6, cx, cy, rOut);
    greenWedge.addColorStop(0, '#25a94e');
    greenWedge.addColorStop(1, '#0a5222');

    WHEEL_ORDER.forEach((number, index) => {
      const start = rotation + index * SLICE - Math.PI / 2;
      const end = start + SLICE;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, rOut, start, end);
      ctx.closePath();
      ctx.fillStyle = number === 0 ? greenWedge : isRedNumber(number) ? redWedge : blackWedge;
      ctx.fill();

      // Brass pocket separator.
      ctx.beginPath();
      ctx.moveTo(cx + s * RING_IN * Math.cos(start), cy + s * RING_IN * Math.sin(start));
      ctx.lineTo(cx + rOut * Math.cos(start), cy + rOut * Math.sin(start));
      ctx.strokeStyle = 'rgba(236, 202, 128, 0.55)';
      ctx.lineWidth = s * 0.0024;
      ctx.stroke();

      const mid = start + SLICE / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 ${Math.round(s * 0.028)}px Inter, Arial, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = s * 0.004;
      ctx.fillText(String(number), s * BALL_REST, 0);
      ctx.restore();
    });

    // Brass rings framing the pockets.
    ctx.beginPath();
    ctx.arc(cx, cy, rOut, 0, TAU);
    ctx.strokeStyle = goldBand;
    ctx.lineWidth = s * 0.008;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, s * RING_IN, 0, TAU);
    ctx.strokeStyle = goldBand;
    ctx.lineWidth = s * 0.008;
    ctx.stroke();

    // Gold cone.
    const cone = ctx.createRadialGradient(
      cx - s * 0.055,
      cy - s * 0.075,
      s * 0.015,
      cx,
      cy,
      s * RING_IN,
    );
    cone.addColorStop(0, '#fdf5d6');
    cone.addColorStop(0.32, '#e3c176');
    cone.addColorStop(0.66, '#a87c2f');
    cone.addColorStop(1, '#5e3f12');
    ctx.beginPath();
    ctx.arc(cx, cy, s * RING_IN, 0, TAU);
    ctx.fillStyle = cone;
    ctx.fill();

    for (const radius of [0.83, 0.66, 0.5]) {
      ctx.beginPath();
      ctx.arc(cx, cy, s * RING_IN * radius, 0, TAU);
      ctx.strokeStyle = 'rgba(84, 55, 12, 0.28)';
      ctx.lineWidth = s * 0.0025;
      ctx.stroke();
    }

    // Rotating turret with its four arms.
    for (let i = 0; i < 4; i += 1) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation + (i * TAU) / 4);
      ctx.beginPath();
      ctx.moveTo(-s * 0.013, -s * 0.05);
      ctx.lineTo(s * 0.013, -s * 0.05);
      ctx.lineTo(s * 0.006, -s * 0.195);
      ctx.lineTo(-s * 0.006, -s * 0.195);
      ctx.closePath();
      ctx.fillStyle = '#e6c069';
      ctx.fill();
      ctx.strokeStyle = 'rgba(90, 60, 15, 0.45)';
      ctx.lineWidth = s * 0.002;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -s * 0.222);
      ctx.lineTo(s * 0.019, -s * 0.198);
      ctx.lineTo(0, -s * 0.174);
      ctx.lineTo(-s * 0.019, -s * 0.198);
      ctx.closePath();
      ctx.fillStyle = '#fbf0c9';
      ctx.fill();
      ctx.restore();
    }

    const cap = ctx.createRadialGradient(cx - s * 0.02, cy - s * 0.025, s * 0.006, cx, cy, s * 0.062);
    cap.addColorStop(0, '#fffce9');
    cap.addColorStop(0.5, '#e8c878');
    cap.addColorStop(1, '#8c6420');
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.062, 0, TAU);
    ctx.fillStyle = cap;
    ctx.fill();
    ctx.strokeStyle = 'rgba(80, 52, 10, 0.5)';
    ctx.lineWidth = s * 0.003;
    ctx.stroke();

    // Single soft specular highlight across the whole wheel.
    const gloss = ctx.createLinearGradient(cx - s * 0.34, cy - s * 0.38, cx + s * 0.05, cy + s * 0.26);
    gloss.addColorStop(0, 'rgba(255, 255, 255, 0.17)');
    gloss.addColorStop(0.42, 'rgba(255, 255, 255, 0.03)');
    gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.462, 0, TAU);
    ctx.fillStyle = gloss;
    ctx.fill();

    if (ball) {
      const bx = cx + ball.radius * s * Math.cos(ball.angle);
      const by = cy + ball.radius * s * Math.sin(ball.angle);
      const br = s * 0.019;

      ctx.beginPath();
      ctx.arc(bx + br * 0.5, by + br * 0.8, br * 1.02, 0, TAU);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      const glossBall = ctx.createRadialGradient(
        bx - br * 0.35,
        by - br * 0.4,
        br * 0.1,
        bx,
        by,
        br * 1.1,
      );
      glossBall.addColorStop(0, '#ffffff');
      glossBall.addColorStop(0.55, '#f2f2ef');
      glossBall.addColorStop(1, '#9b9a95');
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fillStyle = glossBall;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx - br * 0.3, by - br * 0.36, br * 0.28, 0, TAU);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
    }
  };

  useEffect(() => {
    draw(rotationRef.current, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!spinToken || targetNumber === null || targetNumber === undefined) return undefined;
    const index = WHEEL_ORDER.indexOf(Number(targetNumber));
    if (index < 0) return undefined;

    const start = rotationRef.current;
    const restAngle = -(index + 0.5) * SLICE;
    const align = (((restAngle - start) % TAU) + TAU) % TAU;
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
        radius: TRACK_OUT - (TRACK_OUT - BALL_REST) * ballEased,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinToken, targetNumber, onDone]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="block h-auto w-full"
      style={{ filter: 'drop-shadow(0 26px 32px rgba(0, 0, 0, 0.7))' }}
      role="img"
      aria-label="Roue de roulette européenne"
    />
  );
}