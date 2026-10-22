'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  return '#64748b';
}

export default function TabelePage() {
  const [leagueId, setLeagueId] = useState(LEAGUES_CONFIG[0].id);
  const [tournament, setTournament] = useState<any>(null);
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState<'tabela' | 'statystyki'>('tabela');
  const [saving, setSaving] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

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

  async function downloadImage() {
    if (!captureRef.current || saving) return;
    setSaving(true);
    try {
      const { toPng } = await import('html-to-image');
      // pixelRatio 3 = obraz ok. 1920 px szerokości - ostry na Facebooku/Instagramie
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 3,
        backgroundColor: '#000000',
        cacheBust: true,
        width: captureRef.current.offsetWidth,
        height: captureRef.current.offsetHeight,
        style: { margin: '0' },
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${league.id.toUpperCase()}_${view}_${today.replace(/\./g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert('Nie udało się zapisać zdjęcia. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  }

  const today = new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const th = 'px-1.5 py-3 text-[13px] font-bold uppercase tracking-wider text-slate-400 text-center whitespace-nowrap';
  const td = 'px-1.5 py-2.5 text-center text-[17px] tabular-nums whitespace-nowrap';

  const tabelaCols = ['M', 'W', 'R', 'P', '+/-', 'PKT'];
  const statCols = ['ŚR.', 'HO', 'BL', '100+', '140+', '170+', '180'];

  return (
    <main className="min-h-screen bg-ink-950 text-white px-3 py-6">
      {/* Obszar do zrzutu ekranu: od nagłówka do legendy */}
      <div ref={captureRef} className="mx-auto max-w-[640px] bg-ink-950 bg-radial-fade p-5">
        <div className="flex items-center gap-4 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-16 w-16 object-contain" />
          <div>
            <h1 className="text-[28px] leading-tight font-extrabold tracking-wide">
              {league.name.toUpperCase()}
            </h1>
            <p className="text-[15px] text-slate-400">
              {view === 'tabela' ? 'Tabela' : 'Statystyki zawodników'} · stan na {today}
            </p>
          </div>
        </div>

        {loading && <p className="text-slate-400">Ładowanie…</p>}
        {!loading && (error || groups.length === 0) && (
          <p className="text-slate-400">Brak danych dla tej ligi.</p>
        )}

        {!loading &&
          groups.map((g) => {
            const n = g.rows.length;
            return (
              <section key={g.di} className="mb-6 animate-fadeIn">
                {groups.length > 1 && (
                  <h2 className="text-base font-bold text-brand mb-2">Grupa {g.di + 1}</h2>
                )}
                <div className="overflow-x-auto rounded-2xl border border-ink-700 bg-ink-900">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-ink-700">
                        <th className={th}>#</th>
                        <th className={`${th} text-left`}>Gracz</th>
                        {(view === 'tabela' ? tabelaCols : statCols).map((h) => (
                          <th key={h} className={`${th} ${h === 'PKT' || h === 'ŚR.' ? 'text-brand' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {g.rows.map((r, i) => {
                        const diff = r.legsFor - r.legsAgainst;
                        const s = r.stat;
                        return (
                          <tr key={r.tpid} className="border-b border-ink-800 last:border-0 even:bg-white/[0.02]">
                            <td
                              className={`${td} font-bold w-12`}
                              style={{ boxShadow: `inset 5px 0 0 ${barColor(i, n)}` }}
                            >
                              {i + 1}
                            </td>
                            <td className={`${td} text-left font-semibold`}>{r.name}</td>
                            {view === 'tabela' ? (
                              <>
                                <td className={td}>{r.played}</td>
                                <td className={td}>{r.won}</td>
                                <td className={td}>{r.drawn}</td>
                                <td className={td}>{r.lost}</td>
                                <td className={`${td} ${diff > 0 ? 'text-brand' : diff < 0 ? 'text-red-400' : ''}`}>
                                  {diff > 0 ? `+${diff}` : diff}
                                </td>
                                <td className={`${td} text-[19px] font-extrabold text-brand`}>{r.points}</td>
                              </>
                            ) : (
                              <>
                                <td className={`${td} font-bold text-brand`}>
                                  {s?.average != null ? s.average.toFixed(2) : '–'}
                                </td>
                                <td className={td}>{s?.highOut || '–'}</td>
                                <td className={td}>{s?.bestLeg || '–'}</td>
                                <td className={td}>{s?.t100 ?? 0}</td>
                                <td className={td}>{s?.t140 ?? 0}</td>
                                <td className={td}>{s?.t170 ?? 0}</td>
                                <td className={`${td} ${s?.t180 ? 'font-bold text-gold' : ''}`}>{s?.t180 ?? 0}</td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-slate-400">
          {view === 'tabela' ? (
            [
              ['#2dd6a7', 'Awans'],
              ['#f2b134', 'Baraż'],
              ['#f87171', 'Spadek'],
              ['#64748b', 'Utrzymanie'],
            ].map(([c, l]) => (
              <span key={l} className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-4 rounded" style={{ background: c }} />
                {l}
              </span>
            ))
          ) : (
            <span>HO — najwyższe zamknięcie · BL — najlepszy leg (liczba lotek)</span>
          )}
        </div>
      </div>

      {/* Sterowanie - poniżej obszaru zrzutu */}
      <div className="mx-auto max-w-[640px] mt-6 space-y-3 px-1">
        <button
          onClick={downloadImage}
          disabled={loading || saving || groups.length === 0}
          className="w-full px-4 py-3.5 rounded-xl text-base font-extrabold bg-brand text-ink-950 shadow-glow transition disabled:opacity-40"
        >
          {saving ? 'Tworzę zdjęcie…' : 'Pobierz zdjęcie'}
        </button>
        <div className="flex gap-2">
          {(['tabela', 'statystyki'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border transition ${
                v === view
                  ? 'bg-gold text-ink-950 border-gold'
                  : 'bg-ink-800 text-slate-300 border-ink-700'
              }`}
            >
              {v === 'tabela' ? 'Tabela' : 'Statystyki'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {LEAGUES_CONFIG.map((l) => (
            <button
              key={l.id}
              onClick={() => setLeagueId(l.id)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border transition whitespace-nowrap ${
                l.id === leagueId
                  ? 'bg-brand text-ink-950 border-brand shadow-glow'
                  : 'bg-ink-800 text-slate-300 border-ink-700'
              }`}
            >
              {l.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
