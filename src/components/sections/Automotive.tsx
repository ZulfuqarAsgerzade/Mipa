import { Turntable } from "@/components/motion/Turntable";
import { SectionHead } from "@/components/ui/brand";
import { Photo } from "@/components/ui/photo";
import type { Dictionary } from "@/i18n";

export function Automotive({
  t,
  viewer,
  kicker,
  viewerKicker,
  photos,
}: {
  t: Dictionary["automotive"];
  viewer: Dictionary["viewer"];
  kicker: string;
  viewerKicker: string;
  photos: Dictionary["photos"];
}) {
  return (
    <section id="automotive" className="relative">
      <div className="relative h-[70svh] min-h-[28rem]">
        <Photo name="auto-robots" alt={photos["auto-robots"]} className="absolute inset-0" shade="none" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,var(--bg)_0%,rgb(11_13_16/0.1)_25%,rgb(11_13_16/0.35)_65%,var(--bg)_100%)]" />
      </div>

      <div className="wrap relative -mt-40 grid gap-14 pb-16 md:pb-24 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionHead kicker={kicker} title={t.title} lead={t.lead} />
          <ul className="mt-10 border-t border-line">
            {t.items.map((item) => (
              <li key={item} data-reveal className="flex items-center gap-4 border-b border-line py-4 font-medium text-white/90">
                <span aria-hidden className="h-1.5 w-1.5 flex-none bg-blue" />
                {item}
              </li>
            ))}
          </ul>
          <Photo
            name="auto-line"
            alt={photos["auto-line"]}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="mt-12 aspect-[16/9] rounded"
          />
        </div>

        <div className="lg:col-span-6 lg:pt-40" data-reveal>
          <div className="glass relative overflow-hidden rounded-md">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="kicker">{viewerKicker}</span>
            </div>
            <div className="bg-[radial-gradient(circle_at_50%_45%,rgb(47_107_255/0.14),transparent_65%)] p-3">
              <Turntable label={viewer.label} hint={viewer.hint} />
            </div>
            <div className="border-t border-line px-5 py-5">
              <h3 className="t-h2 text-white">{viewer.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{viewer.lead}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
