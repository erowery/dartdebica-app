'use client';

import { useState } from 'react';
import { MatchResultRow, FixtureRow, LeagueStandingsResult, PlayerStatRow } from '@/lib/standings';
import MatchPreview from '@/components/MatchPreview';
import CalendarCard from '@/components/CalendarCard';
import { IconCheckCircle, IconClock } from '@/components/icons';

export default function MojeMeczeView({
  playerName,
  myResults,
  myPendingFixtures,
  leagueUrl,
  myTpid,
  standingsResult,
  statsRows,
  leagueId,
}: {
  leagueId: string;
  myTpid: string;
  standingsResult: LeagueStandingsResult | null;
  statsRows: PlayerStatRow[];
  playerName: string;
  myResults: MatchResultRow[];
  myPendingFixtures: FixtureRow[];
  liveMatchMine: any | null;
  leagueUrl?: string;
}) {
  const [subTab, setSubTab] = useState<'done' | 'pending'>('done');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const doneOrdered = myResults.slice().reverse();
  const doneVisible = doneOrdered.slice(0, 5);

  const today = new Date();
  const pendingSorted = myPendingFixtures.slice().sort((a, b) => {
    if (a.date && b.date) return a.date.getTime() - b.date.getTime();
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
  const pendingVisible = pendingSorted.slice(0, 5);

  function formatDate(date: Date) {
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Moje Mecze</h2>
      <p className="text-slate-400 text-sm mb-5">{playerName}</p>

      <div className="flex gap-1 mb-5 p-1 rounded-2xl bg-ink-800/60 border border-ink-700 text-xs sm:text-sm">
        {[
          { id: 'done', label: 'Zakończone', Icon: IconCheckCircle },
          { id: 'pending', label: 'Do rozegrania', Icon: IconClock },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-semibold transition-all ${
              subTab === t.id ? 'bg-gradient-to-b from-brand to-brand-dark text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.Icon className="w-4 h-4 shrink-0" />
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

                const Row: any = m.hasDetail ? 'a' : 'div';
                const linkProps = m.hasDetail ? { href: m.nakkaMatchUrl, target: '_blank', rel: 'noreferrer' } : {};

                return (
                  <Row
                    key={idx}
                    {...linkProps}
                    className="flex items-center gap-3 text-sm bg-ink-800/50 border border-ink-700/60 hover:border-brand/30 rounded-xl px-4 py-3 transition-colors"
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
                  </Row>
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
          <CalendarCard leagueId={leagueId} tpid={myTpid} />
          {pendingVisible.length === 0 ? (
            <p className="text-slate-400 text-sm">Nie masz zaplanowanych meczów do rozegrania.</p>
          ) : (
            <div className="space-y-2">
              {pendingVisible.map((f, idx) => {
                const opponent = f.name1 === playerName ? f.name2 : f.name1;
                const isOverdue = f.date ? f.date.getTime() < today.setHours(0, 0, 0, 0) : false;
                const oppTpid = f.tpid1 === myTpid ? f.tpid2 : f.tpid1;
                const open = openIdx === idx;
                return (
                  <div key={idx} className="text-sm bg-ink-800/50 border border-ink-700/60 rounded-xl px-4 py-3">
                    <button onClick={() => setOpenIdx(open ? null : idx)} className="w-full flex items-center justify-between text-left">
                      <div className="min-w-0">
                        <span className="text-white font-medium truncate block">vs {opponent}</span>
                        {f.date && <span className="text-sm font-semibold text-slate-300">{formatDate(f.date)}</span>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isOverdue ? (
                          <span className="text-[11px] uppercase tracking-wider text-red-400 font-bold bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full">
                            Zaległy
                          </span>
                        ) : (
                          <span className="text-[11px] uppercase tracking-wider text-gold font-bold bg-gold/10 border border-gold/30 px-2.5 py-1 rounded-full">
                            Do rozegrania
                          </span>
                        )}
                        <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
                      </div>
                    </button>
                    {open && (
                      <MatchPreview
                        myTpid={myTpid}
                        oppTpid={oppTpid}
                        myName={playerName}
                        oppName={opponent}
                        standingsResult={standingsResult}
                        statsRows={statsRows}
                      />
                    )}
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
