"use client";

import { useEffect, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

const COUNT = 72;
const src = (i: number) => `/frames/turntable/square/${String(i).padStart(4, "0")}.webp`;

/** Drag-to-rotate viewer for the rendered part; idles with a slow spin while on screen. */
export function Turntable({ label, hint }: { label: string; hint: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const frames: (HTMLImageElement | null)[] = new Array(COUNT).fill(null);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pos = 0; // fractional frame
    let vel = reduced ? 0 : 0.18; // frames per tick while idle
    let dragging = false;
    let lastX = 0;
    let visible = false;
    let raf = 0;
    let drawn = -1;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      drawn = -1;
    };

    const draw = () => {
      const i = ((Math.round(pos) % COUNT) + COUNT) % COUNT;
      let f = i;
      while (!frames[f] && f !== (i + COUNT - 1) % COUNT) f = (f + 1) % COUNT;
      if (!frames[f] || f === drawn) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frames[f]!, 0, 0, canvas.width, canvas.height);
      drawn = f;
    };

    const loop = () => {
      if (!dragging) {
        pos += vel;
        // fling decays back to the idle spin
        const idle = reduced ? 0 : 0.18;
        vel += (idle - vel) * 0.04;
      }
      draw();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    frames.forEach((_, i) => {
      const img = new Image();
      img.src = src(i);
      img.decode().then(() => {
        frames[i] = img;
        if (drawn < 0) draw();
      }, () => {});
    });

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      setTouched(true);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      const step = (dx / canvas.clientWidth) * COUNT * 0.9;
      pos -= step;
      vel = -step;
      draw();
    };
    const up = () => (dragging = false);
    const key = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      pos += e.key === "ArrowRight" ? 3 : -3;
      vel = 0;
      setTouched(true);
      draw();
    };

    size();
    const ro = new ResizeObserver(() => {
      size();
      draw();
    });
    ro.observe(canvas);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("keydown", key);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("keydown", key);
    };
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="img"
        aria-label={label}
        className="aspect-square w-full cursor-grab touch-pan-y select-none rounded-[1.5rem] active:cursor-grabbing"
      />
      <span
        className={`pointer-events-none absolute bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-bg/70 px-4 py-2 text-sm text-white/85 backdrop-blur transition-opacity duration-500 ${touched ? "opacity-0" : "opacity-100"}`}
        aria-hidden
      >
        <MoveHorizontal size={16} className="text-cyan" />
        {hint}
      </span>
    </div>
  );
}
