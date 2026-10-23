'use client';

import { PlayerStatRow, MatchResultRow } from '@/lib/standings';

type P = PlayerStatRow & { leagueName?: string };

interface Metric {
  label: string;
  a: number | null;
  b: number | null;
  lowerIsBetter?: boolean;
  digits?: number;
}

const GOLD = '#f2b134';
const TEAL = '#2dd6a7';

/** Wykres radarowy - każda oś znormalizowana do najlepszego wyniku wśród wszystkich graczy */
function Radar({ axes }: { axes: { label: string; a: number; b: number }[] }) {
  const size = 300;
  const c = size / 2;
  const r = 100;
  const n = axes.length;
  const pt = (i: number, v: number) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [c + Math.cos(ang) * r * v, c + Math.sin(ang) * r * v];
  };
  const poly = (key: 'a' | 'b') => axes.map((ax, i) => pt(i, Math.max(0.04, ax[key])).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] mx-auto" role="img" aria-label="Porównanie profili graczy">
      {[0.25, 0.5, 0.75, 1].map((lvl) => (
        <polygon
          key={lvl}
          points={axes.map((_, i) => pt(i, lvl).join(',')).join(' ')}
          fill="none"
          stroke="#1e1f24"
          strokeWidth={1}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#1e1f24" strokeWidth={1} />;
      })}
      <polygon points={poly('a')} fill={GOLD} fillOpacity={0.22} stroke={GOLD} strokeWidth={2} strokeLinejoin="round" />
      <polygon points={poly('b')} fill={TEAL} fillOpacity={0.22} stroke={TEAL} strokeWidth={2} strokeLinejoin="round" />
      {axes.map((ax, i) => {
        const [x, y] = pt(i, 1.22);
        return (
          <text key={i} x={x} y={y + 4} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#94a3b8">
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
}

function Row({ m }: { m: Metric }) {
  const av = m.a ?? 0;
  const bv = m.b ?? 0;
  const empty = (m.a == null || m.a === 0) && (m.b == null || m.b === 0);
  // przy "mniej = lepiej" (best leg) odwracamy proporcje paska
  const sa = m.lowerIsBetter ? (bv > 0 ? bv : 0) : av;
  const sb = m.lowerIsBetter ? (av > 0 ? av : 0) : bv;
  const total = sa + sb;
  const pctA = total > 0 ? (sa / total) * 100 : 50;
  const aWins = !empty && (m.lowerIsBetter ? av > 0 && (bv === 0 || av < bv) : av > bv);
  const bWins = !empty && (m.lowerIsBetter ? bv > 0 && (av === 0 || bv < av) : bv > av);
  const fmt = (v: number | null) => (v == null || (m.lowerIsBetter && v === 0) ? '–' : m.digits ? v.toFixed(m.digits) : String(v));

  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className={`tabular-nums ${aWins ? 'text-[17px] font-extrabold text-gold' : 'text-[15px] font-semibold text-slate-400'}`}>
          {fmt(m.a)}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-slate-400">
          {m.label}
          {m.lowerIsBetter && <span className="normal-case tracking-normal"> (mniej = lepiej)</span>}
        </span>
        <span className={`tabular-nums ${bWins ? 'text-[17px] font-extrabold text-brand' : 'text-[15px] font-semibold text-slate-400'}`}>
          {fmt(m.b)}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden flex bg-ink-900/70">
        {empty ? (
          <div className="h-full w-full bg-ink-700" />
        ) : (
          <>
            <div className="h-full bg-gold" style={{ width: `${pctA}%`, opacity: aWins ? 1 : 0.45 }} />
            <div className="h-full bg-brand" style={{ width: `${100 - pctA}%`, opacity: bWins ? 1 : 0.45 }} />
          </>
        )}
      </div>
    </div>
  );
}

export default function H2HCompare({
  a,
  b,
  allPlayers,
  results,
}: {
  a: P;
  b: P;
  allPlayers: P[];
  results: MatchResultRow[];
}) {
  const big = (p: P) => p.t170 + p.t180;
  const metrics: Metric[] = [
    { label: 'Średnia', a: a.average, b: b.average, digits: 2 },
    { label: '100+', a: a.t100, b: b.t100 },
    { label: '140+', a: a.t140, b: b.t140 },
    { label: '180 / 170+', a: big(a), b: big(b) },
    { label: '100+ kończenie', a: a.finishes100, b: b.finishes100 },
    { label: 'High out', a: a.highOut, b: b.highOut },
    { label: 'Best leg', a: a.bestLeg, b: b.bestLeg, lowerIsBetter: true },
  ];

  // podsumowanie: w ilu kategoriach prowadzi każdy z graczy
  let winsA = 0;
  let winsB = 0;
  metrics.forEach((m) => {
    const av = m.a ?? 0;
    const bv = m.b ?? 0;
    if (m.lowerIsBetter) {
      if (av > 0 && (bv === 0 || av < bv)) winsA++;
      else if (bv > 0 && (av === 0 || bv < av)) winsB++;
    } else if (av > bv) winsA++;
    else if (bv > av) winsB++;
  });

  // osie radaru - względem najlepszego wyniku w całej lidze (wszystkich ligach z listy)
  const maxOf = (f: (p: P) => number) => Math.max(1, ...allPlayers.map(f));
  const minBest = Math.min(...allPlayers.map((p) => p.bestLeg || 99), 99);
  const norm = (v: number, max: number) => Math.min(1, v / max);
  const axes = [
    { label: 'Średnia', f: (p: P) => p.average ?? 0 },
    { label: '100+', f: (p: P) => p.t100 },
    { label: '140+', f: (p: P) => p.t140 },
    { label: '180/170+', f: big },
    { label: 'High out', f: (p: P) => p.highOut ?? 0 },
  ].map((ax) => {
    const max = maxOf(ax.f);
    return { label: ax.label, a: norm(ax.f(a), max), b: norm(ax.f(b), max) };
  });
  axes.push({
    label: 'Best leg',
    a: a.bestLeg ? minBest / a.bestLeg : 0,
    b: b.bestLeg ? minBest / b.bestLeg : 0,
  });

  // bezpośrednie mecze (gdy obaj grają w tej samej lidze)
  const direct = results.filter(
    (r) => (r.tpid1 === a.tpid && r.tpid2 === b.tpid) || (r.tpid1 === b.tpid && r.tpid2 === a.tpid)
  );

  return (
    <div className="mt-5 animate-fadeIn">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-1">
        <div className="text-left">
          <p className="text-[15px] font-extrabold text-gold leading-tight">{a.name}</p>
          {a.leagueName && <p className="text-[11px] text-slate-400">{a.leagueName}</p>}
        </div>
        <div className="px-3 py-1 rounded-xl bg-ink-900/70 border border-ink-700 text-center">
          <p className="text-[20px] font-extrabold tabular-nums leading-none">
            <span className="text-gold">{winsA}</span>
            <span className="text-slate-500 mx-1">:</span>
            <span className="text-brand">{winsB}</span>
          </p>
          <p className="text-[9px] text-slate-400 mt-0.5">kategorie</p>
        </div>
        <div className="text-right">
          <p className="text-[15px] font-extrabold text-brand leading-tight">{b.name}</p>
          {b.leagueName && <p className="text-[11px] text-slate-400">{b.leagueName}</p>}
        </div>
      </div>

      <Radar axes={axes} />

      {direct.length > 0 && (
        <div className="mb-3 rounded-xl bg-ink-900/60 border border-ink-700 px-3 py-2.5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">Bezpośrednie mecze</p>
          {direct.map((r, i) => {
            const aLegs = r.tpid1 === a.tpid ? r.legs1 : r.legs2;
            const bLegs = r.tpid1 === a.tpid ? r.legs2 : r.legs1;
            return (
              <p key={i} className="text-[15px] font-bold tabular-nums text-center">
                <span className={aLegs > bLegs ? 'text-gold' : 'text-slate-300'}>{aLegs}</span>
                <span className="text-slate-500 mx-1.5">:</span>
                <span className={bLegs > aLegs ? 'text-brand' : 'text-slate-300'}>{bLegs}</span>
              </p>
            );
          })}
        </div>
      )}

      <div className="divide-y divide-ink-700/50">
        {metrics.map((m) => (
          <div key={m.label}>
            <Row m={m} />
          </div>
        ))}
      </div>
    </div>
  );
}
