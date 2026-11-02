"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu as MenuIcon, X, Globe, ChevronDown, Check } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { locales, type Dictionary, type Locale } from "@/i18n";
import { Logo } from "@/components/ui/brand";
import { cn } from "@/lib/utils";

const LINKS = ["molds", "anatomy", "process", "automotive", "factory"] as const;

export function Header({ t, locale }: { t: Dictionary["nav"]; locale: Locale }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // hide while reading down the page, reveal on any scroll back up; small jitters are ignored
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 160);
        lastY = y;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      // a keyboard user tabbing into a hidden header brings it back
      onFocus={() => setHidden(false)}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-out)] motion-reduce:transition-none",
        hidden && !open && !langOpen && "-translate-y-full"
      )}
    >
      <div
        className={cn(
          // lg: equal side columns keep the links on the page's true centre line
          "relative flex h-16 items-center justify-between gap-4 border-b px-[var(--gutter)] transition-[background-color,border-color] duration-500 md:h-[4.5rem] lg:grid lg:grid-cols-[1fr_auto_1fr]",
          scrolled || open
            ? "border-line bg-[rgb(11_13_16/0.88)] backdrop-blur-md"
            : "border-transparent"
        )}
      >
        <a href="#top" aria-label="MIPA" className="justify-self-start">
          <Logo />
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-[0.9375rem]">
            {LINKS.map((k) => (
              <li key={k}>
                <a href={`#${k}`} className="rounded px-4 py-2 text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white">
                  {t[k]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 justify-self-end sm:gap-2">
          <LangSwitch locale={locale} label={t.language} onOpenChange={setLangOpen} />
          <a href="#quote" className="btn btn-primary hidden min-h-[2.75rem] px-5 text-[0.9375rem] sm:inline-flex">
            {t.cta}
            <ArrowRight size={16} className="arrow" aria-hidden />
          </a>
          <button
            type="button"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded text-white hover:bg-white/[0.06] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.close : t.menu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <MenuIcon size={22} aria-hidden />}
          </button>
        </div>

        <span className="pointer-events-none absolute inset-x-0 -bottom-px h-px overflow-hidden" aria-hidden>
          <span ref={barRef} className="block h-full origin-left bg-blue" style={{ transform: "scaleX(0)" }} />
        </span>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Main"
        hidden={!open}
        className="border-b border-line bg-[rgb(11_13_16/0.97)] p-3 lg:hidden"
      >
        <ul className="flex flex-col">
          {LINKS.map((k) => (
            <li key={k}>
              <a href={`#${k}`} onClick={() => setOpen(false)} className="t-h2 block rounded px-4 py-3 text-white hover:bg-white/[0.05]">
                {t[k]}
              </a>
            </li>
          ))}
          <li className="p-2 pt-3">
            <a href="#quote" onClick={() => setOpen(false)} className="btn btn-primary w-full">
              {t.cta}
              <ArrowRight size={18} className="arrow" aria-hidden />
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

const LANG_NAMES: Record<Locale, string> = { az: "Azərbaycan", en: "English", ru: "Русский" };

function LangSwitch({ locale, label, onOpenChange }: { locale: Locale; label: string; onOpenChange: (open: boolean) => void }) {
  return (
    <Menu.Root onOpenChange={(o) => onOpenChange(o)}>
      <Menu.Trigger
        aria-label={`${label}: ${LANG_NAMES[locale]}`}
        className="group flex h-11 cursor-pointer items-center gap-2 rounded border border-line px-3 text-xs font-semibold uppercase text-white transition-colors hover:border-white/25 data-popup-open:border-white/25"
      >
        <Globe size={15} className="text-muted max-sm:hidden" aria-hidden />
        {locale}
        <ChevronDown size={14} className="text-muted transition-transform group-data-popup-open:rotate-180" aria-hidden />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-[60] outline-none">
          <Menu.Popup className="min-w-44 origin-[var(--transform-origin)] rounded border border-line bg-[rgb(11_13_16/0.97)] p-1 shadow-xl shadow-black/40 outline-none backdrop-blur-md transition-[scale,opacity] duration-150 ease-out data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0">
            {locales.map((l) => (
              <Menu.LinkItem
                key={l}
                href={`/${l}`}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? "true" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm outline-none transition-colors data-highlighted:bg-white/[0.06] data-highlighted:text-white",
                  l === locale ? "text-white" : "text-white/60"
                )}
              >
                <span className="w-6 text-xs font-semibold uppercase text-muted">{l}</span>
                <span className="flex-1">{LANG_NAMES[l]}</span>
                {l === locale && <Check size={15} className="text-blue" aria-hidden />}
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
