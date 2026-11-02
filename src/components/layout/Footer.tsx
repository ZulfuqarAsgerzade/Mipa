import { Phone, Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { site, socials, type Social } from "@/config/site";
import { Logo } from "@/components/ui/brand";
import type { Dictionary } from "@/i18n";

// AILoveDigital's pixel heart, cell by cell (7 × 6 grid)
const HEART = [".11.11.", "1111111", "1111111", ".11111.", "..111..", "...1..."];
const HEART_CELLS = HEART.flatMap((row, y) => [...row].flatMap((c, x) => (c === "1" ? [{ x, y }] : [])));

/** The heart as a small LED panel: separate glowing diodes that beat, with a light wave on hover. */
function PixelHeart() {
  return (
    <svg viewBox="0 0 21 18" width={20} height={17} className="pixel-heart" aria-hidden>
      {HEART_CELLS.map(({ x, y }) => (
        <rect
          key={`${x}-${y}`}
          x={x * 3 + 0.35}
          y={y * 3 + 0.35}
          width={2.3}
          height={2.3}
          rx={0.5}
          style={{ "--d": `${(x + y) * 45}ms` } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}

// lucide dropped brand marks, so these are drawn in its 24px / 2px-stroke style
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const SOCIAL_ICONS: Record<Social, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" width={18} height={18} {...stroke} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width={18} height={18} {...stroke} aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  x: (
    // X's mark is a filled glyph; drawn a touch smaller to match the stroke icons' weight
    <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" aria-hidden>
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zM17.61 20.64h2.04L6.49 3.24H4.3z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" width={18} height={18} {...stroke} aria-hidden>
      <path d="M9 12a4 4 0 1 0 4 4V3c.5 3 2.5 5 6 5" />
    </svg>
  ),
};
const SOCIAL_NAMES: Record<Social, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  tiktok: "TikTok",
};

// networks without a URL yet are previewed (dimmed, not linked) in development only
const PREVIEW_EMPTY = process.env.NODE_ENV === "development";

function SocialBar() {
  const shown = (Object.keys(socials) as Social[]).filter((k) => socials[k] || PREVIEW_EMPTY);
  return (
    <ul className="flex flex-wrap gap-2">
      {shown.map((k) => (
        <li key={k}>
          {socials[k] ? (
            <a
              href={socials[k]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={SOCIAL_NAMES[k]}
              title={SOCIAL_NAMES[k]}
              className="grid h-11 w-11 place-items-center rounded border border-line text-white/85 transition-[color,border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05] hover:text-white"
            >
              {SOCIAL_ICONS[k]}
            </a>
          ) : (
            <span
              title={`${SOCIAL_NAMES[k]}: link not set (src/config/site.ts) — hidden in production`}
              className="grid h-11 w-11 place-items-center rounded border border-dashed border-line text-white/25"
            >
              {SOCIAL_ICONS[k]}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Footer({ t, nav }: { t: Dictionary["footer"]; nav: Dictionary["nav"] }) {
  const links = ["molds", "anatomy", "process", "automotive", "factory"] as const;
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg-2 pt-20">
      <div className="wrap relative grid gap-12 pb-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo variant="full" className="h-24 md:h-28" />
          <p className="t-h2 mt-6 max-w-[22ch] text-white">{t.tagline}</p>
          <nav aria-label={t.social} className="mt-8">
            <SocialBar />
          </nav>
        </div>
        <nav aria-label="Footer" className="md:col-span-3">
          <ul className="space-y-3">
            {links.map((k) => (
              <li key={k}>
                <a href={`#${k}`} className="text-muted transition-colors hover:text-white">{nav[k]}</a>
              </li>
            ))}
          </ul>
        </nav>
        <address className="not-italic md:col-span-4">
          <p className="mb-5 font-medium text-white">{t.contact}</p>
          <ul className="space-y-4 text-muted">
            <li className="flex gap-3">
              <Phone size={17} className="mt-0.5 shrink-0" aria-hidden />
              <span className="flex flex-col gap-1">
                {site.phones.map((p) => (
                  <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="tnum transition-colors hover:text-white">{p}</a>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Mail size={17} className="mt-0.5 shrink-0" aria-hidden />
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-white">{site.email}</a>
            </li>
            <li className="flex gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0" aria-hidden />
              <a href={site.map} target="_blank" rel="noopener noreferrer" className="max-w-[28ch] transition-colors hover:text-white">
                {t.address}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock size={17} className="mt-0.5 shrink-0" aria-hidden />
              <span className="tnum">{t.hours}</span>
            </li>
          </ul>
        </address>
      </div>
      <div className="wrap relative">
        <p
          aria-hidden
          className="select-none text-center font-display text-[clamp(5rem,22vw,22rem)] font-semibold leading-[0.78] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgb(148_163_184/0.18)]"
          style={{ backgroundImage: "linear-gradient(180deg, rgb(255 255 255 / 0.10), transparent 80%)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
        >
          MiPA
        </p>
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 py-6 text-sm text-muted">
          <p>© 2026 {site.name}. {t.rights}</p>
          <a
            href="https://ailovedigital.az"
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center gap-2 transition-colors hover:text-white"
          >
            {t.madeBy}
            <PixelHeart />
            <span className="font-medium text-white">AILoveDigital</span>
            <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
