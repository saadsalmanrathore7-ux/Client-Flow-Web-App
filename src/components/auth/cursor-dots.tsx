"use client";

import { useEffect, useRef } from "react";

/* ─── Types ──────────────────────────────────────────── */
interface Dot {
  // home position (slow drift)
  hx: number;
  hy: number;
  // current position
  x: number;
  y: number;
  // velocity
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  // how strongly cursor velocity pushes this dot (depth layer)
  mass: number;
  glowColor: string;
}

/* ─── Constants tuned for MacBook trackpad ───────────── */
// Trackpad fires mousemove at ~60 Hz with tiny deltas.
// We use cursor *velocity* (not position) to push dots,
// so even small glides register as smooth waves.
const DRIFT_SPEED   = 0.18;   // base float speed
const PUSH_RADIUS   = 160;    // px — how far cursor affects dots
const PUSH_STRENGTH = 2.8;    // how hard a fast swipe scatters dots
const SPRING        = 0.045;  // spring back to home
const DAMPING       = 0.78;   // velocity decay per frame (inertia)
const CURSOR_LERP   = 0.14;   // smooth cursor position (reduces jitter)
const VEL_LERP      = 0.18;   // smooth cursor velocity

const GLOW_COLORS = [
  "255,255,255",   // pure white
  "210,200,195",   // warm white
  "190,182,255",   // soft lavender
  "255,228,180",   // warm gold
  "180,230,255",   // cool ice
];

function makeDots(count: number, w: number, h: number): Dot[] {
  return Array.from({ length: count }, () => {
    const hx = Math.random() * w;
    const hy = Math.random() * h;
    return {
      hx, hy, x: hx, y: hy,
      vx: (Math.random() - 0.5) * DRIFT_SPEED,
      vy: (Math.random() - 0.5) * DRIFT_SPEED,
      size:    Math.random() * 2.2 + 0.9,
      opacity: Math.random() * 0.55 + 0.18,
      mass:    Math.random() * 0.8 + 0.2,   // 0.2–1.0
      glowColor: GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)],
    };
  });
}

/* ─── Component ──────────────────────────────────────── */
export function CursorDots({ count = 90 }: { count?: number }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafId      = useRef<number>(0);
  const dots       = useRef<Dot[]>([]);

  // Raw cursor coords
  const rawMouse   = useRef({ x: -9999, y: -9999 });
  // Smoothed cursor (reduces trackpad jitter)
  const smoothMouse = useRef({ x: -9999, y: -9999 });
  // Smoothed cursor velocity
  const cursorVel  = useRef({ x: 0, y: 0 });
  // Previous smooth mouse (to compute velocity)
  const prevSmooth = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* resize */
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      dots.current  = makeDots(count, canvas.width, canvas.height);
      smoothMouse.current  = { x: canvas.width / 2, y: canvas.height / 2 };
      prevSmooth.current   = { ...smoothMouse.current };
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* mouse / trackpad input — stored raw, smoothed inside rAF */
    const parent = canvas.parentElement!;
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      rawMouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    parent.addEventListener("mousemove", onMove);

    /* animation loop */
    const draw = () => {
      const { width, height } = canvas;

      /* ── 1. Smooth cursor position (trackpad jitter filter) ── */
      smoothMouse.current.x += (rawMouse.current.x - smoothMouse.current.x) * CURSOR_LERP;
      smoothMouse.current.y += (rawMouse.current.y - smoothMouse.current.y) * CURSOR_LERP;

      /* ── 2. Compute & smooth cursor velocity ── */
      const rawVelX = smoothMouse.current.x - prevSmooth.current.x;
      const rawVelY = smoothMouse.current.y - prevSmooth.current.y;
      cursorVel.current.x += (rawVelX - cursorVel.current.x) * VEL_LERP;
      cursorVel.current.y += (rawVelY - cursorVel.current.y) * VEL_LERP;
      prevSmooth.current = { ...smoothMouse.current };

      const velMag = Math.hypot(cursorVel.current.x, cursorVel.current.y);

      ctx.clearRect(0, 0, width, height);

      /* ── 3. Update + draw each dot ── */
      for (const dot of dots.current) {
        /* drift home position */
        dot.hx += dot.vx;
        dot.hy += dot.vy;
        if (dot.hx < -20)        dot.hx = width  + 20;
        if (dot.hx > width  + 20) dot.hx = -20;
        if (dot.hy < -20)        dot.hy = height + 20;
        if (dot.hy > height + 20) dot.hy = -20;

        /* spring toward home */
        dot.x += (dot.hx - dot.x) * SPRING;
        dot.y += (dot.hy - dot.y) * SPRING;

        /* cursor velocity push */
        const distX = dot.x - smoothMouse.current.x;
        const distY = dot.y - smoothMouse.current.y;
        const dist  = Math.hypot(distX, distY);

        if (dist < PUSH_RADIUS && velMag > 0.3) {
          // falloff: stronger near cursor, fades at PUSH_RADIUS
          const falloff = 1 - dist / PUSH_RADIUS;
          // push perpendicular + outward based on cursor direction
          const pushX = (cursorVel.current.x * 0.6 + (distX / (dist + 1)) * velMag * 0.4)
                        * falloff * PUSH_STRENGTH * dot.mass;
          const pushY = (cursorVel.current.y * 0.6 + (distY / (dist + 1)) * velMag * 0.4)
                        * falloff * PUSH_STRENGTH * dot.mass;
          dot.x += pushX;
          dot.y += pushY;
        }

        /* damping (inertia — feels right on trackpad) */
        dot.vx *= DAMPING;
        dot.vy *= DAMPING;

        /* ── draw ── */
        const r = dot.size;
        // outer glow bloom
        const grd = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, r * 4.5);
        grd.addColorStop(0,   `rgba(${dot.glowColor},${dot.opacity})`);
        grd.addColorStop(0.35,`rgba(${dot.glowColor},${dot.opacity * 0.45})`);
        grd.addColorStop(1,   `rgba(${dot.glowColor},0)`);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, r * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // bright centre
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, r * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dot.glowColor},${Math.min(dot.opacity + 0.35, 1)})`;
        ctx.fill();
      }

      rafId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId.current);
      ro.disconnect();
      parent.removeEventListener("mousemove", onMove);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
