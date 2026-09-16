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
            <div className="text-4xl font-extrabold text-gold shrink-0 w-16 text-center">
              {myRank ? `#${myRank}` : '-'}
            </div>
            <div className="grid grid-cols-4 gap-2 flex-1">
              <MiniStat value={myStanding.played} label="Mecze" />
              <MiniStat value={myStanding.won} label="Wygrane" color="text-emerald-400" />
              <MiniStat value={myStanding.drawn} label="Remisy" color="text-slate-300" />
              <MiniStat value={myStanding.lost} label="Przegrane" color="text-red-400" />
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

function MiniStat({ value, label, color = 'text-white' }: { value: number; label: string; color?: string }) {
  return (
    <div className="bg-ink-900/60 border border-ink-700/60 rounded-lg py-2 px-1 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5 leading-tight">{label}</div>
    </div>
  );
}
