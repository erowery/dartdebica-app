'use client';

import { useState } from 'react';
import { LEAGUES_CONFIG, LeagueConfig } from '@/config/leagues';
import { fetchLeagueData } from '@/lib/nakkaApi';
import { saveWhoAmI, WhoAmI } from '@/lib/whoami';

export default function PlayerPicker({ onDone }: { onDone: (w: WhoAmI) => void }) {
  const [league, setLeague] = useState<LeagueConfig | null>(null);
  const [entries, setEntries] = useState<{ tpid: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(false);

  async function pickLeague(l: LeagueConfig) {
    setLeague(l);
    setLoading(true);
    setError(false);
    const data = await fetchLeagueData(l.nakkaId);
    const list = data?.tournament?.entry_list || [];
    if (list.length === 0) setError(true);
    setEntries(list);
    setLoading(false);
  }

  function pickPlayer(tpid: string, name: string) {
    if (!league) return;
    const whoami: WhoAmI = { leagueId: league.id, tpid, name };
    saveWhoAmI(whoami);
    onDone(whoami);
  }

  const filtered = entries.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 max-w-md mx-auto text-center">
      <img
        src="/logo.png"
        alt="Dart Dębica"
        className="w-20 h-20 rounded-full shadow-glow border border-brand/40 mb-4 object-cover"
      />
      <h1 className="text-2xl font-extrabold mb-1 tracking-wide">
        DART DĘBICA <span className="text-brand-light">ZONE</span>
      </h1>
      <p className="text-brand-light text-sm font-semibold mb-1">Twój osobisty asystent dębickich rozgrywek ligowych</p>
      <p className="text-slate-500 text-xs mb-8">Zanim zaczniemy, powiedz nam, kim jesteś</p>

      {!league && (
        <div className="w-full space-y-2">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Wybierz swoją ligę</p>
          {LEAGUES_CONFIG.map((l) => (
            <button
              key={l.id}
              onClick={() => pickLeague(l)}
              className="w-full py-3.5 px-4 rounded-xl bg-ink-800/60 border border-ink-700 hover:border-brand/50 text-white font-semibold transition-all"
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      {league && (
        <div className="w-full">
          <button
            onClick={() => {
              setLeague(null);
              setEntries([]);
              setQuery('');
            }}
            className="text-xs text-slate-500 mb-4 hover:text-slate-300"
          >
            ← Zmień ligę
          </button>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            {league.name} — wybierz swoje nazwisko
          </p>

          {loading ? (
            <p className="text-slate-400 text-sm py-8 animate-pulse">Wczytywanie zawodników...</p>
          ) : error ? (
            <p className="text-red-400 text-sm py-8">
              Nie udało się pobrać listy zawodników tej ligi. Spróbuj ponownie za chwilę.
            </p>
          ) : (
            <>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Szukaj nazwiska..."
                className="w-full mb-3 px-4 py-2.5 rounded-xl bg-ink-800/60 border border-ink-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50"
              />
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filtered.map((e) => (
                  <button
                    key={e.tpid}
                    onClick={() => pickPlayer(e.tpid, e.name)}
                    className="w-full py-3 px-4 rounded-xl bg-ink-800/60 border border-ink-700 hover:border-brand/50 text-white font-medium transition-all text-left"
                  >
                    {e.name}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-slate-500 text-sm py-4">Brak wyników dla &quot;{query}&quot;</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
