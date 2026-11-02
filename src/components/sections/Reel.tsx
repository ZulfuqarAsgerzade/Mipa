"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Photo } from "@/components/ui/photo";
import type { PhotoKey } from "@/config/photos";
import type { Dictionary } from "@/i18n";

gsap.registerPlugin(ScrollTrigger);

const PHOTOS: PhotoKey[] = ["mold-open", "cnc-spindle", "mold-detail", "cmm", "injection-machine"];
// each chapter holds for HOLD, then the next one wipes in over WIPE (timeline units)
const HOLD = 0.45;
const WIPE = 0.55;

/**
 * Pinned photo reel after the hero: steel block → milling → polishing → inspection → trial.
 * Without motion (reduced motion, no JS) the chapters simply stack as full-bleed photos.
 */
export function Reel({ band, photos }: { band: Dictionary["band"]; photos: Dictionary["photos"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const chapters = [{ label: band.label, title: band.title, text: band.text }, ...band.chapters];

  useEffect(() => {
    const section = sectionRef.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      section.classList.add("is-pinned");
      const frames = gsap.utils.toArray<HTMLElement>("[data-frame]", section);
      const imgs = frames.map((f) => f.querySelector("img"));
      const captions = frames.map((f) => f.querySelector("[data-caption]"));
      const marks = gsap.utils.toArray<HTMLElement>("li", railRef.current);
      const n = frames.length;
      let active = -1;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${n * 95}%`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            barRef.current!.style.transform = `scaleY(${self.progress})`;
            const i = Math.min(n - 1, Math.floor((self.progress * tl.duration() - HOLD - WIPE / 2) / (HOLD + WIPE)) + 1);
            if (i !== active) {
              active = i;
              marks.forEach((m, k) => m.toggleAttribute("data-active", k === i));
            }
          },
        },
      });

      // slow push-in on the opening frame
      tl.fromTo(imgs[0], { scale: 1.12 }, { scale: 1, duration: HOLD + WIPE }, 0);
      for (let i = 1; i < n; i++) {
        const at = (i - 1) * (HOLD + WIPE) + HOLD;
        tl.fromTo(frames[i], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: WIPE, ease: "power2.inOut" }, at)
          .to(imgs[i - 1], { yPercent: -10, duration: WIPE, ease: "power2.inOut" }, at)
          .to(captions[i - 1], { autoAlpha: 0, y: -40, duration: WIPE * 0.5 }, at)
          .fromTo(imgs[i], { scale: 1.25, yPercent: 8 }, { scale: 1, yPercent: 0, duration: WIPE + HOLD + WIPE, ease: "power1.out" }, at)
          .fromTo(captions[i], { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: WIPE * 0.6, ease: "power2.out" }, at + WIPE * 0.45);
      }
      tl.to({}, { duration: HOLD }); // hold the last chapter before releasing the pin

      return () => {
        section.classList.remove("is-pinned");
        marks.forEach((m) => m.removeAttribute("data-active"));
      };
    });
    return () => mm.revert();
  }, []);

  return (
    // GSAP wraps the pinned section in a pin-spacer; the outer div keeps React's own child intact on unmount
    <div>
      <section ref={sectionRef} aria-labelledby="band-title" className="group/reel relative bg-bg [&.is-pinned]:h-svh [&.is-pinned]:overflow-hidden">
        {chapters.map((c, i) => (
          <div
            key={c.label}
            data-frame
            className="relative h-[88svh] min-h-[34rem] overflow-hidden group-[.is-pinned]/reel:absolute group-[.is-pinned]/reel:inset-0 group-[.is-pinned]/reel:h-auto"
            style={{ zIndex: i }}
          >
            <Photo name={PHOTOS[i]} alt={photos[PHOTOS[i]]} motion="none" shade="none" className="absolute inset-0" />
            <div aria-hidden className="reel-grade absolute inset-0" />
            <div data-caption className="wrap relative flex h-full flex-col justify-end pb-14 md:pb-20">
              <p className="mb-5 flex items-baseline gap-3 text-sm text-white/70">
                <span className="tnum font-medium text-white">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-px w-8 translate-y-[-0.3em] bg-white/40" aria-hidden />
                {c.label}
              </p>
              {i === 0 ? (
                <h2 id="band-title" className="t-h1 max-w-[20ch] text-white [text-shadow:0_2px_30px_rgb(0_0_0/0.5)]">{c.title}</h2>
              ) : (
                <h3 className="t-h1 max-w-[20ch] text-white [text-shadow:0_2px_30px_rgb(0_0_0/0.5)]">{c.title}</h3>
              )}
              <p className="mt-6 max-w-[36em] text-lg leading-relaxed text-white/80">{c.text}</p>
            </div>
          </div>
        ))}

        {/* chapter rail, only while pinned */}
        <div aria-hidden className="absolute bottom-14 right-[var(--gutter)] z-20 hidden gap-5 md:bottom-20 lg:group-[.is-pinned]/reel:flex">
          <span className="relative w-px overflow-hidden bg-white/20">
            <span ref={barRef} className="absolute inset-0 origin-top bg-white" style={{ transform: "scaleY(0)" }} />
          </span>
          <ol ref={railRef} className="flex flex-col gap-3 text-sm">
            {chapters.map((c, i) => (
              <li key={c.label} className="reel-mark flex items-baseline gap-3">
                <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
                {c.label}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
