'use client';

import { LeagueStandingsResult, MatchResultRow, PlayerStatRow } from '@/lib/standings';

type Res = 'Z' | 'R' | 'P';

function formOf(tpid: string, results: MatchResultRow[]): Res[] {
  return results
    .filter((r) => r.tpid1 === tpid || r.tpid2 === tpid)
    .slice(-5)
    .map((r) => {
      const mine = r.tpid1 === tpid ? r.legs1 : r.legs2;
      const theirs = r.tpid1 === tpid ? r.legs2 : r.legs1;
      return mine > theirs ? 'Z' : mine < theirs ? 'P' : 'R';
    });
}

const DOT: Record<Res, string> = {
  Z: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  R: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  P: 'bg-red-500/20 text-red-400 border-red-500/40',
};

function Form({ items, align }: { items: Res[]; align: 'left' | 'right' }) {
  if (items.length === 0) return <p className="text-[12px] text-slate-400">brak meczów</p>;
  return (
    <div className={`flex gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
      {items.map((r, i) => (
        <span key={i} className={`w-6 h-6 rounded-md border text-[11px] font-extrabold flex items-center justify-center ${DOT[r]}`}>
          {r}
        </span>
      ))}
    </div>
  );
}

function StatLine({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-2 py-1.5">
      <span className="text-[16px] font-bold text-white tabular-nums">{a}</span>
      <span className="text-[11px] uppercase tracking-wider text-slate-400 text-center">{label}</span>
      <span className="text-[16px] font-bold text-white tabular-nums text-right">{b}</span>
    </div>
  );
}

/**
 * Zapowiedź meczu: neutralne porównanie obu zawodników przed spotkaniem.
 * Celowo bez procentów i bez wskazywania faworyta.
 */
export default function MatchPreview({
  myTpid,
  oppTpid,
  myName,
  oppName,
  standingsResult,
  statsRows,
}: {
  myTpid: string;
  oppTpid: string;
  myName: string;
  oppName: string;
  standingsResult: LeagueStandingsResult | null;
  statsRows: PlayerStatRow[];
}) {
  const results = standingsResult?.results || [];
  const rankOf = (tpid: string) => {
    for (const div of standingsResult?.divisions || []) {
      const i = div.findIndex((r) => r.tpid === tpid);
      if (i >= 0) return i + 1;
    }
    return null;
  };
  const st = (tpid: string) => statsRows.find((p) => p.tpid === tpid);
  const me = st(myTpid);
  const opp = st(oppTpid);
  const direct = results.filter(
    (r) => (r.tpid1 === myTpid && r.tpid2 === oppTpid) || (r.tpid1 === oppTpid && r.tpid2 === myTpid)
  );
  const rMe = rankOf(myTpid);
  const rOpp = rankOf(oppTpid);

  return (
    <div className="mt-3 pt-3 border-t border-ink-700/70">
      <p className="text-[11px] uppercase tracking-wider text-brand mb-2.5">Zapowiedź meczu</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[14px] font-bold text-white leading-tight">{myName}</p>
          <p className="text-[12px] text-slate-400">{rMe ? `${rMe}. miejsce` : '–'}</p>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-bold text-white leading-tight">{oppName}</p>
          <p className="text-[12px] text-slate-400">{rOpp ? `${rOpp}. miejsce` : '–'}</p>
        </div>
      </div>

      <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1.5 text-center">Forma (ostatnie mecze)</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Form items={formOf(myTpid, results)} align="left" />
        <Form items={formOf(oppTpid, results)} align="right" />
      </div>

      <div className="rounded-xl bg-ink-900/60 border border-ink-700 px-3 py-1 divide-y divide-ink-700/50">
        <StatLine label="Średnia" a={me?.average != null ? me.average.toFixed(2) : '–'} b={opp?.average != null ? opp.average.toFixed(2) : '–'} />
        <StatLine label="180 / 170+" a={me ? String(me.t180 + me.t170) : '–'} b={opp ? String(opp.t180 + opp.t170) : '–'} />
        <StatLine label="High out" a={me?.highOut ? String(me.highOut) : '–'} b={opp?.highOut ? String(opp.highOut) : '–'} />
        <StatLine label="Best leg" a={me?.bestLeg ? String(me.bestLeg) : '–'} b={opp?.bestLeg ? String(opp.bestLeg) : '–'} />
      </div>

      <p className="text-[12px] text-slate-400 mt-2.5 text-center">
        {direct.length === 0
          ? 'Pierwsze spotkanie w tym sezonie'
          : `Wcześniejsze spotkania: ${direct
              .map((r) => (r.tpid1 === myTpid ? `${r.legs1}:${r.legs2}` : `${r.legs2}:${r.legs1}`))
              .join(', ')}`}
      </p>
    </div>
  );
}
