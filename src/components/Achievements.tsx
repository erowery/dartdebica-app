'use client';

import { useEffect, useState } from 'react';
import { Achievement, Tier, getNewAchievements, markAchievementsSeen } from '@/lib/achievements';

const TIER: Record<Tier, { fill: string; ring: string; ink: string; label: string }> = {
  bronze: { fill: 'linear-gradient(160deg, #f59e0b, #b45309)', ring: '#f59e0b', ink: '#1a0f02', label: 'brąz' },
  silver: { fill: 'linear-gradient(160deg, #f1f5f9, #94a3b8)', ring: '#e2e8f0', ink: '#0f172a', label: 'srebro' },
  gold: { fill: 'linear-gradient(160deg, #fde68a, #f2b134)', ring: '#f2b134', ink: '#1f1400', label: 'złoto' },
};

export function Badge({ a, size = 52 }: { a: Achievement; size?: number }) {
  const t = TIER[a.tier];
  const font = a.symbol.length >= 4 ? 13 : a.symbol.length === 3 ? 15 : 19;
  if (!a.unlocked) {
    // niezdobyte: ciemne kółko, przerywana szara obwódka, przygaszony znak
    return (
      <div
        className="shrink-0 rounded-full flex items-center justify-center font-extrabold text-slate-600"
        style={{ width: size, height: size, fontSize: font, border: '2px dashed #334155', background: '#0a0a0c' }}
      >
        {a.symbol}
      </div>
    );
  }
  // zdobyte: pełne wypełnienie w kolorze medalu + znaczek ✓
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-extrabold"
        style={{ fontSize: font, background: t.fill, color: t.ink, boxShadow: `0 0 18px -4px ${t.ring}` }}
      >
        {a.symbol}
      </div>
      <span
        className="absolute -right-0.5 -bottom-0.5 w-[18px] h-[18px] rounded-full bg-brand text-ink-950 text-[11px] font-black flex items-center justify-center"
        style={{ border: '2px solid #000' }}
      >
        ✓
      </span>
    </div>
  );
}

/** Sekcja w Profilu: wszystkie osiągnięcia, zdobyte w kolorze, pozostałe wyszarzone z postępem */
export function AchievementsSection({ list }: { list: Achievement[] }) {
  const unlocked = list.filter((a) => a.unlocked).length;
  return (
    <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-slate-400">Osiągnięcia</p>
        <p className="text-[13px] font-bold text-gold tabular-nums">
          {unlocked} / {list.length}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-4">
        {list.map((a) => (
          <div key={a.id} className="flex flex-col items-center text-center">
            <Badge a={a} />
            <p className={`text-[12px] font-bold mt-1.5 leading-tight ${a.unlocked ? 'text-white' : 'text-slate-500'}`}>{a.title}</p>
            <p className="text-[10.5px] text-slate-400 leading-snug mt-0.5">{a.description}</p>
            {!a.unlocked && a.progress && (
              <div className="w-full max-w-[80px] mt-1.5">
                <div className="h-1 rounded-full bg-ink-900 overflow-hidden">
                  <div className="h-full bg-slate-500" style={{ width: `${(a.progress.value / a.progress.target) * 100}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                  {a.progress.value} / {a.progress.target}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Karta gratulacji na Starcie - tylko dla osiągnięć zdobytych od ostatniej wizyty w tej przeglądarce */
export function NewAchievementsCard({ tpid, list }: { tpid: string; list: Achievement[] }) {
  const [fresh, setFresh] = useState<Achievement[]>([]);
  useEffect(() => {
    if (list.length > 0) setFresh(getNewAchievements(tpid, list));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tpid, list.map((a) => (a.unlocked ? 1 : 0)).join('')]);

  if (fresh.length === 0) return null;
  return (
    <div className="p-4 rounded-2xl border border-gold/40 bg-gradient-to-b from-gold/15 to-transparent animate-fadeIn">
      <p className="text-xs uppercase tracking-wider text-gold mb-3">
        {fresh.length === 1 ? 'Nowe osiągnięcie!' : `Nowe osiągnięcia (${fresh.length})!`}
      </p>
      <div className="space-y-3">
        {fresh.map((a) => (
          <div key={a.id} className="flex items-center gap-3">
            <Badge a={a} size={46} />
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-white leading-tight">{a.title}</p>
              <p className="text-[12.5px] text-slate-400 leading-snug">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          markAchievementsSeen(tpid, list);
          setFresh([]);
        }}
        className="w-full mt-3 py-2 rounded-xl bg-gold text-ink-950 text-sm font-bold"
      >
        Super!
      </button>
    </div>
  );
}
