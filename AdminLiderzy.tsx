'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LEAGUES_CONFIG } from '@/config/leagues';
import { fetchLeagueData, fetchLeagueStats } from '@/lib/nakkaApi';
import { buildPlayerStats, computeLeagueStandings, PlayerStatRow } from '@/lib/standings';
import { downloadNodeAsPng } from '@/lib/snapshot';
import { copyText } from '@/lib/clipboard';

const TOP = 5;

interface Category {
  id: string;
  title: string;
  rows: { name: string; value: string }[];
}

function buildCategories(players: PlayerStatRow[], tournament: any): Category[] {
  const take = (list: PlayerStatRow[], fmt: (p: PlayerStatRow) => string) =>
    list.slice(0, TOP).map((p) => ({ name: p.name, value: fmt(p) }));

  // Najwyższa średnia z pojedynczego meczu (z wyników ligi, mecze wpisane ręcznie mają 0 i odpadają)
  const bestMatchAvg: Record<string, number> = {};
  (computeLeagueStandings(tournament)?.results || []).forEach((r) => {
    if (r.avg1 > (bestMatchAvg[r.tpid1] ?? 0)) bestMatchAvg[r.tpid1] = r.avg1;
    if (r.avg2 > (bestMatchAvg[r.tpid2] ?? 0)) bestMatchAvg[r.tpid2] = r.avg2;
  });
  const byAvg = players
    .filter((p) => (bestMatchAvg[p.tpid] ?? 0) > 0)
    .sort((a, b) => bestMatchAvg[b.tpid] - bestMatchAvg[a.tpid]);

  // 180 i 170+ razem (suma)
  const big = (p: PlayerStatRow) => p.t170 + p.t180;
  const by180 = players.filter((p) => big(p) > 0).sort((a, b) => big(b) - big(a) || b.t180 - a.t180);
  const byHO = players.filter((p) => (p.highOut ?? 0) > 0).sort((a, b) => b.highOut! - a.highOut!);
  const byBL = players.filter((p) => (p.bestLeg ?? 0) > 0).sort((a, b) => a.bestLeg! - b.bestLeg!);

  return [
    { id: 'avg', title: 'Najwyższa średnia meczowa', rows: take(byAvg, (p) => bestMatchAvg[p.tpid].toFixed(2)) },
    { id: '180', title: '180 / 170+', rows: take(by180, (p) => String(big(p))) },
    { id: 'ho', title: 'Najwyższy checkout', rows: take(byHO, (p) => String(p.highOut)) },
    { id: 'bl', title: 'Best leg', rows: take(byBL, (p) => String(p.bestLeg)) },
  ];
}

// obwódka kółka z numerem miejsca: złoto, srebro, brąz, potem szara
const RANK_RING = ['#f2b134', '#cbd5e1', '#d97706'];

export default function AdminLiderzy() {
  const [leagueId, setLeagueId] = useState(LEAGUES_CONFIG[0].id);
  const [players, setPlayers] = useState<PlayerStatRow[] | null>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const league = LEAGUES_CONFIG.find((l) => l.id === leagueId)!;

  useEffect(() => {
    let cancelled = false;
    setPlayers(null);
    setCopied(false);
    Promise.all([fetchLeagueData(league.nakkaId), fetchLeagueStats(league.nakkaId)]).then(([d, s]) => {
      if (cancelled) return;
      setTournament(d?.tournament ?? null);
      setPlayers(d?.tournament ? buildPlayerStats(d.tournament, s) : []);
    });
    return () => {
      cancelled = true;
    };
  }, [league.nakkaId]);

  const categories = useMemo(() => (players ? buildCategories(players, tournament) : []), [players, tournament]);
  const today = new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  async function handleImage() {
    if (!captureRef.current || saving) return;
    setSaving(true);
    try {
      await downloadNodeAsPng(captureRef.current, `${league.id.toUpperCase()}_liderzy_${today.replace(/\./g, '-')}.png`);
    } catch {
      alert('Nie udało się zapisać zdjęcia. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    const lines = [`LIDERZY STATYSTYK – ${league.name} (stan na ${today})`];
    categories.forEach((c) => {
      if (c.rows.length === 0) return;
      lines.push('', c.title);
      c.rows.forEach((r, i) => lines.push(`${i + 1}. ${r.name} – ${r.value}`));
    });
    const ok = await copyText(lines.join('\n'));
    setCopied(ok);
    if (!ok) alert('Nie udało się skopiować tekstu.');
  }

  return (
    <div>
      <div ref={captureRef} className="mx-auto max-w-[640px] bg-ink-950 bg-radial-fade p-5">
        <div className="flex items-center gap-4 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-16 w-16 object-contain" />
          <div>
            <h1 className="text-[28px] leading-tight font-extrabold tracking-wide">{league.name.toUpperCase()}</h1>
            <p className="text-[15px] text-slate-400">Liderzy statystyk · stan na {today}</p>
          </div>
        </div>

        {!players && <p className="text-slate-400 pb-2">Ładowanie…</p>}
        {players && players.length === 0 && <p className="text-slate-400 pb-2">Brak danych dla tej ligi.</p>}

        {players && players.length > 0 && (
          <div className="grid grid-cols-1 min-[560px]:grid-cols-2 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-3.5">
                <p className="text-[13px] font-extrabold uppercase tracking-wider text-brand mb-2">{c.title}</p>
                {c.rows.length === 0 ? (
                  <p className="text-[14px] text-slate-500">–</p>
                ) : (
                  <ol className="space-y-1.5">
                    {c.rows.map((r, i) => (
                      <li key={i} className="flex items-baseline gap-2.5">
                        <span
                          className="w-5 h-5 shrink-0 self-center rounded-full bg-ink-800 flex items-center justify-center text-[11px] font-semibold text-slate-400 tabular-nums"
                          style={{ border: `1.5px solid ${RANK_RING[i] || '#334155'}` }}
                        >
                          {i + 1}
                        </span>
                        <span className={`flex-1 min-w-0 break-words text-[14px] leading-snug ${i === 0 ? 'font-bold text-white' : 'text-slate-300'}`}>
                          {r.name}
                        </span>
                        <span className={`shrink-0 text-[15px] font-extrabold tabular-nums ${i === 0 ? 'text-gold' : 'text-white'}`}>
                          {r.value}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="text-[12px] text-slate-500 mt-4">
          Najwyższa średnia meczowa – najlepsza średnia z jednego meczu. Best leg – najmniej lotek w wygranym legu.
        </p>
      </div>

      <div className="mx-auto max-w-[640px] mt-6 space-y-3 px-1">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            disabled={!players || players.length === 0}
            className="px-4 py-3.5 rounded-xl text-base font-extrabold bg-gold text-ink-950 transition disabled:opacity-40"
          >
            {copied ? 'Skopiowano ✓' : 'Kopiuj do opisu'}
          </button>
          <button
            onClick={handleImage}
            disabled={!players || players.length === 0 || saving}
            className="px-4 py-3.5 rounded-xl text-base font-extrabold bg-brand text-ink-950 shadow-glow transition disabled:opacity-40"
          >
            {saving ? 'Tworzę zdjęcie…' : 'Pobierz zdjęcie'}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {LEAGUES_CONFIG.map((l) => (
            <button
              key={l.id}
              onClick={() => setLeagueId(l.id)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border transition whitespace-nowrap ${
                l.id === leagueId ? 'bg-brand text-ink-950 border-brand shadow-glow' : 'bg-ink-800 text-slate-300 border-ink-700'
              }`}
            >
              {l.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
