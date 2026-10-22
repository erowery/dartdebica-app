'use client';

import { useEffect, useMemo, useState } from 'react';
import { LEAGUES_CONFIG } from '@/config/leagues';
import { fetchLeagueData, fetchLeagueStats, fetchLeagueSchedule } from '@/lib/nakkaApi';
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

function barColor(idx: number, n: number): string {
  const third = Math.max(1, Math.floor(n / 3));
  if (idx < third) return '#2dd6a7';
  if (idx >= n - third && n >= 4) return '#f87171';
  return '#f2b134';
}

export default function TabelePage() {
  const [leagueId, setLeagueId] = useState(LEAGUES_CONFIG[0].id);
  const [tournament, setTournament] = useState<any>(null);
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [schedule, setSchedule] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const league = LEAGUES_CONFIG.find((l) => l.id === leagueId)!;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    (async () => {
      const [d, s, sch] = await Promise.all([
        fetchLeagueData(league.nakkaId),
        fetchLeagueStats(league.nakkaId),
        fetchLeagueSchedule(league.nakkaId),
      ]);
      if (cancelled) return;
      if (!d) setError(true);
      setTournament(d?.tournament ?? null);
      setStats(s);
      setSchedule(sch);
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

    // gospodarz = pierwszy zawodnik na karcie terminarza
    const hostOf: Record<string, string> = {};
    (schedule || []).forEach((division: any[], di: number) => {
      (division || []).forEach((card: any) => {
        if (card?.p?.length >= 2) hostOf[`${di}_${card.lsid}`] = card.p[0];
      });
    });

    return st.divisions.map((div, di) => {
      const rows: Row[] = sortRows(div).map((r) => ({ ...r, stat: byTpid[r.tpid] }));
      const pos: Record<string, number> = {};
      rows.forEach((r, i) => (pos[r.tpid] = i));
      // cells[hostTpid][guestTpid] = {h, g}
      const cells: Record<string, Record<string, { h: number; g: number }>> = {};
      Object.keys(tournament.lg_result || {}).forEach((key) => {
        if (!key.startsWith(`${di}_`)) return;
        const m = tournament.lg_result[key];
        const ids = Object.keys(m || {});
        if (ids.length < 2) return;
        let host = hostOf[key];
        if (!host || !ids.includes(host)) host = ids[0];
        const guest = ids.find((x) => x !== host)!;
        const rh = m[host]?.[guest];
        const rg = m[guest]?.[host];
        if (!rh || !rg) return;
        (cells[host] ||= {})[guest] = { h: rh.r ?? 0, g: rg.r ?? 0 };
      });
      return { di, rows, cells };
    });
  }, [tournament, stats, schedule]);

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
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-ink-700">
                        <th className={th}>#</th>
                        <th className={`${th} text-left`}>Gracz</th>
                        {g.rows.map((_, i) => (
                          <th key={i} className={`${th} min-w-[44px]`}>{i + 1}</th>
                        ))}
                        {['M', 'W', 'R', 'P', '+/-', 'PKT', 'Śr.', 'HO', 'BL', '100+', '140+', '170+', '180'].map((h) => (
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
                            {g.rows.map((c, j) => {
                              if (i === j) return <td key={j} className="bg-ink-700/70" />;
                              const cell = g.cells[r.tpid]?.[c.tpid];
                              if (!cell) return <td key={j} className={`${td} text-slate-600`}>·</td>;
                              const color =
                                cell.h > cell.g ? 'text-brand' : cell.h < cell.g ? 'text-red-400' : 'text-gold';
                              return (
                                <td key={j} className={`${td} font-bold ${color}`}>
                                  {cell.h}:{cell.g}
                                </td>
                              );
                            })}
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

        <p className="text-xs text-slate-500">
          Wiersz — gospodarz, kolumna — gość. HO — najwyższe zamknięcie, BL — najlepszy leg.
        </p>
      </div>
    </main>
  );
}
