"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock } from "lucide-react";
import { Kicker } from "@/components/ui/brand";
import { Photo } from "@/components/ui/photo";
import type { PhotoKey } from "@/config/photos";
import type { Dictionary } from "@/i18n";

gsap.registerPlugin(ScrollTrigger);

const PHOTOS: PhotoKey[] = ["mold-slide", "mold-detail", "cnc-spindle", "mold-core", "injection-machine", "mold-full"];

export function Process({ t, kicker, photos }: { t: Dictionary["process"]; kicker: string; photos: Dictionary["photos"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    // desktop: the steps travel sideways while the section is pinned
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const track = trackRef.current!;
      const distance = () => track.scrollWidth - track.clientWidth;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            barRef.current!.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
      return () => tween.scrollTrigger?.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    // GSAP wraps the pinned section in a pin-spacer; the outer div keeps React's own child intact on unmount
    <div>
      <section ref={sectionRef} id="process" className="relative overflow-hidden lg:flex lg:h-svh lg:flex-col lg:justify-center">
        <div className="wrap relative grid items-end gap-6 pb-12 pt-24 lg:grid-cols-2 lg:pt-[calc(var(--header-h)+1rem)]">
          <div className="flex flex-col gap-5">
            <div data-reveal>
              <Kicker>{kicker}</Kicker>
            </div>
            <h2 data-reveal className="t-h1 max-w-[16ch] text-white">
              {t.title}
            </h2>
          </div>
          <div className="flex flex-col gap-6 lg:items-end">
            <p data-reveal className="t-lead lg:text-right">{t.lead}</p>
            <span className="relative hidden h-px w-full max-w-sm overflow-hidden bg-white/15 lg:block" aria-hidden>
              <span ref={barRef} className="absolute inset-0 origin-left bg-blue" style={{ transform: "scaleX(0)" }} />
            </span>
          </div>
        </div>

        <ol
          ref={trackRef}
          className="wrap relative flex flex-col gap-12 pb-24 lg:max-w-none lg:flex-row lg:gap-8 lg:overflow-visible lg:pb-0 lg:pr-[30vw]"
        >
          {t.steps.map((s, i) => (
            <li key={s.title} data-reveal className="group relative flex flex-col border-t border-line pt-5 lg:w-[24rem] lg:flex-none">
              <div className="mb-5 flex items-center justify-between text-sm">
                <span className="tnum font-medium text-white">{String(i + 1).padStart(2, "0")}</span>
                <span className="tnum inline-flex items-center gap-1.5 text-muted">
                  <Clock size={14} aria-hidden />
                  {s.time}
                </span>
              </div>
              <Photo
                name={PHOTOS[i]}
                alt={photos[PHOTOS[i]]}
                sizes="(min-width: 1024px) 24rem, 100vw"
                motion="none"
                shade="none"
                className="aspect-[16/10] rounded"
                imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <h3 className="t-h2 mt-6 text-white">{s.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
