import { ArrowRight, Snowflake, ScanLine, ArrowUpFromLine, ChevronDown } from "lucide-react";
import { FrameScroller, Callout } from "@/components/motion/FrameScroller";

import type { Dictionary } from "@/i18n";

// progress windows of the four stages of the open sequence
const STAGES: [number, number][] = [
  [0, 0.1],
  [0.1, 0.45],
  [0.45, 0.62],
  [0.62, 1.01],
];

/** Studio light: one neutral key light on the mold and a dark floor. */
function HeroBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(45% 55% at 64% 44%, rgb(214 222 235 / 0.10), transparent 70%), linear-gradient(180deg, var(--bg) 0%, #12161b 70%, var(--bg) 100%)",
      }}
    />
  );
}

export function Hero({ t }: { t: Dictionary["hero"] }) {
  const c = t.callouts;
  return (
    <FrameScroller seq="open" length={4} staticProgress={0} label={t.sceneLabel} id="top" className="hero" background={<HeroBackground />}>
      {/* intro */}
      <div
        className="fade-up absolute inset-0 flex items-end pt-[calc(var(--header-h)+1.5rem)] max-md:scrim-b md:items-center md:pb-20 md:scrim-l"
        data-from="0"
        data-to="0.09"
        data-active="true"
      >
        {/* centred between the header and the scroll cue, so it never touches either */}
        <div className="wrap pb-[max(2rem,5vh)] md:pb-0">
          <p className="kicker">{t.badge}</p>
          <h1 className="t-display mt-6 text-white md:mt-7">
            {t.title.map((line, i) => (
              <span className="eject-line" key={i}>
                <span style={{ animationDelay: `${200 + i * 140}ms` }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p className="t-lead mt-6 max-w-[34em] md:mt-8">{t.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3 md:mt-10">
            <a href="#quote" className="btn btn-primary">
              {t.ctaPrimary}
              <ArrowRight size={18} className="arrow" aria-hidden />
            </a>
            <a href="#molds" className="btn btn-ghost max-sm:hidden">{t.ctaSecondary}</a>
          </div>
          {/* only on screens tall enough to fit it without crowding the headline */}
          <ul className="mt-12 hidden max-w-2xl grid-cols-3 gap-8 border-t border-white/10 pt-7 md:[@media(min-height:760px)]:grid">
            {t.features.map((f) => (
              <li key={f.value}>
                <span className="tnum block font-display text-lg font-medium text-white">{f.value}</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* scroll cue */}
      <div className="fade-up absolute inset-x-0 bottom-6 hidden justify-center md:flex" data-from="0" data-to="0.05" data-active="true">
        <span className="flex flex-col items-center gap-1 text-xs text-muted">
          {t.scroll}
          <ChevronDown size={18} className="motion-safe:animate-bounce" aria-hidden />
        </span>
      </div>

      {/* stage rail: shows where the scene is and jumps to a stage */}
      <nav aria-label={t.stagesLabel} className="stage-rail absolute right-[var(--gutter)] top-1/2 hidden -translate-y-1/2 lg:block">
        <div className="relative pl-5">
          <span className="absolute bottom-3 left-[5px] top-3 w-px bg-white/15" aria-hidden />
          <span
            className="absolute left-[5px] top-3 w-px origin-top bg-blue"
            style={{ height: "calc(100% - 1.5rem)", transform: "scaleY(var(--p, 0))" }}
            aria-hidden
          />
          <ol className="flex flex-col gap-7">
            {t.stages.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  data-seek={STAGES[i][0] + 0.02}
                  data-step-from={STAGES[i][0]}
                  data-step-to={STAGES[i][1]}
                  aria-current={i === 0 ? "step" : undefined}
                  className="group flex cursor-pointer items-center gap-3 text-left"
                >
                  <span className="stage-dot absolute left-0 h-[9px] w-[9px] border border-white/40 bg-bg transition-all" />
                  <span className="tnum text-xs text-muted">0{i + 1}</span>
                  <span className="stage-label text-sm text-muted transition-colors group-hover:text-white">{s}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <Callout anchor="cooling" from={0.11} to={0.3} dir="nw" reach={110} icon={<Snowflake size={18} />} title={c.cooling.title} text={c.cooling.text} />
      <Callout anchor="parting" from={0.3} to={0.47} dir="ne" reach={90} icon={<ScanLine size={18} />} title={c.parting.title} text={c.parting.text} />
      <Callout anchor="pins" from={0.48} to={0.62} dir="nw" reach={100} icon={<ArrowUpFromLine size={18} />} title={c.pins.title} text={c.pins.text} />

      {/* outro */}
      <div className="fade-up absolute inset-0 flex items-end scrim-b" data-from="0.86">
        <div className="wrap pb-[max(2.5rem,7vh)]">
          <h2 className="t-h1 max-w-[18ch] text-white">{t.outroTitle}</h2>
          <p className="t-lead mt-5">{t.outroLead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#quote" className="btn btn-primary">
              {t.ctaPrimary}
              <ArrowRight size={18} className="arrow" aria-hidden />
            </a>
            <a href="#molds" className="btn btn-ghost">{t.ctaSecondary}</a>
          </div>
        </div>
      </div>
    </FrameScroller>
  );
}
