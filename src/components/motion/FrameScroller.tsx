"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { scrollToY } from "./SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

type LabelData = { count: number; w: number; h: number; labels: Record<string, [number, number]>[] };

type Props = {
  /** folder under /public/frames */
  seq: "open" | "anatomy";
  /** scroll distance while pinned, in viewport heights */
  length: number;
  /** progress shown when the user prefers reduced motion */
  staticProgress?: number;
  label: string;
  id?: string;
  className?: string;
  /** decorative layer painted behind the (transparent) frames */
  background?: ReactNode;
  children?: ReactNode;
};

/**
 * Pins a full-viewport canvas and scrubs a pre-rendered, transparent WebP frame sequence with scroll.
 * Overlay children opt in to behaviour with data attributes:
 *   data-from / data-to       — progress window in which the element is active (data-active)
 *   data-anchor="name"        — element is translated to that 3D anchor's screen position
 *   data-step-from / -to      — element gets aria-current="step" inside the window
 *   data-seek="0.5"           — clicking scrolls the scene to that progress
 * The section also exposes the live progress as the CSS variable --p.
 */
export function FrameScroller({ seq, length, staticProgress = 1, label, id, className, background, children }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const canvas = canvasRef.current!;
    const overlay = overlayRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // portrait and landscape renders. Only the frames follow the aspect ratio; the pin is created once,
    // here on mount, so ScrollTriggers stay in page order (a pin created late throws off every section below it)
    const portrait = window.matchMedia("(max-aspect-ratio: 1/1)");

    let data: LabelData | null = null;
    let frames: (HTMLImageElement | null)[] = [];
    let progress = reduced ? staticProgress : 0;
    let drawn = -1;
    let alive = true;
    let set = 0; // bumped on every frame-set switch so stale loads are dropped
    let fit = { x: 0, y: 0, w: 0, h: 0 };

    const windows = Array.from(overlay.querySelectorAll<HTMLElement>("[data-from]")).map((el) => ({
      el,
      from: parseFloat(el.dataset.from!),
      to: parseFloat(el.dataset.to ?? "1.01"),
      active: el.dataset.active === "true",
    }));
    const steps = Array.from(overlay.querySelectorAll<HTMLElement>("[data-step-from]"));
    const anchored = Array.from(overlay.querySelectorAll<HTMLElement>("[data-anchor]"));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth: cw, clientHeight: ch } = canvas;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      if (data) {
        // contain: frames are transparent, so nothing is ever cropped
        const scale = Math.min(cw / data.w, ch / data.h);
        fit = { w: data.w * scale, h: data.h * scale, x: (cw - data.w * scale) / 2, y: (ch - data.h * scale) / 2 };
      }
      drawn = -1;
      render();
    };

    const nearestLoaded = (i: number) => {
      for (let d = 0; d < frames.length; d++) {
        if (frames[i - d]) return i - d;
        if (frames[i + d]) return i + d;
      }
      return -1;
    };

    const render = () => {
      if (!data) return;
      const target = Math.round(progress * (data.count - 1));
      const i = nearestLoaded(target);
      if (i >= 0 && i !== drawn) {
        const sx = canvas.width / canvas.clientWidth;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(frames[i]!, fit.x * sx, fit.y * sx, fit.w * sx, fit.h * sx);
        drawn = i;
      }

      const vw = canvas.clientWidth;
      // the canvas may be inset from the top of the section (e.g. below the header)
      const top = canvas.offsetTop;
      const pts = data.labels[target];
      for (const el of anchored) {
        const p = pts?.[el.dataset.anchor!];
        if (!p) continue;
        const x = fit.x + p[0] * fit.w;
        el.style.transform = `translate3d(${x}px, ${top + fit.y + p[1] * fit.h}px, 0)`;
        // flip a label to the other side of its anchor when it would leave the viewport
        const body = el.querySelector<HTMLElement>(".callout-body");
        if (body) {
          const need = parseFloat(el.dataset.lx!) + body.offsetWidth + 16;
          const side =
            el.dataset.pref === "e"
              ? x + need > vw && x - need > 0 ? "w" : "e"
              : x - need < 0 && x + need < vw ? "e" : "w";
          if (el.dataset.side !== side) el.dataset.side = side;
        }
      }

      for (const w of windows) {
        const on = progress >= w.from && progress < w.to;
        if (on !== w.active) {
          w.active = on;
          w.el.dataset.active = String(on);
        }
      }
      for (const s of steps) {
        const on = progress >= parseFloat(s.dataset.stepFrom!) && progress < parseFloat(s.dataset.stepTo!);
        if (on) s.setAttribute("aria-current", "step");
        else s.removeAttribute("aria-current");
      }
    };

    const load = (base: string, gen: number, i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = `${base}/${String(i).padStart(4, "0")}.webp`;
        img.decode().then(
          () => {
            if (!alive || gen !== set) return resolve();
            frames[i] = img;
            if (Math.abs(i - Math.round(progress * (data!.count - 1))) < 12) {
              drawn = -1;
              render();
            }
            resolve();
          },
          () => resolve()
        );
      });

    let trigger: ScrollTrigger | undefined;

    const loadSet = () => {
      const gen = ++set;
      const base = `/frames/${seq}/${portrait.matches ? "mobile" : "desktop"}`;
      fetch(`${base}/labels.json`)
        .then((r) => r.json())
        .then(async (json: LabelData) => {
          if (!alive || gen !== set) return;
          data = json;
          frames = new Array(json.count).fill(null);
          resize();

          const first = reduced ? Math.round(staticProgress * (json.count - 1)) : Math.round(progress * (json.count - 1));
          await load(base, gen, first);
          if (reduced) return;

          // coarse pass first so any scroll position has a nearby frame, then fill in
          const seen = new Set([first]);
          const order: number[] = [];
          for (const step of [16, 8, 4, 2, 1])
            for (let i = 0; i < json.count; i += step)
              if (!seen.has(i)) {
                seen.add(i);
                order.push(i);
              }
          let next = 0;
          const worker = async () => {
            while (alive && gen === set && next < order.length) await load(base, gen, order[next++]);
          };
          Promise.all([worker(), worker(), worker(), worker()]);
        });
    };
    loadSet();
    portrait.addEventListener("change", loadSet);

    if (!reduced) {
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * length}`,
        pin: true,
        // no anticipatePin: Lenis scrolls on the main thread, and anticipating made a fast flick
        // pin the scene early, over the bottom of the section before it
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress = self.progress;
          section.style.setProperty("--p", progress.toFixed(4));
          render();
        },
      });
    }

    const onSeek = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-seek]");
      if (!btn || !trigger) return;
      const p = parseFloat(btn.dataset.seek!);
      scrollToY(trigger.start + (trigger.end - trigger.start) * p);
    };
    overlay.addEventListener("click", onSeek);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      alive = false;
      portrait.removeEventListener("change", loadSet);
      ro.disconnect();
      overlay.removeEventListener("click", onSeek);
      trigger?.kill();
    };
  }, [seq, length, staticProgress]);

  // GSAP wraps the pinned section in a pin-spacer; the outer div keeps React's own child intact on unmount
  return (
    <div>
      <section ref={sectionRef} id={id} className={cn("scene", className)} aria-label={label}>
        {background && <div className="scene-bg">{background}</div>}
        <canvas ref={canvasRef} role="img" aria-label={label} />
        <div ref={overlayRef} className="scene-overlay">
          {children}
        </div>
      </section>
    </div>
  );
}

type CalloutProps = {
  anchor: string;
  from: number;
  to: number;
  title: string;
  text?: string;
  icon?: ReactNode;
  /** direction the leader travels from the anchor */
  dir?: "ne" | "nw" | "se" | "sw";
  reach?: number;
  /** window for the small-screen caption; defaults to from/to */
  captionTo?: number;
};

/** A leader line from a 3D anchor point to a glass label. */
export function Callout({ anchor, from, to, title, text, icon, dir = "ne", reach = 90, captionTo }: CalloutProps) {
  const side = dir.includes("e") ? "e" : "w";
  const sy = dir.includes("n") ? -1 : 1;
  const run = reach * 0.6;
  const lx = run + reach + 4;
  // drawn eastward; CSS mirrors it for west-facing labels
  const d = `M0 0 L${run} ${sy * run} L${run + reach} ${sy * run}`;
  const body = (
    <>
      {icon && <span className="callout-icon">{icon}</span>}
      <span>
        <span className="callout-title block">{title}</span>
        {text && <span className="callout-text block">{text}</span>}
      </span>
    </>
  );
  return (
    <>
      <div
        className="callout"
        data-anchor={anchor}
        data-from={from}
        data-to={to}
        data-pref={side}
        data-side={side}
        data-lx={lx}
        style={{ ["--lx" as string]: `${lx}px` }}
      >
        <span className="callout-dot" />
        <svg className="callout-leader" width="1" height="1" aria-hidden>
          <path d={d} pathLength={1} />
        </svg>
        <div className="callout-body" style={{ top: sy * run, transform: "translateY(-50%)" }}>
          {body}
        </div>
      </div>
      {/* small screens: the dot stays on the part, the words move to a caption */}
      <div className="callout-caption fade-up" data-from={from} data-to={captionTo ?? to} aria-hidden>
        {body}
      </div>
    </>
  );
}
