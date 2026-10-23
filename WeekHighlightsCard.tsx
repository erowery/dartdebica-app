'use client';

import { WeekHighlights, Highlight } from '@/lib/weekly';

function Tile({ label, h, unit, digits = 0 }: { label: string; h: Highlight | null; unit?: string; digits?: number }) {
  return (
    <div className="rounded-xl bg-ink-800/70 border border-ink-700 px-3 py-2.5 min-w-0 flex items-center gap-3 min-[520px]:block">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-slate-400 leading-tight">{label}</p>
        {h && (
          <>
            <p className="text-[14px] font-semibold text-white leading-snug mt-0.5 min-[520px]:hidden">{h.name}</p>
            <p className="text-[11px] text-slate-400 leading-snug min-[520px]:hidden">vs {h.opponent}</p>
          </>
        )}
      </div>
      {h ? (
        <>
          <p className="shrink-0 text-[26px] min-[520px]:text-[22px] font-extrabold text-gold tabular-nums leading-tight min-[520px]:mt-1">
            {h.value.toFixed(digits)}
            {unit && <span className="text-[12px] font-semibold text-slate-400 ml-1">{unit}</span>}
          </p>
          <p className="hidden min-[520px]:block text-[13px] font-semibold text-white leading-snug mt-0.5">{h.name}</p>
          <p className="hidden min-[520px]:block text-[11px] text-slate-400 leading-snug">vs {h.opponent}</p>
        </>
      ) : (
        <p className="shrink-0 text-[22px] font-extrabold text-slate-500 leading-tight min-[520px]:mt-1">–</p>
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
      <div className={`grid grid-cols-1 min-[520px]:grid-cols-3 gap-2 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[64px] min-[520px]:h-[92px] rounded-xl bg-ink-800/60 border border-ink-700 animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-1 min-[520px]:grid-cols-3 gap-2 ${className}`}>
      <Tile label="Najwyższa średnia" h={highlights.topAverage} digits={2} />
      <Tile label="Best leg" h={highlights.bestLeg} />
      <Tile label="Najwyższy checkout" h={highlights.topCheckout} />
    </div>
  );
}
