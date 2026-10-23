'use client';

import { useRef, useState } from 'react';
import { MatchResultRow, PlayerStatRow, StandingRow } from '@/lib/standings';
import { Achievement } from '@/lib/achievements';
import { Badge } from '@/components/Achievements';
import { downloadNodeAsPng } from '@/lib/snapshot';

function Big({ value, label, color = 'text-white' }: { value: string; label: string; color?: string }) {
  return (
    <div className="rounded-2xl bg-ink-900/80 border border-ink-700 py-3 text-center">
      <p className={`text-[26px] font-extrabold tabular-nums leading-none ${color}`}>{value}</p>
      <p className="text-[11px] text-slate-400 mt-1.5">{label}</p>
    </div>
  );
}

function Line({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-[14px] text-slate-300">{label}</p>
        {note && <p className="text-[11.5px] text-slate-400 leading-snug">{note}</p>}
      </div>
      <p className="shrink-0 text-[20px] font-extrabold text-gold tabular-nums">{value}</p>
    </div>
  );
}

/** Osobista karta sezonu do pobrania jako zdjęcie (w stylu podsumowań rocznych) */
export default function SeasonSummary({
  playerName,
  leagueName,
  myTpid,
  myRank,
  myStanding,
  myStats,
  myResults,
  achievements,
  remainingMatches,
}: {
  remainingMatches: number;
  playerName: string;
  leagueName: string;
  myTpid: string;
  myRank: number | null;
  myStanding: StandingRow | null;
  myStats: PlayerStatRow | null;
  myResults: MatchResultRow[];
  achievements: Achievement[];
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mine = myResults.map((r) =>
    r.tpid1 === myTpid
      ? { me: r.legs1, opp: r.legs2, avg: r.avg1, oppName: r.name2 }
      : { me: r.legs2, opp: r.legs1, avg: r.avg2, oppName: r.name1 }
  );
  const bestMatch = mine.reduce<(typeof mine)[number] | null>((b, m) => (m.avg > (b?.avg ?? 0) ? m : b), null);
  const biggestWin = mine
    .filter((m) => m.me > m.opp)
    .reduce<(typeof mine)[number] | null>((b, m) => (!b || m.me - m.opp > b.me - b.opp ? m : b), null);
  const played = myStanding?.played ?? 0;
  const winPct = played > 0 ? Math.round(((myStanding?.won ?? 0) / played) * 100) : 0;
  const tierOrder = { gold: 0, silver: 1, bronze: 2 };
  const topBadges = achievements
    .filter((a) => a.unlocked)
    .sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])
    .slice(0, 4);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const today = new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  async function save() {
    if (!ref.current || saving) return;
    setSaving(true);
    try {
      await downloadNodeAsPng(ref.current, `Moj_sezon_${playerName.replace(/\s+/g, '_')}.png`);
    } catch {
      alert('Nie udało się zapisać zdjęcia. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  }

  if (remainingMatches > 0 || played === 0) {
    const total = played + remainingMatches;
    return (
      <div className="w-full p-4 rounded-2xl border border-ink-700 bg-ink-800/40 flex items-center gap-3">
        <span className="shrink-0 w-11 h-11 rounded-xl bg-ink-900 border border-ink-700 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-slate-300">Podsumowanie sezonu</span>
          <span className="block text-[12.5px] text-slate-400">
            Odblokuje się po rozegraniu wszystkich meczów ({played} z {total})
          </span>
          {total > 0 && (
            <span className="block h-1.5 mt-2 rounded-full bg-ink-900 overflow-hidden">
              <span className="block h-full bg-gold" style={{ width: `${(played / total) * 100}%` }} />
            </span>
          )}
        </span>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full p-4 rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/15 to-transparent text-left flex items-center gap-3"
      >
        <span className="shrink-0 w-11 h-11 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#f2b134" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
            <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7" />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-[15px] font-bold text-white">Moje podsumowanie sezonu</span>
          <span className="block text-[12.5px] text-slate-400">Grafika z Twoimi wynikami do pobrania i udostępnienia</span>
        </span>
      </button>
    );
  }

  return (
    <div>
      <div ref={ref} className="bg-ink-950 bg-radial-fade rounded-3xl border border-ink-700 p-5">
        <div className="flex items-center gap-3 mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-12 w-12 object-contain" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold font-bold">Mój sezon</p>
            <p className="text-[22px] font-extrabold text-white leading-tight">{playerName}</p>
            <p className="text-[13px] text-slate-400">
              {leagueName} · stan na {today}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <Big value={myRank ? `${myRank}.` : '–'} label="miejsce" color="text-gold" />
          <Big value={String(played)} label="mecze" />
          <Big value={`${winPct}%`} label="wygranych" color="text-brand" />
        </div>

        <div className="rounded-2xl bg-ink-900/60 border border-ink-700 px-4 py-1 divide-y divide-ink-700/60 mb-4">
          <Line label="Średnia sezonu" value={myStats?.average != null ? myStats.average.toFixed(2) : '–'} />
          <Line
            label="Najlepszy mecz"
            value={bestMatch && bestMatch.avg > 0 ? bestMatch.avg.toFixed(2) : '–'}
            note={bestMatch && bestMatch.avg > 0 ? `średnia vs ${bestMatch.oppName}` : undefined}
          />
          <Line
            label="Najwyższa wygrana"
            value={biggestWin ? `${biggestWin.me}:${biggestWin.opp}` : '–'}
            note={biggestWin ? `vs ${biggestWin.oppName}` : undefined}
          />
          <Line label="180 / 170+" value={myStats ? String(myStats.t180 + myStats.t170) : '–'} />
          <Line label="Najwyższy checkout" value={myStats?.highOut ? String(myStats.highOut) : '–'} />
          <Line label="Best leg" value={myStats?.bestLeg ? String(myStats.bestLeg) : '–'} />
        </div>

        {topBadges.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">
              Osiągnięcia: {unlockedCount} z {achievements.length}
            </p>
            <div className="flex gap-3">
              {topBadges.map((a) => (
                <div key={a.id} className="flex flex-col items-center w-[64px] text-center">
                  <Badge a={a} size={46} />
                  <p className="text-[10.5px] text-slate-300 mt-1 leading-tight">{a.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-[11px] text-slate-500 mt-4 text-center">Dart Dębica Zone · LSDD</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button onClick={() => setOpen(false)} className="py-3 rounded-xl bg-ink-800 border border-ink-700 text-slate-200 text-sm font-bold">
          Zwiń
        </button>
        <button onClick={save} disabled={saving} className="py-3 rounded-xl bg-brand text-ink-950 text-sm font-extrabold shadow-glow disabled:opacity-40">
          {saving ? 'Tworzę zdjęcie…' : 'Pobierz zdjęcie'}
        </button>
      </div>
    </div>
  );
}
