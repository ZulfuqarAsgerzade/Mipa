import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// MiPA Company logo, vectorised from the brand's Instagram avatar (same geometry as public/brand/mipa-logo.svg).
const STAR = "M0,-24 L4.6,-11.1 L17,-17 L11.1,-4.6 L24,0 L11.1,4.6 L17,17 L4.6,11.1 L0,24 L-4.6,11.1 L-17,17 L-11.1,4.6 L-24,0 L-11.1,-4.6 L-17,-17 L-4.6,-11.1 Z";
const STARS = Array.from({ length: 12 }, (_, i) => {
  const a = ((15 + i * 30) * Math.PI) / 180;
  return { x: 724 + 307 * Math.cos(a), y: 675 + 307 * Math.sin(a), r: 15 + i * 30 };
});

function Letters({ grad, shift = 0 }: { grad: string; shift?: number }) {
  return (
    <>
      <g fill="none" stroke={`url(#${grad})`} strokeWidth="36" strokeMiterlimit="3">
        <g transform={`translate(${shift} 0)`}>
          <path d="M78,767 V628 L150,735 L222,628 V767" />
          <path d="M281,662 V767" />
        </g>
        <g transform={`translate(${-shift} 0)`}>
          <path d="M1168,767 V628 H1212 A42,42 0 0 1 1212,712 H1168" />
          <path d="M1295,767 L1365,650 L1435,767" />
          <path d="M1322,724 H1408" />
        </g>
      </g>
      <rect x={263 + shift} y="610" width="36" height="34" fill={`url(#${grad})`} />
    </>
  );
}

function Mark({ grad }: { grad: string }) {
  return (
    <g transform="translate(0 807) skewX(-29) translate(0 -807)" fill="none" stroke={`url(#${grad})`} strokeWidth="34" strokeLinejoin="round">
      <path d="M542,807 V606 Q542,570 578,570 H786" />
      <path d="M626,639 H768 V776 H622 V705 H708" />
    </g>
  );
}

function Gradients({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-v`} gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="780">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.55" stopColor="#c9ced6" />
        <stop offset="1" stopColor="#8b939e" />
      </linearGradient>
      <linearGradient id={`${id}-h`} gradientUnits="userSpaceOnUse" x1="560" y1="0" x2="980" y2="0">
        <stop offset="0" stopColor="#9aa2ad" />
        <stop offset="0.5" stopColor="#f4f6f8" />
        <stop offset="1" stopColor="#9aa2ad" />
      </linearGradient>
    </defs>
  );
}

/**
 * `compact`: Mi + mark + PA on one line for the header, where the star ring would shrink the letters past legibility.
 * `full`: the complete lockup with the star ring and COMPANY.
 */
export function Logo({ variant = "compact", className }: { variant?: "compact" | "full"; className?: string }) {
  if (variant === "compact") {
    return (
      <svg viewBox="150 530 1220 290" className={cn("h-8 w-auto md:h-9", className)} role="img" aria-label="MiPA Company">
        <Gradients id="lg-c" />
        <Letters grad="lg-c-v" shift={130} />
        <Mark grad="lg-c-h" />
      </svg>
    );
  }
  return (
    <svg viewBox="40 330 1440 880" className={cn("h-28 w-auto", className)} role="img" aria-label="MiPA Company">
      <Gradients id="lg-f" />
      <g fill="#d3d8de">
        {STARS.map((s) => (
          <path key={s.r} d={STAR} transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) rotate(${s.r})`} />
        ))}
      </g>
      <Letters grad="lg-f-v" />
      <Mark grad="lg-f-h" />
      <g fill="none" stroke="#c4cad2" strokeWidth="8">
        <path d="M537.5,1114.4 A32,32 0 1 0 537.5,1155.6" />
        <circle cx="597" cy="1135" r="32" />
        <path d="M652,1170 V1100 L681,1150 L710,1100 V1170" />
        <path d="M733,1170 V1100 H757 A18,18 0 0 1 757,1136 H733" />
        <path d="M798,1170 L827,1100 L856,1170 M810,1145 H844" />
        <path d="M879,1170 V1100 L929,1170 V1100" />
        <path d="M950,1100 L980,1137 L1010,1100 M980,1137 V1170" />
      </g>
    </svg>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <span className="kicker">{children}</span>;
}

export function SectionHead({
  kicker,
  title,
  lead,
  center,
  className,
}: {
  kicker: string;
  title: ReactNode;
  lead?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5", center && "items-center text-center", className)}>
      <div data-reveal>
        <Kicker>{kicker}</Kicker>
      </div>
      <h2 data-reveal className="t-h1 max-w-[18ch] text-white">
        {title}
      </h2>
      {lead && (
        <p data-reveal className={cn("t-lead", center && "mx-auto")}>
          {lead}
        </p>
      )}
    </div>
  );
}

