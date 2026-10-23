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
      <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Pozycja w lidze</p>
      <p className="text-base font-bold text-white mb-3">{leagueName}</p>

      {myStanding ? (
        <>
          <div className="flex items-stretch gap-2 mb-4">
            <div className="shrink-0 w-[68px] rounded-xl bg-gold/10 border border-gold/30 flex flex-col items-center justify-center">
              <div className="text-[28px] font-extrabold text-gold leading-none">{myRank ?? '-'}</div>
              <div className="text-[10px] text-gold/80 mt-1">miejsce</div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 flex-1 min-w-0">
              <MiniStat value={myStanding.played} label="mecze" />
              <MiniStat value={myStanding.won} label="wygrane" color="text-emerald-400" />
              <MiniStat value={myStanding.drawn} label="remisy" color="text-slate-300" />
              <MiniStat value={myStanding.lost} label="porażki" color="text-red-400" />
            </div>
          </div>

          {form.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Forma (ostatnie mecze)</p>
              <div className="grid grid-cols-5 gap-1.5">
                {form.map((f, idx) => {
                  const s = FORM_STYLE[f.result];
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2 min-w-0 ${s.bg} ${s.border}`}
                    >
                      <span className="text-[9px] text-slate-400 truncate max-w-full">{f.opponent}</span>
                      <span className={`text-base font-extrabold leading-none mt-0.5 ${s.text}`}>{f.result}</span>
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
        <p className="text-sm text-slate-400">Jeszcze nie rozegrałeś meczu w tabeli.</p>
      )}
    </div>
  );
}

function MiniStat({ value, label, color = 'text-white' }: { value: number; label: string; color?: string }) {
  return (
    <div className="bg-ink-900/60 border border-ink-700/60 rounded-xl py-2 px-0.5 text-center min-w-0">
      <div className={`text-xl font-extrabold leading-tight ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight truncate">{label}</div>
    </div>
  );
}
