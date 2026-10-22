'use client';

import { useEffect, useState } from 'react';
import { LeagueConfig } from '@/config/leagues';
import {
  LeagueWeek,
  WeekHighlights,
  WEEKDAYS,
  addDays,
  computeHighlights,
  defaultWeekStart,
  dm,
  dmy,
  hm,
  loadLeagueWeek,
  thursdayOf,
} from '@/lib/weekly';
import WeekHighlightsCard from '@/components/WeekHighlightsCard';

/** Mecze i wyróżnienia jednego tygodnia ligowego (czwartek-środa) dla wskazanej ligi */
export function useLeagueWeek(league: LeagueConfig, start: Date) {
  const [week, setWeek] = useState<LeagueWeek | null>(null);
  const [highlights, setHighlights] = useState<WeekHighlights | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setWeek(null);
    setHighlights(undefined);
    const end = addDays(start, 7);
    loadLeagueWeek(league, start, end).then(async (w) => {
      if (cancelled) return;
      setWeek(w);
      const h = await computeHighlights(w.matches);
      if (!cancelled) setHighlights(h);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [league.nakkaId, start.getTime()]);

  return { week, highlights };
}

export default function WeekView({ league, myTpid }: { league: LeagueConfig; myTpid: string }) {
  const [start, setStart] = useState<Date>(() => defaultWeekStart());
  const { week, highlights } = useLeagueWeek(league, start);
  const end = addDays(start, 7);
  const isCurrent = start.getTime() >= thursdayOf(new Date()).getTime();

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setStart(addDays(start, -7))}
          className="px-3.5 py-2 rounded-xl bg-ink-800 border border-ink-700 text-slate-200 font-bold"
          aria-label="Poprzedni tydzień"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-white">
            {dm(start)} – {dmy(addDays(end, -1))}
          </p>
          <p className="text-[11px] text-slate-500">czwartek – środa</p>
        </div>
        <button
          onClick={() => setStart(addDays(start, 7))}
          disabled={isCurrent}
          className="px-3.5 py-2 rounded-xl bg-ink-800 border border-ink-700 text-slate-200 font-bold disabled:opacity-30"
          aria-label="Następny tydzień"
        >
          →
        </button>
      </div>

      <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Wyróżnienia tygodnia</p>
      {week && week.matches.length === 0 ? (
        <div className="p-4 mb-5 bg-ink-800/50 border border-ink-700/60 rounded-2xl text-sm text-slate-400">
          {week.error ? 'Nie udało się pobrać danych z Nakka.' : 'W tym tygodniu nie rozegrano meczów.'}
        </div>
      ) : (
        <WeekHighlightsCard highlights={week ? highlights : undefined} className="mb-5" />
      )}

      {week && week.matches.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Mecze tygodnia</p>
          <div className="rounded-2xl border border-ink-700 bg-ink-800/40 overflow-hidden divide-y divide-ink-700/70">
            {week.matches.map((m) => {
              const w1 = m.legs1 > m.legs2;
              const w2 = m.legs2 > m.legs1;
              const mine = m.tpid1 === myTpid || m.tpid2 === myTpid;
              const body = (
                <div className={`px-3 py-2.5 ${mine ? 'bg-brand/5' : ''}`}>
                  <p className="text-[11px] text-slate-500 text-center mb-1">
                    {WEEKDAYS[m.time.getDay()]} {dm(m.time)}
                    {m.manual ? ' · wpisany ręcznie' : ` · ${hm(m.time)}`}
                  </p>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
                    <div className="text-right min-w-0">
                      <p className={`text-sm leading-tight ${w1 ? 'font-bold text-white' : 'text-slate-300'}`}>{m.name1}</p>
                      {m.avg1 != null && <p className="text-[11px] text-slate-500 tabular-nums">śr. {m.avg1.toFixed(2)}</p>}
                    </div>
                    <div className="px-2.5 py-0.5 rounded-lg bg-ink-900 border border-ink-700 text-base font-extrabold tabular-nums whitespace-nowrap">
                      <span className={w1 ? 'text-brand' : 'text-white'}>{m.legs1}</span>
                      <span className="text-slate-500 mx-1">:</span>
                      <span className={w2 ? 'text-brand' : 'text-white'}>{m.legs2}</span>
                    </div>
                    <div className="text-left min-w-0">
                      <p className={`text-sm leading-tight ${w2 ? 'font-bold text-white' : 'text-slate-300'}`}>{m.name2}</p>
                      {m.avg2 != null && <p className="text-[11px] text-slate-500 tabular-nums">śr. {m.avg2.toFixed(2)}</p>}
                    </div>
                  </div>
                </div>
              );
              return m.url ? (
                <a key={m.key} href={m.url} target="_blank" rel="noreferrer" className="block hover:bg-white/[0.03]">
                  {body}
                </a>
              ) : (
                <div key={m.key}>{body}</div>
              );
            })}
          </div>
        </>
      )}

      {!week && (
        <div className="space-y-2 mt-5 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-ink-800/60 border border-ink-700" />
          ))}
        </div>
      )}
    </div>
  );
}
