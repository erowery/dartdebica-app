'use client';

import { useState, useEffect } from 'react';
import { LEAGUES_CONFIG } from '@/config/leagues';
import { fetchLeagueData, fetchLiveMatches, fetchLeagueStats } from '@/lib/nakkaApi';
import { computeLeagueStandings, buildPlayerStats } from '@/lib/standings';
import { loadWhoAmI, clearWhoAmI, WhoAmI } from '@/lib/whoami';
import PlayerPicker from '@/components/PlayerPicker';
import BottomNav, { ViewId } from '@/components/BottomNav';
import StartView from '@/components/StartView';
import LigaView from '@/components/LigaView';
import MojeMeczeView from '@/components/MojeMeczeView';
import LiveView from '@/components/LiveView';
import ProfilView from '@/components/ProfilView';

export default function HomePage() {
  const [whoami, setWhoami] = useState<WhoAmI | null | undefined>(undefined); // undefined = jeszcze nie sprawdzono
  const [view, setView] = useState<ViewId>('start');

  const [leagueData, setLeagueData] = useState<any>(null);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setWhoami(loadWhoAmI());
  }, []);

  const activeLeague = whoami ? LEAGUES_CONFIG.find((l) => l.id === whoami.leagueId) : undefined;

  useEffect(() => {
    if (!activeLeague) return;
    let isSubscribed = true;

    async function loadData(showLoadingIndicator = false) {
      if (showLoadingIndicator) setLoading(true);

      const [data, live, leagueStats] = await Promise.all([
        fetchLeagueData(activeLeague!.nakkaId),
        fetchLiveMatches(activeLeague!.nakkaId),
        fetchLeagueStats(activeLeague!.nakkaId),
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

  // Ekran ładowania początkowego (sprawdzanie localStorage)
  if (whoami === undefined) {
    return <main className="min-h-screen" />;
  }

  // Brak wybranego gracza -> ekran "wybierz siebie"
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
  const standingsResult = tournament ? computeLeagueStandings(tournament) : null;
  const statsRows = tournament ? buildPlayerStats(tournament, stats) : [];

  const allStandingRows = standingsResult ? standingsResult.divisions.flat() : [];
  const myRankIndex = allStandingRows.findIndex((r) => r.tpid === whoami.tpid);
  const myStanding = myRankIndex >= 0 ? allStandingRows[myRankIndex] : null;
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;

  const myResults = (standingsResult?.results || []).filter(
    (r) => r.tpid1 === whoami.tpid || r.tpid2 === whoami.tpid
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
  }

  return (
    <main className="min-h-screen px-4 pb-28 pt-6 max-w-4xl mx-auto">
      {/* Pasek górny */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src="/logo.png"
          alt="Dart Dębica"
          className="w-10 h-10 rounded-full border border-brand/40 object-cover"
        />
        <div>
          <p className="text-sm font-bold text-white leading-tight">Dart Dębica</p>
          <p className="text-[11px] text-slate-500 leading-tight">{activeLeague.name}</p>
        </div>
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
              myResults={myResults}
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
              myTpid={whoami.tpid}
              leagueUrl={leagueData?.url}
            />
          )}

          {view === 'moje' && (
            <MojeMeczeView
              playerName={whoami.name}
              myResults={myResults}
              liveMatchMine={liveMatchMine}
              onGoToLive={() => setView('live')}
            />
          )}

          {view === 'live' && (
            <LiveView liveMatches={liveMatches} myTpid={whoami.tpid} leagueNakkaId={activeLeague.nakkaId} />
          )}

          {view === 'profil' && (
            <ProfilView
              playerName={whoami.name}
              leagueName={activeLeague.name}
              myStanding={myStanding}
              myRank={myRank}
              myStats={myStats}
              onReset={handleReset}
            />
          )}
        </div>
      )}

      <BottomNav active={view} onChange={setView} liveCount={liveMatches.length} />
    </main>
  );
}
