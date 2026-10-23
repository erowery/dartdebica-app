'use client';

import { useEffect, useState } from 'react';
import { Achievement, Tier, getNewAchievements, markAchievementsSeen } from '@/lib/achievements';

const TIER: Record<Tier, { ring: string; text: string; bg: string; label: string }> = {
  bronze: { ring: '#d97706', text: 'text-amber-500', bg: 'rgba(217,119,6,0.14)', label: 'brąz' },
  silver: { ring: '#cbd5e1', text: 'text-slate-200', bg: 'rgba(203,213,225,0.12)', label: 'srebro' },
  gold: { ring: '#f2b134', text: 'text-gold', bg: 'rgba(242,177,52,0.16)', label: 'złoto' },
};

export function Badge({ a, size = 52 }: { a: Achievement; size?: number }) {
  const t = TIER[a.tier];
  const font = a.symbol.length >= 4 ? 13 : a.symbol.length === 3 ? 15 : 19;
  return (
    <div
      className={`shrink-0 rounded-full flex items-center justify-center font-extrabold ${a.unlocked ? t.text : 'text-slate-600'}`}
      style={{
        width: size,
        height: size,
        fontSize: font,
        border: `2.5px solid ${a.unlocked ? t.ring : '#1e1f24'}`,
        background: a.unlocked ? t.bg : '#0a0a0c',
        boxShadow: a.unlocked ? `0 0 18px -6px ${t.ring}` : 'none',
      }}
    >
      {a.symbol}
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
