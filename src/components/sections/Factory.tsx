import { Marquee } from "@/components/ui/marquee";
import { SectionHead } from "@/components/ui/brand";
import { Photo } from "@/components/ui/photo";
import type { PhotoKey } from "@/config/photos";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n";

const STEELS = ["1.2738", "1.2343 ESR", "1.2344", "1.2379", "1.2083", "NAK80", "H13", "P20", "Hardox 500"];
const PHOTOS: PhotoKey[] = ["cnc-spindle", "mold-detail", "mold-slide", "cmm", "injection-machine"];
// large lead image, then a 2x2 block beside it
const SPANS = ["lg:col-span-2 lg:row-span-2", "", "", "", ""];

export function Factory({ t, kicker, photos }: { t: Dictionary["factory"]; kicker: string; photos: Dictionary["photos"] }) {
  return (
    <section id="factory" className="section pb-0">
      <div className="wrap">
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <SectionHead kicker={kicker} title={t.title} />
          <p data-reveal className="t-lead lg:justify-self-end">{t.lead}</p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(17rem,1fr))]">
          {t.equipment.map((e, i) => {
            const big = i === 0;
            return (
              <li key={e.name} className={cn("group relative min-h-[17rem] overflow-hidden rounded", big && "min-h-[24rem]", SPANS[i])}>
                <Photo
                  name={PHOTOS[i]}
                  alt={photos[PHOTOS[i]]}
                  sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  shade="bottom"
                  motion="static"
                  className="absolute inset-0"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className={cn("absolute inset-x-0 bottom-0 p-5 md:p-6", big && "lg:p-9")}>
                  <h3 className={cn("text-white", big ? "t-h1 max-w-[14ch] text-[clamp(1.75rem,2.6vw,2.5rem)]" : "t-h3")}>{e.name}</h3>
                  <p className={cn("mt-1.5 text-white/75", big ? "max-w-[30em] text-lg" : "text-[0.9375rem]")}>{e.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-24 border-y border-line bg-bg-2 py-10 md:mt-32">
        <p className="wrap mb-6 text-sm text-muted">{t.steelsTitle}</p>
        <div className="[mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <Marquee pauseOnHover className="p-0 [--duration:50s] [--gap:3.5rem] motion-reduce:[&>div]:animate-none" repeat={3}>
            {STEELS.map((s) => (
              <span
                key={s}
                className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-none tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.35)]"
              >
                {s}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
