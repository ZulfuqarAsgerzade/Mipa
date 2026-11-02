import { Cpu, PanelTop, Box, PanelBottom, Layers2, ArrowUpFromLine, SquareStack } from "lucide-react";
import { FrameScroller, Callout } from "@/components/motion/FrameScroller";
import { Kicker } from "@/components/ui/brand";
import { GridPattern } from "@/components/ui/grid-pattern";
import type { Dictionary } from "@/i18n";

// order follows the explode sequence; directions keep leaders clear of neighbouring parts
const LABELS = [
  { key: "topClamp", from: 0.16, dir: "se", reach: 30, Icon: PanelTop },
  { key: "aPlate", from: 0.24, dir: "ne", reach: 40, Icon: SquareStack },
  { key: "part", from: 0.32, dir: "sw", reach: 70, Icon: Box },
  { key: "bPlate", from: 0.4, dir: "ne", reach: 50, Icon: Layers2 },
  { key: "support", from: 0.48, dir: "sw", reach: 110, Icon: Cpu },
  { key: "ejector", from: 0.56, dir: "ne", reach: 40, Icon: ArrowUpFromLine },
  { key: "bottomClamp", from: 0.64, dir: "sw", reach: 40, Icon: PanelBottom },
] as const;

/** Blueprint grid under a neutral key light: the exploded view reads as a technical plate. */
function AnatomyBackground() {
  return (
    <>
      <GridPattern width={48} height={48} className="fill-transparent stroke-white/[0.035] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(45% 45% at 50% 58%, rgb(214 222 235 / 0.08), transparent 70%)" }} />
    </>
  );
}

export function Anatomy({ t, kicker }: { t: Dictionary["anatomy"]; kicker: string }) {
  return (
    <FrameScroller seq="anatomy" length={3} staticProgress={1} label={t.sceneLabel} id="anatomy" className="anatomy" background={<AnatomyBackground />}>
      <div className="absolute inset-x-0 top-0 pt-[calc(var(--header-h)+1.5rem)]">
        <div className="wrap flex flex-col gap-4">
          <div>
            <Kicker>{kicker}</Kicker>
          </div>
          <h2 className="t-h1 max-w-[16ch] text-white">
            {t.title}
          </h2>
          <p className="t-lead max-w-[34em] max-md:hidden">{t.lead}</p>
        </div>
      </div>
      {LABELS.map(({ key, Icon, ...l }, i) => (
        <Callout
          key={key}
          anchor={key}
          from={l.from}
          to={LABELS[i + 3]?.from ?? 1.01}
          captionTo={LABELS[i + 1]?.from ?? 1.01}
          dir={l.dir}
          reach={l.reach}
          icon={<Icon size={18} />}
          title={t.labels[key].name}
          text={t.labels[key].note}
        />
      ))}
    </FrameScroller>
  );
}
