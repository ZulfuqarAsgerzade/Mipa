"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/** Scrolls through Lenis when it is running, natively otherwise. */
export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 });
  else window.scrollTo({ top: y });
}

export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // reveal-on-scroll for anything marked data-reveal
    const batch = ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      once: true,
      onEnter: (els) =>
        gsap.to(els, { opacity: 1, y: 0, duration: reduced ? 0 : 1, ease: "expo.out", stagger: 0.08, overwrite: true }),
    });

    // ScrollTrigger only re-measures on load/resize. Content that changes height later (the mold tabs,
    // late images or fonts) would leave every pin below it starting at a stale offset, so sections
    // overlap; re-measure whenever the page height actually changes.
    let lastHeight = document.documentElement.scrollHeight;
    let pending = 0;
    const heightWatch = new ResizeObserver(() => {
      window.clearTimeout(pending);
      pending = window.setTimeout(() => {
        if (document.documentElement.scrollHeight === lastHeight) return;
        ScrollTrigger.refresh();
        lastHeight = document.documentElement.scrollHeight; // includes the pin spacing refresh just applied
      }, 150);
    });
    heightWatch.observe(document.body);

    // A full refresh measures from the top and is meant to put the reader back afterwards, but when a
    // breakpoint creates a pin mid-refresh (Process at 1024px) it loses the position and leaves the page at 0.
    let readerAt = 0;
    const remember = () => (readerAt = window.scrollY);
    const restore = () => {
      if (readerAt > 0 && window.scrollY === 0) window.scrollTo(0, readerAt);
    };
    ScrollTrigger.addEventListener("refreshInit", remember);
    ScrollTrigger.addEventListener("refresh", restore);

    const stopWatching = () => {
      heightWatch.disconnect();
      window.clearTimeout(pending);
      ScrollTrigger.removeEventListener("refreshInit", remember);
      ScrollTrigger.removeEventListener("refresh", restore);
    };

    if (reduced) {
      return () => {
        stopWatching();
        batch.forEach((t) => t.kill());
      };
    }

    // photos: a shutter-like wipe on entry, then a slow drift while in view
    // created after sibling sections have set up their pins, then sorted by position
    const fx = gsap.context(() => {});
    const setup = window.setTimeout(() => fx.add(() => {
      gsap.utils.toArray<HTMLElement>("[data-photo]").forEach((el) => {
        const img = el.querySelector("img");
        gsap.fromTo(el, { clipPath: "inset(12% 0 12% 0)" }, {
          clipPath: "inset(0% 0 0% 0)", ease: "power3.out", duration: 1.4,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
        if (img && el.dataset.photo !== "static") {
          gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, {
            yPercent: 6, scale: 1.14, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        }
      });
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }), 0);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis!.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // in-page anchors go through Lenis so pinned scenes stay in sync
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis!.scrollTo(el as HTMLElement, { offset: 0, duration: 1.4 });
      history.replaceState(null, "", id);
    };
    document.addEventListener("click", onClick);

    return () => {
      stopWatching();
      document.removeEventListener("click", onClick);
      window.removeEventListener("load", refresh);
      window.clearTimeout(setup);
      fx.revert();
      gsap.ticker.remove(tick);
      batch.forEach((t) => t.kill());
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
