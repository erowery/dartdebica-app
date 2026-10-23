'use client';

import { useEffect, useState } from 'react';

/**
 * Subskrypcja meczów w kalendarzu telefonu. Kalendarz sam się odświeża,
 * więc zmiana daty w Nakka trafia do telefonu bez żadnej akcji zawodnika.
 */
export default function CalendarCard({ leagueId, tpid }: { leagueId: string; tpid: string }) {
  const [host, setHost] = useState('');
  useEffect(() => setHost(window.location.host), []);

  const path = `/api/kalendarz?liga=${encodeURIComponent(leagueId)}&gracz=${encodeURIComponent(tpid)}`;
  const webcal = `webcal://${host}${path}`;
  const google = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`;

  return (
    <div className="p-4 mb-4 rounded-2xl border border-brand/30 bg-gradient-to-b from-brand/10 to-transparent">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-10 h-10 rounded-xl bg-brand/15 border border-brand/40 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#2dd6a7" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-white leading-tight">Mecze w kalendarzu telefonu</p>
          <p className="text-[13px] text-slate-400 mt-0.5 leading-snug">
            Twoje mecze z datą pojawią się w kalendarzu, a telefon przypomni o nich dzień wcześniej. Zmiany terminów
            zaktualizują się same.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <a
          href={google}
          target="_blank"
          rel="noreferrer"
          className="text-center py-2.5 rounded-xl bg-brand text-ink-950 text-sm font-bold"
        >
          Kalendarz Google
        </a>
        <a href={webcal} className="text-center py-2.5 rounded-xl bg-ink-800 border border-ink-700 text-slate-200 text-sm font-bold">
          iPhone / inny
        </a>
      </div>
    </div>
  );
}
