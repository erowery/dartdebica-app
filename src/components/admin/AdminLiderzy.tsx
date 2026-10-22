'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LEAGUES_CONFIG } from '@/config/leagues';
import { fetchLeagueData, fetchLeagueStats } from '@/lib/nakkaApi';
import { buildPlayerStats, PlayerStatRow } from '@/lib/standings';
import { downloadNodeAsPng } from '@/lib/snapshot';
import { copyText } from '@/lib/clipboard';

const TOP = 5;

interface Category {
  id: string;
  title: string;
  rows: { name: string; value: string }[];
}

function buildCategories(players: PlayerStatRow[]): Category[] {
  const take = (list: PlayerStatRow[], fmt: (p: PlayerStatRow) => string) =>
    list.slice(0, TOP).map((p) => ({ name: p.name, value: fmt(p) }));

  const byAvg = players.filter((p) => p.average != null && p.average > 0).sort((a, b) => b.average! - a.average!);
  const by180 = players.filter((p) => p.t180 > 0).sort((a, b) => b.t180 - a.t180 || (b.average ?? 0) - (a.average ?? 0));
  const byHO = players.filter((p) => (p.highOut ?? 0) > 0).sort((a, b) => b.highOut! - a.highOut!);
  const byBL = players.filter((p) => (p.bestLeg ?? 0) > 0).sort((a, b) => a.bestLeg! - b.bestLeg!);

  return [
    { id: 'avg', title: 'Średnia', rows: take(byAvg, (p) => p.average!.toFixed(2)) },
    { id: '180', title: '180', rows: take(by180, (p) => String(p.t180)) },
    { id: 'ho', title: 'Najwyższy checkout', rows: take(byHO, (p) => String(p.highOut)) },
    { id: 'bl', title: 'Best leg', rows: take(byBL, (p) => String(p.bestLeg)) },
  ];
}

const RANK_COLORS = ['text-gold', 'text-slate-300', 'text-amber-600'];

export default function AdminLiderzy() {
  const [leagueId, setLeagueId] = useState(LEAGUES_CONFIG[0].id);
  const [players, setPlayers] = useState<PlayerStatRow[] | null>(null);
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
      setPlayers(d?.tournament ? buildPlayerStats(d.tournament, s) : []);
    });
    return () => {
      cancelled = true;
    };
  }, [league.nakkaId]);

  const categories = useMemo(() => (players ? buildCategories(players) : []), [players]);
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
                      <li key={i} className="flex items-baseline gap-2">
                        <span className={`w-4 shrink-0 text-[14px] font-extrabold tabular-nums ${RANK_COLORS[i] || 'text-slate-500'}`}>
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
        <p className="text-[12px] text-slate-500 mt-4">Best leg – najmniej lotek w wygranym legu.</p>
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
