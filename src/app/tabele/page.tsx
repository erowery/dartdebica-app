'use client';

import { useEffect, useMemo, useState } from 'react';
import { LEAGUES_CONFIG } from '@/config/leagues';
import { fetchLeagueData, fetchLeagueStats } from '@/lib/nakkaApi';
import { computeLeagueStandings, buildPlayerStats, StandingRow, PlayerStatRow } from '@/lib/standings';

interface Row extends StandingRow {
  stat?: PlayerStatRow;
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

// 1 = awans (zielony), 2-3 = baraż z wyższą ligą (żółty),
// ostatni = spadek (czerwony), 2. i 3. od końca = baraż z niższą ligą (żółty)
function barColor(idx: number, n: number): string {
  if (idx === 0) return '#2dd6a7';
  if (idx === n - 1) return '#f87171';
  if (idx <= 2 || idx >= n - 3) return '#f2b134';
  return 'transparent';
}

export default function TabelePage() {
  const [leagueId, setLeagueId] = useState(LEAGUES_CONFIG[0].id);
  const [tournament, setTournament] = useState<any>(null);
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const league = LEAGUES_CONFIG.find((l) => l.id === leagueId)!;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    (async () => {
      const [d, s] = await Promise.all([
        fetchLeagueData(league.nakkaId),
        fetchLeagueStats(league.nakkaId),
      ]);
      if (cancelled) return;
      if (!d) setError(true);
      setTournament(d?.tournament ?? null);
      setStats(s);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [league.nakkaId]);

  const groups = useMemo(() => {
    if (!tournament) return [];
    const st = computeLeagueStandings(tournament);
    if (!st) return [];
    const pstats = buildPlayerStats(tournament, stats);
    const byTpid: Record<string, PlayerStatRow> = {};
    pstats.forEach((p) => (byTpid[p.tpid] = p));

    return st.divisions.map((div, di) => {
      const rows: Row[] = sortRows(div).map((r) => ({ ...r, stat: byTpid[r.tpid] }));
      return { di, rows };
    });
  }, [tournament, stats]);

  const th = 'px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center whitespace-nowrap';
  const td = 'px-2 py-2 text-center text-sm tabular-nums whitespace-nowrap';

  return (
    <main className="min-h-screen bg-ink-950 bg-radial-fade text-white px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-center gap-3 mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide">
              {league.name.toUpperCase()}
            </h1>
            <p className="text-xs text-slate-400">Dart Dębica Zone · tabela rozszerzona</p>
          </div>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto">
          {LEAGUES_CONFIG.map((l) => (
            <button
              key={l.id}
              onClick={() => setLeagueId(l.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition whitespace-nowrap ${
                l.id === leagueId
                  ? 'bg-brand text-ink-950 border-brand shadow-glow'
                  : 'bg-ink-800 text-slate-300 border-ink-700 hover:border-brand/50'
              }`}
            >
              {l.id.toUpperCase()}
            </button>
          ))}
        </div>

        {loading && <p className="text-slate-400">Ładowanie…</p>}
        {!loading && (error || groups.length === 0) && (
          <p className="text-slate-400">Brak danych dla tej ligi.</p>
        )}

        {!loading &&
          groups.map((g) => {
            const n = g.rows.length;
            return (
              <section key={g.di} className="mb-8 animate-fadeIn">
                {groups.length > 1 && (
                  <h2 className="text-sm font-bold text-brand mb-2">Grupa {g.di + 1}</h2>
                )}
                <div className="overflow-x-auto rounded-2xl border border-ink-700 bg-ink-900">
                  <table className="w-full border-collapse min-w-[720px]">
                    <thead>
                      <tr className="border-b border-ink-700">
                        <th className={th}>#</th>
                        <th className={`${th} text-left`}>Gracz</th>
                        {['M', 'W', 'R', 'P', '+/-', 'PKT', 'ŚR.', 'HO', 'BL', '100+', '140+', '170+', '180'].map((h) => (
                          <th key={h} className={`${th} ${h === 'PKT' ? 'text-brand' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {g.rows.map((r, i) => {
                        const diff = r.legsFor - r.legsAgainst;
                        const s = r.stat;
                        return (
                          <tr key={r.tpid} className="border-b border-ink-800 last:border-0">
                            <td
                              className={`${td} font-bold`}
                              style={{ boxShadow: `inset 4px 0 0 ${barColor(i, n)}` }}
                            >
                              {i + 1}
                            </td>
                            <td className={`${td} text-left font-semibold`}>{r.name}</td>
                            <td className={td}>{r.played}</td>
                            <td className={td}>{r.won}</td>
                            <td className={td}>{r.drawn}</td>
                            <td className={td}>{r.lost}</td>
                            <td className={`${td} ${diff > 0 ? 'text-brand' : diff < 0 ? 'text-red-400' : ''}`}>
                              {diff > 0 ? `+${diff}` : diff}
                            </td>
                            <td className={`${td} font-extrabold text-brand`}>{r.points}</td>
                            <td className={td}>{s?.average != null ? s.average.toFixed(2) : '–'}</td>
                            <td className={td}>{s?.highOut || '–'}</td>
                            <td className={td}>{s?.bestLeg || '–'}</td>
                            <td className={td}>{s?.t100 ?? 0}</td>
                            <td className={td}>{s?.t140 ?? 0}</td>
                            <td className={td}>{s?.t170 ?? 0}</td>
                            <td className={td}>{s?.t180 ?? 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
          {[
            ['#2dd6a7', 'Awans'],
            ['#f2b134', 'Baraż'],
            ['#f87171', 'Spadek'],
          ].map(([c, l]) => (
            <span key={l} className="flex items-center gap-2">
              <span className="inline-block w-1 h-4 rounded" style={{ background: c }} />
              {l}
            </span>
          ))}
          <span className="text-slate-500">HO — najwyższe zamknięcie · BL — najlepszy leg</span>
        </div>
      </div>
    </main>
  );
}
