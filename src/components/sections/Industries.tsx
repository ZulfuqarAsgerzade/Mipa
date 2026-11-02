import type { Dictionary } from "@/i18n";

/** The industries we serve, as a plain line under the reel. */
export function Industries({ t }: { t: Dictionary["industries"] }) {
  return (
    <section aria-label={t.title} className="wrap grid gap-6 border-b border-line py-14 md:grid-cols-[14rem_1fr] md:py-20">
      <h3 className="text-sm font-medium text-muted">{t.title}</h3>
      <ul className="flex flex-wrap gap-x-10 gap-y-3 font-display text-[clamp(1.15rem,1.6vw,1.5rem)] font-medium tracking-[-0.02em] text-white">
        {t.items.map((item) => (
          <li key={item} data-reveal>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
