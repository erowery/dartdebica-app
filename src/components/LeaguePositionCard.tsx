'use client';

import { StandingRow, MatchResultRow } from '@/lib/standings';

function formForPlayer(myTpid: string, results: MatchResultRow[]): ('W' | 'P' | 'R')[] {
  return results.slice(-5).map((m) => {
    const iAmP1 = m.tpid1 === myTpid;
    const myLegs = iAmP1 ? m.legs1 : m.legs2;
    const theirLegs = iAmP1 ? m.legs2 : m.legs1;
    if (myLegs > theirLegs) return 'W';
    if (myLegs < theirLegs) return 'P';
    return 'R';
  });
}

const BADGE_STYLE: Record<'W' | 'P' | 'R', string> = {
  W: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  P: 'bg-red-500/15 text-red-400 border-red-500/30',
  R: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const BADGE_SYMBOL: Record<'W' | 'P' | 'R', string> = {
  W: '▲',
  P: '▼',
  R: '●',
};

export default function LeaguePositionCard({
  leagueName,
  myStanding,
  myRank,
  myTpid,
  myResults,
}: {
  leagueName: string;
  myStanding: StandingRow | null;
  myRank: number | null;
  myTpid: string;
  myResults: MatchResultRow[];
}) {
  const form = formForPlayer(myTpid, myResults);

  return (
    <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl">
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Pozycja w lidze</p>
      <p className="text-base font-bold text-white mb-3">{leagueName}</p>

      {myStanding ? (
        <>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-extrabold text-gold">{myRank ? `#${myRank}` : '-'}</div>
            <div className="text-sm text-slate-400">
              <div>
                Mecze: <span className="text-white font-semibold">{myStanding.played}</span>
              </div>
              <div>
                W: <span className="text-emerald-400 font-semibold">{myStanding.won}</span>
                {' · '}
                R: <span className="text-slate-300 font-semibold">{myStanding.drawn}</span>
                {' · '}
                P: <span className="text-red-400 font-semibold">{myStanding.lost}</span>
              </div>
            </div>
          </div>

          {form.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Forma (ostatnie mecze)</p>
              <div className="flex gap-1.5">
                {form.map((r, idx) => (
                  <span
                    key={idx}
                    className={`w-7 h-7 flex items-center justify-center rounded-full border text-xs font-bold ${BADGE_STYLE[r]}`}
                  >
                    {BADGE_SYMBOL[r]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-500">Jeszcze nie rozegrałeś meczu w tabeli.</p>
      )}
    </div>
  );
}
