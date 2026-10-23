'use client';

import { useEffect, useState } from 'react';
import { ARCHIVE_SEASONS } from '@/config/leagues';
import { fetchLeagueData } from '@/lib/nakkaApi';
import { computeLeagueStandings, StandingRow } from '@/lib/standings';

interface FinalTable {
  name: string;
  groups: StandingRow[][];
  error: boolean;
}

function sortRows(rows: StandingRow[]): StandingRow[] {
  return [...rows].sort(
    (a, b) =>
      b.points - a.points ||
      b.legsFor - b.legsAgainst - (a.legsFor - a.legsAgainst) ||
      b.legsFor - a.legsFor ||
      a.name.localeCompare(b.name, 'pl')
  );
}

const PODIUM = [
  { label: 'Mistrz', ring: '#f2b134', text: 'text-gold', bg: 'from-gold/20' },
  { label: '2. miejsce', ring: '#cbd5e1', text: 'text-slate-200', bg: 'from-slate-300/10' },
  { label: '3. miejsce', ring: '#d97706', text: 'text-amber-500', bg: 'from-amber-600/10' },
];

function LeagueFinal({ t }: { t: FinalTable }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl">
      <p className="text-[15px] font-extrabold tracking-wider text-brand uppercase mb-3">{t.name}</p>
      {t.error && <p className="text-sm text-slate-400">Nie udało się pobrać tabeli z Nakka.</p>}
      {t.groups.map((rows, gi) => (
        <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
          {t.groups.length > 1 && <p className="text-[12px] text-slate-400 mb-2">Grupa {gi + 1}</p>}
          {rows[0] && (
            <div className={`flex items-center gap-3 p-3 rounded-xl border border-gold/40 bg-gradient-to-r ${PODIUM[0].bg} to-transparent mb-2`}>
              <span className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center" style={{ border: `2.5px solid ${PODIUM[0].ring}` }}>
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#f2b134" strokeWidth="1.8" strokeLinejoin="round">
                  <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
                  <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-gold">Mistrz</p>
                <p className="text-[17px] font-extrabold text-white leading-tight">{rows[0].name}</p>
              </div>
              <p className="shrink-0 text-[15px] font-bold text-gold tabular-nums">{rows[0].points} pkt</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {rows.slice(1, 3).map((r, i) => (
              <div key={r.tpid} className={`p-2.5 rounded-xl border border-ink-700 bg-gradient-to-r ${PODIUM[i + 1].bg} to-transparent`}>
                <p className={`text-[11px] ${PODIUM[i + 1].text}`}>{PODIUM[i + 1].label}</p>
                <p className="text-[14px] font-bold text-white leading-tight">{r.name}</p>
                <p className="text-[12px] text-slate-400 tabular-nums">{r.points} pkt</p>
              </div>
            ))}
          </div>
          {showTable && (
            <div className="mt-3 rounded-xl border border-ink-700 overflow-hidden">
              <table className="w-full text-[13px] tabular-nums">
                <tbody className="divide-y divide-ink-700/60">
                  {rows.map((r, i) => (
                    <tr key={r.tpid}>
                      <td className="py-1.5 pl-3 pr-1 w-8 text-slate-400">{i + 1}</td>
                      <td className="py-1.5 px-1 text-white">{r.name}</td>
                      <td className="py-1.5 px-1 text-center text-slate-400">
                        {r.won}-{r.drawn}-{r.lost}
                      </td>
                      <td className="py-1.5 pl-1 pr-3 text-right font-bold text-brand">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
      {t.groups.length > 0 && (
        <button onClick={() => setShowTable((v) => !v)} className="w-full mt-3 text-[13px] font-semibold text-slate-300">
          {showTable ? 'Ukryj tabelę końcową' : 'Pokaż tabelę końcową'}
        </button>
      )}
    </div>
  );
}

/** Zakładka Historia: końcowe tabele i mistrzowie zakończonych sezonów (z archiwum w config/leagues.ts) */
export default function HistoryView() {
  const [idx, setIdx] = useState(0);
  const [tables, setTables] = useState<FinalTable[] | null>(null);
  const season = ARCHIVE_SEASONS[idx];

  useEffect(() => {
    if (!season) return;
    let cancelled = false;
    setTables(null);
    Promise.all(
      season.leagues.map(async (l): Promise<FinalTable> => {
        const d = await fetchLeagueData(l.nakkaId);
        const st = d?.tournament ? computeLeagueStandings(d.tournament) : null;
        return { name: l.name, groups: st ? st.divisions.map(sortRows) : [], error: !st };
      })
    ).then((res) => !cancelled && setTables(res));
    return () => {
      cancelled = true;
    };
  }, [season]);

  if (!season) {
    return <p className="text-sm text-slate-400">Historia pojawi się po zakończeniu pierwszego sezonu.</p>;
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {ARCHIVE_SEASONS.map((s, i) => (
          <button
            key={s.season}
            onClick={() => setIdx(i)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold border transition ${
              i === idx ? 'bg-gold text-ink-950 border-gold' : 'bg-ink-800 text-slate-300 border-ink-700'
            }`}
          >
            Sezon {s.season}
          </button>
        ))}
      </div>
      {!tables ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-ink-800/60 border border-ink-700" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {tables.map((t) => (
            <div key={t.name}>
              <LeagueFinal t={t} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
