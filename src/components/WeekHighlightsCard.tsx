'use client';

import { WeekHighlights, Highlight } from '@/lib/weekly';

function Tile({ label, h, unit, digits = 0 }: { label: string; h: Highlight | null; unit?: string; digits?: number }) {
  return (
    <div className="rounded-xl bg-ink-800/70 border border-ink-700 px-3 py-2.5 min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-slate-500 leading-tight">{label}</p>
      {h ? (
        <>
          <p className="text-[22px] font-extrabold text-gold tabular-nums leading-tight mt-1">
            {h.value.toFixed(digits)}
            {unit && <span className="text-[12px] font-semibold text-slate-400 ml-1">{unit}</span>}
          </p>
          <p className="text-[13px] font-semibold text-white leading-snug mt-0.5">{h.name}</p>
          <p className="text-[11px] text-slate-500 leading-snug">vs {h.opponent}</p>
        </>
      ) : (
        <p className="text-[22px] font-extrabold text-slate-600 leading-tight mt-1">–</p>
      )}
    </div>
  );
}

/** Trzy wyróżnienia tygodnia jednej ligi: najwyższa średnia, best leg, najwyższy checkout */
export default function WeekHighlightsCard({
  highlights,
  className = '',
}: {
  highlights: WeekHighlights | undefined;
  className?: string;
}) {
  if (!highlights) {
    return (
      <div className={`grid grid-cols-3 gap-2 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[92px] rounded-xl bg-ink-800/60 border border-ink-700 animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      <Tile label="Najwyższa średnia" h={highlights.topAverage} digits={2} />
      <Tile label="Best leg" h={highlights.bestLeg} unit="lotek" />
      <Tile label="Najwyższy checkout" h={highlights.topCheckout} />
    </div>
  );
}
