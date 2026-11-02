import { NumberTicker } from "@/components/ui/number-ticker";
import type { Dictionary, Locale } from "@/i18n";

export function Stats({ stats, t, locale }: { stats: Dictionary["automotive"]["stats"]; t: Dictionary["stats"]; locale: Locale }) {
  const items = [...stats, { value: 4, decimals: 0, prefix: "", suffix: "", label: t.moldTypes }];
  return (
    <section aria-label={t.title} className="relative py-16 md:py-24">
      <div className="wrap">
        <h2 className="sr-only">{t.title}</h2>
        <dl className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
          {items.map((s) => (
            <div
              key={s.label}
              data-reveal
              className="flex flex-col-reverse gap-3 border-line px-4 py-8 first:pl-0 sm:px-8 max-lg:[&:nth-child(2n)]:border-l max-lg:[&:nth-child(-n+2)]:border-b max-lg:[&:nth-child(3)]:pl-0 lg:border-l lg:first:border-l-0"
            >
              <dt className="max-w-[16em] text-[0.9375rem] leading-snug text-muted">{s.label}</dt>
              <dd className="whitespace-nowrap font-display text-[clamp(1.75rem,3.4vw,3.5rem)] font-semibold leading-none tracking-[-0.04em] text-white">
                {s.prefix}
                <NumberTicker value={s.value} decimalPlaces={s.decimals} locale={locale} className="tracking-[-0.04em] text-inherit dark:text-inherit" />
                {s.suffix && <span className="text-[0.5em] tracking-normal text-muted">{s.suffix}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
