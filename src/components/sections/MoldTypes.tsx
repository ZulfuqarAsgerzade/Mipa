"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import { SectionHead } from "@/components/ui/brand";
import { Photo } from "@/components/ui/photo";
import type { PhotoKey } from "@/config/photos";
import { MoldDrawing } from "./MoldDrawings";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n";

const PHOTO: Record<string, PhotoKey> = { injection: "mold-full", diecast: "diecast-dies", stamping: "press", concrete: "paving" };

export function MoldTypes({ t, kicker, photos }: { t: Dictionary["molds"]; kicker: string; photos: Dictionary["photos"] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const item = t.items[active];

  const onKey = (e: KeyboardEvent) => {
    const n = t.items.length;
    const map: Record<string, number> = {
      ArrowDown: (active + 1) % n,
      ArrowRight: (active + 1) % n,
      ArrowUp: (active - 1 + n) % n,
      ArrowLeft: (active - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    setActive(map[e.key]);
    tabs.current[map[e.key]]?.focus();
  };

  return (
    <section id="molds" className="section">
      <div className="wrap">
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <SectionHead kicker={kicker} title={t.title} />
          <p data-reveal className="t-lead lg:justify-self-end">{t.lead}</p>
        </div>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          <div role="tablist" aria-orientation="vertical" className="border-t border-line lg:col-span-5" onKeyDown={onKey}>
            {t.items.map((it, i) => {
              const selected = i === active;
              return (
                <button
                  key={it.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${it.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${it.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  data-reveal
                  className="group relative block w-full cursor-pointer border-b border-line py-6 text-left"
                >
                  <span
                    aria-hidden
                    className={cn("absolute -left-px bottom-[-1px] top-[-1px] w-[3px] origin-top bg-blue transition-transform duration-500", selected ? "scale-y-100" : "scale-y-0")}
                  />
                  <span className="flex items-center justify-between gap-6 pl-5">
                    <span className={cn("t-h2 transition-colors", selected ? "text-white" : "text-white/55 group-hover:text-white/85")}>{it.name}</span>
                    <ArrowRight
                      size={20}
                      aria-hidden
                      className={cn("flex-none transition-all duration-300", selected ? "translate-x-0 text-white" : "-translate-x-2 text-white/0 group-hover:text-white/50")}
                    />
                  </span>
                  <span
                    className={cn(
                      "grid pl-5 transition-[grid-template-rows,opacity] duration-500",
                      selected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <span className="overflow-hidden">
                      <span className="block max-w-[34em] pt-3 leading-relaxed text-muted">{it.summary}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div role="tabpanel" id={`panel-${item.id}`} aria-labelledby={`tab-${item.id}`} className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md" data-photo="static">
              {t.items.map((it, i) => (
                <Photo
                  key={it.id}
                  name={PHOTO[it.id]}
                  alt={i === active ? photos[PHOTO[it.id]] : ""}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  motion="none"
                  shade="bottom"
                  className={cn("absolute inset-0 transition-opacity duration-700", i === active ? "opacity-100" : "opacity-0")}
                  imgClassName={cn("transition-transform duration-[1.6s] ease-out", i === active ? "scale-100" : "scale-105")}
                />
              ))}
              <div className="absolute bottom-4 left-4 w-[min(46%,17rem)] rounded border border-white/15 bg-[rgb(11_13_16/0.82)] p-3 backdrop-blur-sm md:bottom-6 md:left-6">
                <MoldDrawing key={item.id} id={item.id} />
              </div>
            </div>
            <dl className="mt-8 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {item.specs.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line py-3.5">
                  <dt className="text-sm text-muted">{k}</dt>
                  <dd className="tnum text-right font-medium text-white">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[0.9375rem] text-muted">
              <span className="font-medium text-white">{t.productsLabel}: </span>
              {item.products}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
