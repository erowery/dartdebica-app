'use client';

import { MatchResultRow } from '@/lib/standings';

export default function MojeMeczeView({
  playerName,
  myResults,
  liveMatchMine,
  onGoToLive,
}: {
  playerName: string;
  myResults: MatchResultRow[];
  liveMatchMine: any | null;
  onGoToLive: () => void;
}) {
  const ordered = myResults.slice().reverse();

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Moje Mecze</h2>
      <p className="text-slate-400 text-sm mb-5">{playerName}</p>

      {liveMatchMine && (
        <button
          onClick={onGoToLive}
          className="w-full text-left relative p-4 mb-4 bg-ink-800/60 border border-brand/40 rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
          <span className="relative flex items-center gap-1.5 text-[11px] bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide w-fit mb-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            Grasz teraz!
          </span>
          <p className="relative text-white font-semibold text-sm">Zobacz swój mecz na żywo →</p>
        </button>
      )}

      <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
        Zakończone ({ordered.length})
      </p>

      {ordered.length === 0 ? (
        <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl text-sm text-slate-400">
          Nie masz jeszcze żadnych rozegranych meczów w tym sezonie.
        </div>
      ) : (
        <div className="space-y-2">
          {ordered.map((m, idx) => {
            const iAmP1 = m.name1 === playerName;
            const myLegs = iAmP1 ? m.legs1 : m.legs2;
            const theirLegs = iAmP1 ? m.legs2 : m.legs1;
            const opponent = iAmP1 ? m.name2 : m.name1;
            const myAvg = iAmP1 ? m.avg1 : m.avg2;
            const result = myLegs > theirLegs ? 'W' : myLegs < theirLegs ? 'P' : 'R';
            const resultColor =
              result === 'W' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : result === 'P' ? 'bg-red-500/15 text-red-400 border-red-500/30'
                : 'bg-slate-500/15 text-slate-300 border-slate-500/30';

            return (
              <div
                key={idx}
                className="flex items-center gap-3 text-sm bg-ink-800/50 border border-ink-700/60 rounded-xl px-4 py-3"
              >
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
    </div>
  );
}
