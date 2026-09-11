// Nakka trzyma wyniki lig w polach lg_table / lg_result turnieju.
// lg_table:  jedna tablica na grupę, z listą tpid zawodników tej grupy.
// lg_result: obiekt kluczowany "<grupa>_<id_meczu>", a pod nim wynik
//            zapisany osobno z punktu widzenia każdego z dwóch zawodników:
//            { "0_cma7": { "S1nX": { "rfm0": {r:2, a:72.32} },
//                          "rfm0": { "S1nX": {r:2, a:78.51} } } }
// "r" = liczba wygranych legów w tym meczu, "a" = średnia zawodnika w tym meczu.

export interface StandingRow {
  tpid: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  legsFor: number;
  legsAgainst: number;
  points: number;
}

export interface MatchResultRow {
  tpid1: string;
  tpid2: string;
  name1: string;
  name2: string;
  legs1: number;
  legs2: number;
  avg1: number;
  avg2: number;
}

export interface LeagueStandingsResult {
  divisions: StandingRow[][];
  results: MatchResultRow[];
}

function getEntryName(tournament: any, tpid: string): string {
  const entry = tournament?.entry_list?.find((e: any) => e.tpid === tpid);
  return entry?.name || tpid;
}

/**
 * Liczy tabelę ligową i listę wyników na podstawie tournament.lg_table / lg_result.
 * Zwraca null, jeśli ta liga nie korzysta z formatu ligowego (np. tylko drabinka pucharowa).
 */
export function computeLeagueStandings(tournament: any): LeagueStandingsResult | null {
  if (!tournament || !Array.isArray(tournament.lg_table) || !tournament.lg_result) {
    return null;
  }

  const pointsWin = tournament.lg_setting?.point_w ?? 2;
  const pointsDraw = tournament.lg_setting?.point_d ?? 1;
  const pointsLose = tournament.lg_setting?.point_l ?? 0;

  const divisions: StandingRow[][] = [];
  const results: MatchResultRow[] = [];

  tournament.lg_table.forEach((division: string[], divIndex: number) => {
    const table: Record<string, StandingRow> = {};

    (division || []).forEach((tpid) => {
      if (!tpid || tpid === 'empty') return;
      table[tpid] = {
        tpid,
        name: getEntryName(tournament, tpid),
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        legsFor: 0,
        legsAgainst: 0,
        points: 0,
      };
    });

    const prefix = `${divIndex}_`;

    Object.keys(tournament.lg_result).forEach((key) => {
      if (!key.startsWith(prefix)) return;
      const matchObj = tournament.lg_result[key];
      const tpids = Object.keys(matchObj || {});
      if (tpids.length < 2) return;

      const [tpidA, tpidB] = tpids;
      const resA = matchObj[tpidA]?.[tpidB];
      const resB = matchObj[tpidB]?.[tpidA];
      if (!resA || !resB) return;

      const legsA = resA.r ?? 0;
      const legsB = resB.r ?? 0;

      results.push({
        tpid1: tpidA,
        tpid2: tpidB,
        name1: getEntryName(tournament, tpidA),
        name2: getEntryName(tournament, tpidB),
        legs1: legsA,
        legs2: legsB,
        avg1: resA.a ?? 0,
        avg2: resB.a ?? 0,
      });

      if (table[tpidA]) {
        table[tpidA].played += 1;
        table[tpidA].legsFor += legsA;
        table[tpidA].legsAgainst += legsB;
      }
      if (table[tpidB]) {
        table[tpidB].played += 1;
        table[tpidB].legsFor += legsB;
        table[tpidB].legsAgainst += legsA;
      }

      if (legsA > legsB) {
        if (table[tpidA]) { table[tpidA].won += 1; table[tpidA].points += pointsWin; }
        if (table[tpidB]) { table[tpidB].lost += 1; table[tpidB].points += pointsLose; }
      } else if (legsB > legsA) {
        if (table[tpidB]) { table[tpidB].won += 1; table[tpidB].points += pointsWin; }
        if (table[tpidA]) { table[tpidA].lost += 1; table[tpidA].points += pointsLose; }
      } else {
        if (table[tpidA]) { table[tpidA].drawn += 1; table[tpidA].points += pointsDraw; }
        if (table[tpidB]) { table[tpidB].drawn += 1; table[tpidB].points += pointsDraw; }
      }
    });

    const rows = Object.values(table).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const diffA = a.legsFor - a.legsAgainst;
      const diffB = b.legsFor - b.legsAgainst;
      if (diffB !== diffA) return diffB - diffA;
      return b.legsFor - a.legsFor;
    });

    divisions.push(rows);
  });

  return { divisions, results };
}

/** Średnia zawodnika = (suma zdobytych punktów / liczba rzuconych lotek) * 3 */
export function calcAverage(score: number, darts: number): number | null {
  if (!darts || darts <= 0) return null;
  return Math.round(((score / darts) * 3) * 100) / 100;
}
