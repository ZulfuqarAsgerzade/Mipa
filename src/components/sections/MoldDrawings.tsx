// Section drawings of each mold type, in the manner of a toolroom drawing:
// hatched steel in section, the formed part in layout blue, dimensions in straw.

const S = { stroke: "currentColor", strokeWidth: 1.4, fill: "none" } as const;
const P = { pathLength: 1, className: "draw" } as const;

function Defs() {
  return (
    <defs>
      <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="0.9" opacity="0.28" />
      </pattern>
      <linearGradient id="part-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3d6bff" />
        <stop offset="1" stopColor="#22d3ee" />
      </linearGradient>
      <marker id="arw" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L8 4 L0 8 z" fill="var(--amber)" />
      </marker>
    </defs>
  );
}

function Dim({ x1, y1, x2, y2, label, lx, ly }: { x1: number; y1: number; x2: number; y2: number; label: string; lx: number; ly: number }) {
  return (
    <g className="fade-in">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--amber)" strokeWidth="1" markerStart="url(#arw)" markerEnd="url(#arw)" />
      <text x={lx} y={ly} fill="var(--amber)" fontSize="11" fontFamily="var(--font-inter)" textAnchor="middle" className="tnum">
        {label}
      </text>
    </g>
  );
}

function Injection() {
  return (
    <>
      {/* A plate with cavity */}
      <path {...P} {...S} fill="url(#hatch)" d="M40 40 H200 V190 H40 Z M200 80 H170 Q160 80 160 90 V140 Q160 150 170 150 H200" />
      {/* B plate with core */}
      <path {...P} {...S} fill="url(#hatch)" className="draw draw-late" d="M210 40 H360 V190 H210 V150 H186 Q178 150 178 142 V88 Q178 80 186 80 H210 Z" />
      {/* part */}
      <path {...P} className="draw draw-late" d="M200 80 H170 Q160 80 160 90 V140 Q160 150 170 150 H200 V146 H174 Q168 146 168 138 V92 Q168 84 174 84 H200 Z" fill="url(#part-g)" stroke="url(#part-g)" strokeWidth={1} />
      {/* sprue */}
      <path {...S} className="fade-in" d="M20 115 H160" strokeDasharray="4 3" />
      {/* ejector pins */}
      {[95, 135].map((y) => (
        <path key={y} {...P} {...S} className="draw draw-late" d={`M178 ${y} H330 M330 ${y - 6} V${y + 6}`} />
      ))}
      <Dim x1={160} y1={210} x2={200} y2={210} label="±0.01" lx={180} ly={228} />
    </>
  );
}

function DieCast() {
  return (
    <>
      <path {...P} {...S} fill="url(#hatch)" d="M60 30 H200 V200 H60 Z M200 70 H150 L140 90 V140 L150 160 H200" />
      <path {...P} {...S} fill="url(#hatch)" className="draw draw-late" d="M210 30 H350 V200 H210 V160 H185 L178 140 V90 L185 70 H210 Z" />
      <path {...P} className="draw draw-late" d="M200 70 H150 L140 90 V140 L150 160 H200 V154 H186 L178 140 V90 L186 76 H200 Z" fill="url(#part-g)" stroke="url(#part-g)" strokeWidth={1} />
      {/* shot sleeve + plunger */}
      <path {...P} {...S} d="M20 150 H140 M20 170 H140 M140 150 V170" />
      <path {...P} {...S} className="draw draw-late" d="M8 154 H70 V166 H8" />
      <Dim x1={140} y1={215} x2={200} y2={215} label="H13" lx={170} ly={233} />
    </>
  );
}

function Stamping() {
  return (
    <>
      {/* punch */}
      <path {...P} {...S} fill="url(#hatch)" d="M120 20 H280 V60 H230 V110 H170 V60 H120 Z" />
      {/* die */}
      <path {...P} {...S} fill="url(#hatch)" className="draw draw-late" d="M60 140 H160 V180 H240 V140 H340 V215 H60 Z" />
      {/* sheet strip */}
      <path {...P} className="draw draw-late" d="M30 124 H370 V132 H30 Z" fill="url(#part-g)" stroke="url(#part-g)" strokeWidth={1} />
      {/* guide posts */}
      {[80, 320].map((x) => (
        <path key={x} {...S} className="fade-in" d={`M${x} 20 V140`} strokeDasharray="5 3" />
      ))}
      <Dim x1={170} y1={100} x2={230} y2={100} label="±0.02" lx={200} ly={94} />
    </>
  );
}

function Concrete() {
  return (
    <>
      {/* tamper head */}
      <path {...P} {...S} fill="url(#hatch)" d="M50 20 H350 V50 H50 Z" />
      {[90, 170, 250].map((x) => (
        <path key={x} {...P} {...S} className="draw draw-late" d={`M${x} 50 V80 H${x + 60} V50`} />
      ))}
      {/* mold box with cavities */}
      <path {...P} {...S} fill="url(#hatch)" d="M50 100 H350 V200 H50 Z" />
      {[80, 160, 240].map((x) => (
        <path key={x} {...P} className="draw draw-late" d={`M${x + 4} 108 H${x + 76} V170 H${x + 4} Z`} fill="url(#part-g)" stroke="url(#part-g)" strokeWidth={1} />
      ))}
      <Dim x1={84} y1={222} x2={156} y2={222} label="80 000+" lx={120} ly={240} />
    </>
  );
}

const DRAWINGS = { injection: Injection, diecast: DieCast, stamping: Stamping, concrete: Concrete } as const;

export function MoldDrawing({ id }: { id: string }) {
  const D = DRAWINGS[id as keyof typeof DRAWINGS];
  return (
    <svg key={id} viewBox="0 0 400 250" className="drawing h-auto w-full text-[#c6d2e6]" aria-hidden>
      <Defs />
      <D />
    </svg>
  );
}
