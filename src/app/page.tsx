'use client';

import { useState, useEffect } from 'react';
import { LEAGUES_CONFIG, LeagueConfig } from '@/config/leagues';
import { fetchLeagueData, fetchLiveMatches, fetchLeagueStats } from '@/lib/nakkaApi';
import { computeLeagueStandings, calcAverage } from '@/lib/standings';

const MEDALS = ['🥇', '🥈', '🥉'];

function rankBadge(idx: number) {
  return MEDALS[idx] || `${idx + 1}`;
}

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function HomePage() {
  const [activeLeague, setActiveLeague] = useState<LeagueConfig>(LEAGUES_CONFIG[0]);
  const [activeTab, setActiveTab] = useState<'table' | 'live' | 'stats'>('table');

  const [leagueData, setLeagueData] = useState<any>(null);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isSubscribed = true;

    async function loadData(showLoadingIndicator = false) {
      if (showLoadingIndicator) setLoading(true);

      const [data, live, leagueStats] = await Promise.all([
        fetchLeagueData(activeLeague.nakkaId),
        fetchLiveMatches(activeLeague.nakkaId),
        fetchLeagueStats(activeLeague.nakkaId),
      ]);

      if (isSubscribed) {
        const activeOnly = (live || []).filter((m: any) => m.endMatch !== 1 && m.endMatch !== true);

        setLeagueData(data);
        setLiveMatches(activeOnly);
        setStats(leagueStats);
        setLoading(false);
      }
    }

    loadData(true);
    const intervalId = setInterval(() => loadData(false), 5000);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [activeLeague]);

  const tournament = leagueData?.tournament || null;
  const standingsResult = tournament ? computeLeagueStandings(tournament) : null;

  const parseMatchDetails = (match: any) => {
    const p1 = match.statsData?.[0] || {};
    const p2 = match.statsData?.[1] || {};

    const p1Name = p1.name || 'Gracz 1';
    const p2Name = p2.name || 'Gracz 2';

    const p1Avg = calcAverage(p1.allScore || 0, p1.allDarts || 0);
    const p2Avg = calcAverage(p2.allScore || 0, p2.allDarts || 0);

    const leg1 = p1.winLegs ?? 0;
    const leg2 = p2.winLegs ?? 0;

    const tmid = match.tmid || match.mid;
    const nakkaMatchUrl = tmid
      ? `https://n01darts.com/n01/league/n01_view.html?tmid=${tmid}`
      : `https://n01darts.com/n01/league/season.php?id=${activeLeague.nakkaId}`;

    return { p1Name, p2Name, p1Avg, p2Avg, leg1, leg2, nakkaMatchUrl };
  };

  const statsRows = tournament && stats
    ? Object.keys(stats)
        .map((tpid) => {
          const s = stats[tpid];
          const entry = tournament.entry_list?.find((e: any) => e.tpid === tpid);
          return {
            tpid,
            name: entry?.name || tpid,
            average: calcAverage(s.score || 0, s.darts || 0),
            matches: s.match ?? 0,
            matchesWon: s.winMatch ?? 0,
            legs: s.leg ?? 0,
            legsWon: s.winLeg ?? 0,
            t80: s.ton80 ?? 0,
            highOut: s.highOut ?? 0,
          };
        })
        .sort((a, b) => (b.average ?? 0) - (a.average ?? 0))
    : [];

  const TABS: { id: 'table' | 'live' | 'stats'; label: string; icon: string }[] = [
    { id: 'table', label: 'Tabela & Wyniki', icon: '🏆' },
    { id: 'live', label: `Na Żywo (${liveMatches.length})`, icon: 'live' },
    { id: 'stats', label: 'Statystyki', icon: '📊' },
  ];

  return (
    <main className="min-h-screen px-4 pb-16 pt-8 max-w-4xl mx-auto">
      {/* Nagłówek */}
      <header className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-brand/30 blur-xl" />
          <img
            src="/logo.png"
            alt="Stowarzyszenie Dart Dębica"
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-glow border border-brand/40 object-cover"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
          Dart Dębica
        </h1>
        <p className="text-slate-400 text-sm mt-1.5 tracking-wide uppercase text-[11px] font-medium">
          Liga Dębicka · Wyniki i Tabele Na Żywo
        </p>
      </header>

      {/* Przełącznik Lig */}
      <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {LEAGUES_CONFIG.map((league) => {
          const active = activeLeague.id === league.id;
          return (
            <button
              key={league.id}
              onClick={() => setActiveLeague(league)}
              className={`py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                active
                  ? 'bg-gradient-to-b from-brand to-brand-dark text-white border-brand-light/40 shadow-glow'
                  : 'bg-ink-800/60 text-slate-300 border-ink-700 hover:border-brand/40 hover:text-white'
              }`}
            >
              {league.shortName}
            </button>
          );
        })}
      </nav>

      {/* Zakładki - segmented control */}
      <div className="flex gap-1 mb-6 p-1 rounded-2xl bg-ink-800/60 border border-ink-700">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-b from-brand to-brand-dark text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon === 'live' ? (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              ) : (
                <span>{tab.icon}</span>
              )}
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Zawartość */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-ink-800/60 border border-ink-700" />
          ))}
        </div>
      ) : (
        <section
          key={activeTab + activeLeague.id}
          className="bg-ink-900/70 backdrop-blur-sm border border-ink-700/60 rounded-3xl p-4 sm:p-6 shadow-xl animate-fadeIn"
        >
          {activeTab === 'table' && (
            <div>
              <h2 className="text-xl font-bold mb-5">{activeLeague.name}</h2>

              {!tournament && (
                <p className="text-slate-400">Brak dostępnych danych dla tej ligi.</p>
              )}

              {tournament && !standingsResult && (
                <p className="text-slate-400">
                  Ta liga nie korzysta z klasycznego formatu tabelowego (np. sama drabinka pucharowa) -
                  tabeli nie da się tu policzyć. Zobacz pełny widok na Nakka poniżej.
                </p>
              )}

              {tournament && standingsResult && standingsResult.divisions.map((rows, divIndex) => (
                <div key={divIndex} className="mb-8">
                  {standingsResult.divisions.length > 1 && (
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Grupa {divIndex + 1}
                    </h3>
                  )}
                  <div className="overflow-x-auto rounded-2xl border border-ink-700/60">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-ink-800/80 text-slate-500 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Zawodnik</th>
                          <th className="p-3 text-center">M</th>
                          <th className="p-3 text-center">W</th>
                          <th className="p-3 text-center">R</th>
                          <th className="p-3 text-center">P</th>
                          <th className="p-3 text-center">Legi</th>
                          <th className="p-3 text-center">Pkt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-700/60">
                        {rows.map((row, idx) => (
                          <tr key={row.tpid} className="hover:bg-ink-800/40 transition-colors">
                            <td className="p-3 text-slate-500 font-medium">{rankBadge(idx)}</td>
                            <td className="p-3 font-semibold text-white">{row.name}</td>
                            <td className="p-3 text-center">{row.played}</td>
                            <td className="p-3 text-center text-emerald-400">{row.won}</td>
                            <td className="p-3 text-center text-slate-400">{row.drawn}</td>
                            <td className="p-3 text-center text-red-400">{row.lost}</td>
                            <td className="p-3 text-center text-slate-400">{row.legsFor}:{row.legsAgainst}</td>
                            <td className="p-3 text-center">
                              <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-bold border border-gold/30">
                                {row.points}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {tournament && standingsResult && standingsResult.results.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">
                    Rozegrane mecze
                  </h3>
                  <div className="space-y-2">
                    {standingsResult.results.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm bg-ink-800/50 border border-ink-700/60 rounded-xl px-4 py-2.5 hover:border-brand/30 transition-colors"
                      >
                        <span className="text-slate-200 font-medium truncate">{m.name1}</span>
                        <span className="font-bold text-white px-3 whitespace-nowrap bg-ink-700/60 rounded-lg py-0.5 mx-2">
                          {m.legs1} - {m.legs2}
                        </span>
                        <span className="text-slate-200 font-medium truncate text-right">{m.name2}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {leagueData?.url && (
                <a
                  href={leagueData.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-6 px-4 py-2.5 bg-gradient-to-b from-brand to-brand-dark hover:brightness-110 text-white rounded-xl text-xs font-semibold shadow-glow transition-all"
                >
                  Otwórz pełny widok turnieju na Nakka ↗
                </a>
              )}
            </div>
          )}

          {activeTab === 'live' && (
            <div>
              <h2 className="text-xl font-bold mb-5">Mecze Na Żywo</h2>
              {liveMatches.length > 0 ? (
                <div className="space-y-4">
                  {liveMatches.map((match: any, idx: number) => {
                    const { p1Name, p2Name, p1Avg, p2Avg, leg1, leg2, nakkaMatchUrl } = parseMatchDetails(match);

                    return (
                      <div
                        key={idx}
                        className="relative p-4 sm:p-5 bg-ink-800/60 border border-brand/25 rounded-2xl flex flex-col gap-4 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-radial-fade pointer-events-none" />

                        <div className="relative flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[11px] bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                            </span>
                            LIVE
                          </span>
                          <a
                            href={nakkaMatchUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs bg-ink-700/70 hover:bg-ink-700 text-slate-200 border border-ink-600 px-3 py-1 rounded-lg font-semibold transition-colors"
                          >
                            Otwórz w Nakka ↗
                          </a>
                        </div>

                        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="hidden sm:flex shrink-0 w-9 h-9 rounded-full bg-ink-700 border border-ink-600 items-center justify-center font-bold text-slate-300 text-sm">
                              {initials(p1Name)}
                            </span>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-semibold text-white text-sm sm:text-base truncate">{p1Name}</span>
                              {p1Avg !== null && (
                                <span className="text-[11px] text-gold font-medium w-fit">śr. {p1Avg}</span>
                              )}
                            </div>
                          </div>

                          <div className="bg-gradient-to-b from-ink-700 to-ink-800 text-white font-extrabold text-base sm:text-lg px-4 py-1.5 rounded-xl border border-ink-600 whitespace-nowrap shadow-lg">
                            {leg1} <span className="text-slate-500">-</span> {leg2}
                          </div>

                          <div className="flex items-center justify-end gap-2.5 overflow-hidden text-right">
                            <div className="flex flex-col items-end overflow-hidden">
                              <span className="font-semibold text-white text-sm sm:text-base truncate">{p2Name}</span>
                              {p2Avg !== null && (
                                <span className="text-[11px] text-gold font-medium w-fit">śr. {p2Avg}</span>
                              )}
                            </div>
                            <span className="hidden sm:flex shrink-0 w-9 h-9 rounded-full bg-ink-700 border border-ink-600 items-center justify-center font-bold text-slate-300 text-sm">
                              {initials(p2Name)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Aktualnie żaden mecz tej ligi nie jest rozgrywany na żywo.</p>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-xl font-bold mb-5">Statystyki Graczy</h2>
              {statsRows.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-ink-700/60">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-ink-800/80 text-slate-500 uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Gracz</th>
                        <th className="p-3 text-center">Średnia</th>
                        <th className="p-3 text-center">Mecze (W)</th>
                        <th className="p-3 text-center">Legi (W)</th>
                        <th className="p-3 text-center">180</th>
                        <th className="p-3 text-center">High out</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-700/60">
                      {statsRows.map((player, idx) => (
                        <tr key={player.tpid} className="hover:bg-ink-800/40 transition-colors">
                          <td className="p-3 text-slate-500 font-medium">{rankBadge(idx)}</td>
                          <td className="p-3 font-semibold text-white">{player.name}</td>
                          <td className="p-3 text-center">
                            <span className="font-bold text-gold">
                              {player.average !== null ? player.average.toFixed(2) : '-'}
                            </span>
                          </td>
                          <td className="p-3 text-center">{player.matches} <span className="text-emerald-400">({player.matchesWon})</span></td>
                          <td className="p-3 text-center">{player.legs} <span className="text-emerald-400">({player.legsWon})</span></td>
                          <td className="p-3 text-center">{player.t80}</td>
                          <td className="p-3 text-center">{player.highOut || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Brak zapisanych statystyk dla tej ligi.</p>
              )}
            </div>
          )}
        </section>
      )}

      <footer className="text-center mt-10 text-[11px] text-slate-600 tracking-wide">
        Stowarzyszenie Dart Dębica · dane na żywo z n01 / Nakka
      </footer>
    </main>
  );
}
