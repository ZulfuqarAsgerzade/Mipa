import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Industries } from "@/components/sections/Industries";
import { Reel } from "@/components/sections/Reel";
import { MoldTypes } from "@/components/sections/MoldTypes";
import { Anatomy } from "@/components/sections/Anatomy";
import { Stats } from "@/components/sections/Stats";
import { Process } from "@/components/sections/Process";
import { Automotive } from "@/components/sections/Automotive";
import { Factory } from "@/components/sections/Factory";
import { Quote } from "@/components/sections/Quote";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-bg">
        {t.skip}
      </a>
      <SmoothScroll />
      <Header t={t.nav} locale={lang} />
      <main id="main">
        <Hero t={t.hero} />
        <Reel band={t.band} photos={t.photos} />
        <Industries t={t.industries} />
        <MoldTypes t={t.molds} kicker={t.kickers.molds} photos={t.photos} />
        <Anatomy t={t.anatomy} kicker={t.kickers.anatomy} />
        <Stats stats={t.automotive.stats} t={t.stats} locale={lang} />
        <Process t={t.process} kicker={t.kickers.process} photos={t.photos} />
        <Automotive t={t.automotive} viewer={t.viewer} kicker={t.kickers.automotive} viewerKicker={t.kickers.viewer} photos={t.photos} />
        <Factory t={t.factory} kicker={t.kickers.factory} photos={t.photos} />
        <Quote t={t.quote} moldNames={t.molds.items.map((m) => m.name)} kicker={t.kickers.quote} photoAlt={t.photos["mold-nozzle"]} />
      </main>
      <Footer t={t.footer} nav={t.nav} />
    </>
  );
}
