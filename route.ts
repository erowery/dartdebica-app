import { LEAGUES_CONFIG } from '@/config/leagues';
import { fetchLeagueData, fetchLeagueSchedule } from '@/lib/nakkaApi';
import { buildFixtures, getEntryName } from '@/lib/standings';
import { buildPlayerCalendar } from '@/lib/ics';

// Darmowa funkcja Vercela: przy każdym odświeżeniu kalendarza w telefonie
// pobiera aktualny terminarz z Nakka (nic nie jest nigdzie zapisywane).
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const leagueId = url.searchParams.get('liga') || '';
  const tpid = url.searchParams.get('gracz') || '';
  const league = LEAGUES_CONFIG.find((l) => l.id === leagueId);
  if (!league || !tpid) {
    return new Response('Brak ligi lub zawodnika', { status: 400 });
  }

  const [data, schedule] = await Promise.all([fetchLeagueData(league.nakkaId), fetchLeagueSchedule(league.nakkaId)]);
  const tournament = data?.tournament;
  if (!tournament) {
    return new Response('Nie udało się pobrać danych z Nakka', { status: 502 });
  }

  const ics = buildPlayerCalendar({
    playerName: getEntryName(tournament, tpid),
    myTpid: tpid,
    leagueName: league.name,
    fixtures: buildFixtures(tournament, schedule as any[][] | null),
    calendarId: `${league.nakkaId}-${tpid}`,
  });

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="mecze-lsdd.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}
