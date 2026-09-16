'use client';

import { useState } from 'react';
import { MatchResultRow, FixtureRow } from '@/lib/standings';

export default function MojeMeczeView({
  playerName,
  myResults,
  myPendingFixtures,
  leagueUrl,
}: {
  playerName: string;
  myResults: MatchResultRow[];
  myPendingFixtures: FixtureRow[];
  liveMatchMine: any | null;
  leagueUrl?: string;
}) {
  const [subTab, setSubTab] = useState<'done' | 'pending'>('done');

  const doneOrdered = myResults.slice().reverse();
  const doneVisible = doneOrdered.slice(0, 3);
  const pendingVisible = myPendingFixtures.slice(0, 3);

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Moje Mecze</h2>
      <p className="text-slate-400 text-sm mb-5">{playerName}</p>

      <div className="flex gap-1 mb-5 p-1 rounded-2xl bg-ink-800/60 border border-ink-700 text-xs sm:text-sm">
        {[
          { id: 'done', label: '✅ Zakończone' },
          { id: 'pending', label: '⏳ Do rozegrania' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as any)}
            className={`flex-1 py-2 px-2 rounded-xl font-semibold transition-all ${
              subTab === t.id ? 'bg-gradient-to-b from-brand to-brand-dark text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'done' && (
        <div>
          {doneVisible.length === 0 ? (
            <p className="text-slate-400 text-sm">Nie masz jeszcze żadnych rozegranych meczów w tym sezonie.</p>
          ) : (
            <div className="space-y-2">
              {doneVisible.map((m, idx) => {
                const iAmP1 = m.name1 === playerName;
                const myLegs = iAmP1 ? m.legs1 : m.legs2;
                const theirLegs = iAmP1 ? m.legs2 : m.legs1;
                const opponent = iAmP1 ? m.name2 : m.name1;
                const myAvg = iAmP1 ? m.avg1 : m.avg2;
                const result = myLegs > theirLegs ? 'W' : myLegs < theirLegs ? 'P' : 'R';
                const resultColor =
                  result === 'W'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : result === 'P'
                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                    : 'bg-slate-500/15 text-slate-300 border-slate-500/30';

                return (
                  <div key={idx} className="flex items-center gap-3 text-sm bg-ink-800/50 border border-ink-700/60 rounded-xl px-4 py-3">
                    <span className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full border text-xs font-bold ${resultColor}`}>
                      {result}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">vs {opponent}</p>
                      {myAvg > 0 && <p className="text-[11px] text-gold">śr. {myAvg}</p>}
                    </div>
                    <span className="font-bold text-white whitespace-nowrap bg-ink-700/60 rounded-lg px-2.5 py-1">
                      {myLegs} - {theirLegs}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {leagueUrl && doneOrdered.length > 0 && (
            <a
              href={leagueUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2.5 bg-gradient-to-b from-brand to-brand-dark hover:brightness-110 text-white rounded-xl text-xs font-semibold shadow-glow transition-all"
            >
              Zobacz wszystkie w Nakka ↗
            </a>
          )}
        </div>
      )}

      {subTab === 'pending' && (
        <div>
          {pendingVisible.length === 0 ? (
            <p className="text-slate-400 text-sm">Nie masz zaplanowanych meczów do rozegrania.</p>
          ) : (
            <div className="space-y-2">
              {pendingVisible.map((f, idx) => {
                const opponent = f.name1 === playerName ? f.name2 : f.name1;
                return (
                  <div key={idx} className="flex items-center justify-between text-sm bg-ink-800/50 border border-ink-700/60 rounded-xl px-4 py-3">
                    <span className="text-white font-medium truncate">vs {opponent}</span>
                    <span className="text-[11px] uppercase tracking-wider text-gold font-bold bg-gold/10 border border-gold/30 px-2.5 py-1 rounded-full">
                      Do rozegrania
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {leagueUrl && (
            <a
              href={leagueUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2.5 bg-gradient-to-b from-brand to-brand-dark hover:brightness-110 text-white rounded-xl text-xs font-semibold shadow-glow transition-all"
            >
              Zobacz pełny plan w Nakka ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
