'use client';

import { useState, useEffect } from 'react';
import { LEAGUES_CONFIG, LeagueConfig } from '@/config/leagues';
import { fetchLeagueData, fetchLiveMatches, fetchLeagueStats } from '@/lib/nakkaApi';
import { computeLeagueStandings, calcAverage } from '@/lib/standings';

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
        // Filtrujemy tylko trwające mecze (endMatch !== 1)
        const activeOnly = (live || []).filter((m: any) => m.endMatch !== 1 && m.endMatch !== true);

        setLeagueData(data);
        setLiveMatches(activeOnly);
        setStats(leagueStats);
        setLoading(false);
      }
    }

    loadData(true);

    const intervalId = setInterval(() => {
      loadData(false);
    }, 5000);

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

    return { p1Name, p2Name, p1Avg, p2Avg, legs: `${leg1} - ${leg2}`, nakkaMatchUrl };
  };

  // Lista zawodników posortowana wg średniej (do zakładki Statystyki)
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
            bestLeg: s.best ?? null,
          };
        })
        .sort((a, b) => (b.average ?? 0) - (a.average ?? 0))
    : [];

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      {/* Nagłówek */}
      <header className="text-center my-6">
        <h1 className="text-3xl font-bold text-red-500 flex items-center justify-center gap-2">
          🎯 Dart Dębica
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Liga Dębicka - Wyniki i Tabele Na Żywo
        </p>
      </header>

      {/* Przełącznik Lig */}
      <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {LEAGUES_CONFIG.map((league) => (
          <button
            key={league.id}
            onClick={() => setActiveLeague(league)}
            className={`py-2.5 px-4 rounded-xl font-semibold text-sm transition-all ${
              activeLeague.id === league.id
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {league.shortName}
          </button>
        ))}
      </nav>

      {/* Zakładki */}
      <div className="flex border-b border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('table')}
          className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'table'
              ? 'border-red-500 text-red-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🏆 Tabela & Wyniki
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'live'
              ? 'border-red-500 text-red-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Na Żywo ({liveMatches.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'stats'
              ? 'border-red-500 text-red-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📊 Statystyki
        </button>
      </div>

      {/* Zawartość */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Ładowanie danych...</div>
      ) : (
        <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
          {activeTab === 'table' && (
            <div>
              <h2 className="text-xl font-bold mb-4">{activeLeague.name}</h2>

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
                    <h3 className="text-sm font-semibold text-slate-400 mb-2">Grupa {divIndex + 1}</h3>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Zawodnik</th>
                          <th className="p-2 text-center">M</th>
                          <th className="p-2 text-center">W</th>
                          <th className="p-2 text-center">R</th>
                          <th className="p-2 text-center">P</th>
                          <th className="p-2 text-center">Legi</th>
                          <th className="p-2 text-center">Pkt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {rows.map((row, idx) => (
                          <tr key={row.tpid}>
                            <td className="p-2 text-slate-500">{idx + 1}</td>
                            <td className="p-2 font-medium text-white">{row.name}</td>
                            <td className="p-2 text-center">{row.played}</td>
                            <td className="p-2 text-center">{row.won}</td>
                            <td className="p-2 text-center">{row.drawn}</td>
                            <td className="p-2 text-center">{row.lost}</td>
                            <td className="p-2 text-center">{row.legsFor}:{row.legsAgainst}</td>
                            <td className="p-2 text-center font-bold text-red-400">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {tournament && standingsResult && standingsResult.results.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2 mt-2">Rozegrane mecze</h3>
                  <div className="space-y-2">
                    {standingsResult.results.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm bg-slate-900 border border-slate-700 rounded-lg px-3 py-2"
                      >
                        <span className="text-slate-200 truncate">{m.name1}</span>
                        <span className="font-bold text-red-400 px-3 whitespace-nowrap">
                          {m.legs1} - {m.legs2}
                        </span>
                        <span className="text-slate-200 truncate text-right">{m.name2}</span>
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
                  className="inline-block mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                >
                  Otwórz pełny widok turnieju na Nakka ↗
                </a>
              )}
            </div>
          )}

          {activeTab === 'live' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Mecze Na Żywo</h2>
              {liveMatches.length > 0 ? (
                <div className="space-y-4">
                  {liveMatches.map((match: any, idx: number) => {
                    const { p1Name, p2Name, p1Avg, p2Avg, legs, nakkaMatchUrl } = parseMatchDetails(match);

                    return (
                      <div key={idx} className="p-4 bg-slate-900 border border-slate-700 rounded-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-bold animate-pulse">
                            LIVE
                          </span>
                          <a
                            href={nakkaMatchUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1"
                          >
                            Otwórz w Nakka ↗
                          </a>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 overflow-hidden">
                            <span className="font-semibold text-white text-sm sm:text-base truncate">{p1Name}</span>
                            {p1Avg !== null && (
                              <span className="text-[11px] sm:text-xs text-amber-400 font-medium bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 w-fit">
                                ({p1Avg})
                              </span>
                            )}
                          </div>

                          <div className="bg-slate-800 text-red-400 font-bold text-sm sm:text-base px-3 py-1 rounded-lg border border-slate-700 whitespace-nowrap shadow-sm">
                            {legs}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1 overflow-hidden text-right">
                            <span className="font-semibold text-white text-sm sm:text-base truncate order-1 sm:order-2">{p2Name}</span>
                            {p2Avg !== null && (
                              <span className="text-[11px] sm:text-xs text-amber-400 font-medium bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 w-fit self-end sm:self-auto order-2 sm:order-1">
                                ({p2Avg})
                              </span>
                            )}
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
              <h2 className="text-xl font-bold mb-4">Statystyki Graczy</h2>
              {statsRows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Gracz</th>
                        <th className="p-2 text-center">Średnia</th>
                        <th className="p-2 text-center">Mecze (W)</th>
                        <th className="p-2 text-center">Legi (W)</th>
                        <th className="p-2 text-center">180</th>
                        <th className="p-2 text-center">High out</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {statsRows.map((player, idx) => (
                        <tr key={player.tpid}>
                          <td className="p-2 text-slate-500">{idx + 1}</td>
                          <td className="p-2 font-medium text-white">{player.name}</td>
                          <td className="p-2 text-center text-red-400 font-bold">
                            {player.average !== null ? player.average.toFixed(2) : '-'}
                          </td>
                          <td className="p-2 text-center">{player.matches} ({player.matchesWon})</td>
                          <td className="p-2 text-center">{player.legs} ({player.legsWon})</td>
                          <td className="p-2 text-center">{player.t80}</td>
                          <td className="p-2 text-center">{player.highOut || '-'}</td>
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
    </main>
  );
}
