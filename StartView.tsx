'use client';

import { StandingRow, MatchResultRow, FixtureRow } from '@/lib/standings';
import { IconWarning } from '@/components/icons';
import LeaguePositionCard from '@/components/LeaguePositionCard';

function formatDate(date: Date) {
  return date.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'long' });
}

export default function StartView({
  playerName,
  leagueName,
  myStanding,
  myRank,
  myTpid,
  myResults,
  myPendingFixtures,
  liveMatchMine,
  leagueUrl,
  onGoToLiga,
  onGoToMoje,
}: {
  playerName: string;
  leagueName: string;
  myStanding: StandingRow | null;
  myRank: number | null;
  myTpid: string;
  myResults: MatchResultRow[];
  myPendingFixtures: FixtureRow[];
  liveMatchMine: any | null;
  leagueUrl?: string;
  onGoToLiga: () => void;
  onGoToMoje: () => void;
}) {
  const lastResult = myResults.length > 0 ? myResults[myResults.length - 1] : null;

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const overdue = myPendingFixtures
    .filter((f) => f.date && f.date.getTime() < todayMidnight.getTime())
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());

  const upcoming = myPendingFixtures
    .filter((f) => f.date && f.date.getTime() >= todayMidnight.getTime())
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());
  const nextMatch = upcoming.length > 0 ? upcoming[0] : null;
  const totalFixtures = myResults.length + myPendingFixtures.length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Cześć, {playerName}! 👋</h1>
        <p className="text-slate-400 text-sm mt-0.5">{leagueName}</p>
      </div>

      {/* Aktualny mecz na żywo */}
      {liveMatchMine && (
        <button
          onClick={onGoToLiga}
          className="w-full text-left relative p-4 bg-ink-800/60 border border-brand/40 rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
          <span className="relative flex items-center gap-1.5 text-[11px] bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide w-fit mb-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            Grasz teraz!
          </span>
          <p className="relative text-white font-semibold">Twój mecz trwa właśnie teraz - sprawdź wynik →</p>
        </button>
      )}

      {/* Zaległe mecze - czerwona ramka, wszystkie na raz */}
      {overdue.length > 0 && (
        <div className="p-4 bg-red-500/10 border-2 border-red-500/50 rounded-2xl">
          <p className="text-xs uppercase tracking-wider text-red-400 font-bold mb-3 flex items-center gap-1.5">
            <IconWarning className="w-3.5 h-3.5" /> Zaległe mecze ({overdue.length})
          </p>
          <div className="space-y-2">
            {overdue.map((f, idx) => {
              const opponent = f.tpid1 === myTpid ? f.name2 : f.name1;
              return (
                <div key={idx} className="flex items-center justify-between text-sm bg-ink-900/40 rounded-xl px-3 py-2.5">
                  <span className="text-white font-medium truncate">vs {opponent}</span>
                  {f.date && <span className="text-sm font-semibold text-red-300 shrink-0 ml-2">{formatDate(f.date)}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Następny zaplanowany mecz */}
      {!liveMatchMine && nextMatch && (
        <div className="p-4 bg-ink-800/50 border border-gold/30 rounded-2xl">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Następny mecz</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white font-medium truncate">
              vs {nextMatch.tpid1 === myTpid ? nextMatch.name2 : nextMatch.name1}
            </span>
            {nextMatch.date && (
              <span className="text-sm font-bold text-gold shrink-0 ml-2">{formatDate(nextMatch.date)}</span>
            )}
          </div>
        </div>
      )}

      {/* Ostatni mecz (jeśli nie gra teraz) */}
      {!liveMatchMine && lastResult && (
        <a
          href={lastResult.nakkaMatchUrl}
          target="_blank"
          rel="noreferrer"
          className="block p-4 bg-ink-800/50 border border-ink-700/60 hover:border-brand/30 rounded-2xl transition-colors"
        >
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Twój ostatni mecz</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-200 font-medium truncate">{lastResult.name1}</span>
            <span className="font-bold text-white px-3 whitespace-nowrap bg-ink-700/60 rounded-lg py-0.5 mx-2">
              {lastResult.legs1} - {lastResult.legs2}
            </span>
            <span className="text-slate-200 font-medium truncate text-right">{lastResult.name2}</span>
          </div>
        </a>
      )}

      {!liveMatchMine && !lastResult && (
        <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl text-sm text-slate-400">
          Nie masz jeszcze rozegranych meczów w tym sezonie.
        </div>
      )}

      {/* Twoja liga */}
      <LeaguePositionCard
        leagueName={leagueName}
        myStanding={myStanding}
        myRank={myRank}
        myTpid={myTpid}
        myResults={myResults}
      />

      <button
        onClick={onGoToLiga}
        className="w-full py-2.5 rounded-xl bg-gradient-to-b from-brand to-brand-dark text-white text-sm font-semibold shadow-glow"
      >
        Zobacz tabelę
      </button>

      {/* Twoje sprawy - realny status sezonu */}
      <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl">
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <IconWarning className="w-3.5 h-3.5 text-gold" /> Twoje sprawy
        </p>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Rozegrane mecze</span>
            <span className="font-bold text-white">
              {myResults.length} / {totalFixtures}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Zaległości</span>
            {overdue.length === 0 ? (
              <span className="font-bold text-emerald-400">Brak ✓</span>
            ) : (
              <span className="font-bold text-red-400">{overdue.length}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Najbliższy mecz</span>
            <span className="font-bold text-white">
              {nextMatch?.date ? formatDate(nextMatch.date) : 'Brak zaplanowanych'}
            </span>
          </div>
        </div>
      </div>

      {leagueUrl && (
        <a
          href={leagueUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Otwórz pełny widok ligi na Nakka ↗
        </a>
      )}
    </div>
  );
}
