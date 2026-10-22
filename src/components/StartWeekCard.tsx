'use client';

import { useState } from 'react';
import { LeagueConfig } from '@/config/leagues';
import { addDays, defaultWeekStart, dm, dmy } from '@/lib/weekly';
import WeekHighlightsCard from '@/components/WeekHighlightsCard';
import { useLeagueWeek } from '@/components/WeekView';

/** Karta na stronie Start: wyróżnienia ostatniego tygodnia ligi zawodnika */
export default function StartWeekCard({ league, onOpen }: { league: LeagueConfig; onOpen: () => void }) {
  const [start] = useState<Date>(() => defaultWeekStart());
  const { week, highlights } = useLeagueWeek(league, start);

  // Brak meczów w tygodniu - nie zajmujemy miejsca na Starcie
  if (week && week.matches.length === 0) return null;

  return (
    <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-slate-500">Wyróżnienia tygodnia</p>
        <p className="text-[11px] text-slate-500">
          {dm(start)} – {dmy(addDays(start, 6))}
        </p>
      </div>
      <WeekHighlightsCard highlights={week ? highlights : undefined} />
      <button
        onClick={onOpen}
        className="w-full mt-3 py-2 rounded-xl bg-ink-700/60 border border-ink-700 text-slate-200 text-sm font-semibold"
      >
        Wszystkie mecze tygodnia
      </button>
    </div>
  );
}
