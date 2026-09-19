'use client';

import { useState, useEffect } from 'react';
import { LEAGUES_CONFIG } from '@/config/leagues';
import { fetchLeagueData, fetchLiveMatches, fetchLeagueStats, fetchLeagueSchedule } from '@/lib/nakkaApi';
import { computeLeagueStandings, buildPlayerStats, buildFixtures, buildLivePairKeys } from '@/lib/standings';
import { loadWhoAmI, clearWhoAmI, WhoAmI } from '@/lib/whoami';
import PlayerPicker from '@/components/PlayerPicker';
import BottomNav, { ViewId } from '@/components/BottomNav';
import StartView from '@/components/StartView';
import LigaView, { GlobalPlayer } from '@/components/LigaView';
import MojeMeczeView from '@/components/MojeMeczeView';
import LiveView from '@/components/LiveView';
import ProfilView from '@/components/ProfilView';

export default function HomePage() {
  const [whoami, setWhoami] = useState<WhoAmI | null | undefined>(undefined);
  const [view, setView] = useState<ViewId>('start');

  const [leagueData, setLeagueData] = useState<any>(null);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [schedule, setSchedule] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Zawodnicy ze WSZYSTKICH lig - do porównywarki (pobierani raz, nie co 5s)
  const [allPlayers, setAllPlayers] = useState<GlobalPlayer[]>([]);

  // Mecze na żywo ze WSZYSTKICH lig - do zakładki Live (odświeżane co 5s)
  const [allLiveMatches, setAllLiveMatches] = useState<any[]>([]);

  useEffect(() => {
    setWhoami(loadWhoAmI());
  }, []);

  const activeLeague = whoami ? LEAGUES_CONFIG.find((l) => l.id === whoami.leagueId) : undefined;

  // Dane bieżącej ligi - odświeżane co 5s (pauza, gdy karta jest w tle - oszczędza baterię i transfer)
  useEffect(() => {
    if (!activeLeague) return;
    let isSubscribed = true;

    async function loadData(showLoadingIndicator = false) {
      if (document.visibilityState === 'hidden') return;
      if (showLoadingIndicator) setLoading(true);

      const [data, live, leagueStats, sched] = await Promise.all([
        fetchLeagueData(activeLeague!.nakkaId),
        fetchLiveMatches(activeLeague!.nakkaId),
        fetchLeagueStats(activeLeague!.nakkaId),
        fetchLeagueSchedule(activeLeague!.nakkaId),
      ]);

      if (isSubscribed) {
        const activeOnly = (live || []).filter((m: any) => m.endMatch !== 1 && m.endMatch !== true);
        setLeagueData(data);
        setLiveMatches(activeOnly);
        setStats(leagueStats);
        setSchedule(sched);
        setLoading(false);
        setLastUpdated(new Date());
      }
    }

    loadData(true);
    const intervalId = setInterval(() => loadData(false), 5000);

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') loadData(false);
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeLeague]);

  // Zawodnicy wszystkich lig - jednorazowo, do porównywarki między ligami
  useEffect(() => {
    if (!whoami) return;
    let isSubscribed = true;

    async function loadAllPlayers() {
      const results = await Promise.all(
        LEAGUES_CONFIG.map(async (league) => {
          const [data, leagueStats] = await Promise.all([
            fetchLeagueData(league.nakkaId),
            fetchLeagueStats(league.nakkaId),
          ]);
          const tournament = data?.tournament || null;
          if (!tournament) return [];
          return buildPlayerStats(tournament, leagueStats).map((p) => ({ ...p, leagueName: league.name }));
        })
      );
      if (isSubscribed) setAllPlayers(results.flat());
    }

    loadAllPlayers();
    return () => {
      isSubscribed = false;
    };
  }, [whoami]);

  // Mecze na żywo ze wszystkich lig - dla zakładki Live, odświeżane co 5s (pauza w tle)
  useEffect(() => {
    if (!whoami) return;
    let isSubscribed = true;

    async function loadAllLive() {
      if (document.visibilityState === 'hidden') return;
      const results = await Promise.all(
        LEAGUES_CONFIG.map(async (league) => {
          const live = await fetchLiveMatches(league.nakkaId);
          const activeOnly = (live || []).filter((m: any) => m.endMatch !== 1 && m.endMatch !== true);
          return activeOnly.map((m: any) => ({
            ...m,
            _leagueName: league.name,
            _leagueNakkaId: league.nakkaId,
          }));
        })
      );
      if (isSubscribed) setAllLiveMatches(results.flat());
    }

    loadAllLive();
    const intervalId = setInterval(loadAllLive, 5000);

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') loadAllLive();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [whoami]);

  if (whoami === undefined) {
    return <main className="min-h-screen" />;
  }

  if (whoami === null || !activeLeague) {
    return (
      <PlayerPicker
        onDone={(w) => {
          setWhoami(w);
          setView('start');
        }}
      />
    );
  }

  const tournament = leagueData?.tournament || null;
  const livePairKeys = buildLivePairKeys(liveMatches);
  const standingsResult = tournament ? computeLeagueStandings(tournament) : null;
  const statsRows = tournament ? buildPlayerStats(tournament, stats) : [];
  const fixtures = tournament ? buildFixtures(tournament, schedule, livePairKeys) : [];

  const allStandingRows = standingsResult ? standingsResult.divisions.flat() : [];
  const myRankIndex = allStandingRows.findIndex((r) => r.tpid === whoami.tpid);
  const myStanding = myRankIndex >= 0 ? allStandingRows[myRankIndex] : null;
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;

  const myResults = (standingsResult?.results || []).filter(
    (r) => r.tpid1 === whoami.tpid || r.tpid2 === whoami.tpid
  );

  const myPendingFixtures = fixtures.filter(
    (f) => (f.tpid1 === whoami.tpid || f.tpid2 === whoami.tpid) && !f.played && !f.isLive
  );

  const liveMatchMine =
    liveMatches.find((m) => m.statsData?.some((s: any) => s.tpid === whoami.tpid)) || null;

  const myStats = statsRows.find((p) => p.tpid === whoami.tpid) || null;

  function handleReset() {
    clearWhoAmI();
    setWhoami(null);
    setLeagueData(null);
    setLiveMatches([]);
    setStats(null);
    setSchedule(null);
  }

  return (
    <main className="min-h-screen px-4 pb-28 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <img src="/logo.png" alt="Dart Dębica" className="w-10 h-10 rounded-full border border-brand/40 object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-white leading-tight tracking-wide">
            DART DĘBICA <span className="text-brand-light">ZONE</span>
          </p>
          <p className="text-[11px] text-slate-500 leading-tight truncate">{activeLeague.name} · {whoami.name}</p>
        </div>
        {lastUpdated && (
          <div className="shrink-0 flex items-center gap-1.5 text-[10px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            {lastUpdated.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-ink-800/60 border border-ink-700" />
          ))}
        </div>
      ) : (
        <div key={view} className="animate-fadeIn">
          {view === 'start' && (
            <StartView
              playerName={whoami.name}
              leagueName={activeLeague.name}
              myStanding={myStanding}
              myRank={myRank}
              myTpid={whoami.tpid}
              myResults={myResults}
              myPendingFixtures={myPendingFixtures}
              liveMatchMine={liveMatchMine}
              leagueUrl={leagueData?.url}
              onGoToLiga={() => setView('liga')}
              onGoToMoje={() => setView('moje')}
            />
          )}

          {view === 'liga' && (
            <LigaView
              leagueName={activeLeague.name}
              standingsResult={standingsResult}
              statsRows={statsRows}
              allPlayers={allPlayers}
              myTpid={whoami.tpid}
              leagueUrl={leagueData?.url}
            />
          )}

          {view === 'moje' && (
            <MojeMeczeView
              playerName={whoami.name}
              myResults={myResults}
              myPendingFixtures={myPendingFixtures}
              liveMatchMine={liveMatchMine}
              leagueUrl={leagueData?.url}
            />
          )}

          {view === 'live' && <LiveView matches={allLiveMatches} myTpid={whoami.tpid} />}

          {view === 'profil' && (
            <ProfilView
              playerName={whoami.name}
              leagueName={activeLeague.name}
              myStanding={myStanding}
              myRank={myRank}
              myTpid={whoami.tpid}
              myResults={myResults}
              myStats={myStats}
              onReset={handleReset}
            />
          )}
        </div>
      )}

      <BottomNav active={view} onChange={setView} liveCount={allLiveMatches.length} />
    </main>
  );
}
