'use client';

import { StandingRow, MatchResultRow } from '@/lib/standings';

interface FormItem {
  result: 'Z' | 'R' | 'P';
  opponent: string;
  myLegs: number;
  theirLegs: number;
}

function formForPlayer(myTpid: string, results: MatchResultRow[]): FormItem[] {
  return results.slice(-5).map((m) => {
    const iAmP1 = m.tpid1 === myTpid;
    const myLegs = iAmP1 ? m.legs1 : m.legs2;
    const theirLegs = iAmP1 ? m.legs2 : m.legs1;
    const opponent = iAmP1 ? m.name2 : m.name1;
    const result: 'Z' | 'R' | 'P' = myLegs > theirLegs ? 'Z' : myLegs < theirLegs ? 'P' : 'R';
    return { result, opponent, myLegs, theirLegs };
  });
}

const FORM_STYLE: Record<'Z' | 'R' | 'P', { bg: string; border: string; text: string; arrow: string }> = {
  Z: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', arrow: '↗' },
  R: { bg: 'bg-slate-500/15', border: 'border-slate-500/40', text: 'text-slate-300', arrow: '→' },
  P: { bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-400', arrow: '↘' },
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
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {form.map((f, idx) => {
                  const s = FORM_STYLE[f.result];
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2 min-w-[56px] shrink-0 ${s.bg} ${s.border}`}
                    >
                      <span className="text-[8px] text-slate-400 truncate max-w-[48px]">v. {f.opponent}</span>
                      <span className={`text-base font-extrabold leading-none ${s.text}`}>{f.result}</span>
                      <span className={`text-[10px] leading-none ${s.text}`}>{s.arrow}</span>
                      <span className="text-[10px] font-bold text-white">
                        {f.myLegs}:{f.theirLegs}
                      </span>
                    </div>
                  );
                })}
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
