import { LeagueConfig } from '@/config/leagues';
import { fetchLeagueData, fetchLeagueSchedule, fetchMatchesInRange, fetchMatchDetail } from '@/lib/nakkaApi';
import { buildFixtures, calcAverage, computeLeagueStandings, getEntryName, pairKey } from '@/lib/standings';

// ---------- Tydzień ligowy: czwartek 00:00 - środa 23:59 ----------

export const DAY = 24 * 60 * 60 * 1000;
export const WEEKDAYS = ['nd', 'pn', 'wt', 'śr', 'czw', 'pt', 'sb'];

/** Początek tygodnia ligowego: czwartek 00:00 (czas lokalny) dla podanej daty */
export function thursdayOf(d: Date): Date {
  const diff = (d.getDay() - 4 + 7) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff, 0, 0, 0, 0);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 0, 0, 0, 0);
}

/** Domyślny tydzień: ten, w którym był "wczoraj" - w czwartek pokazuje poprzedni, zakończony tydzień */
export function defaultWeekStart(): Date {
  return thursdayOf(new Date(Date.now() - DAY));
}

const pad = (n: number) => String(n).padStart(2, '0');
export const dm = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
export const dmy = (d: Date) => `${dm(d)}.${d.getFullYear()}`;
export const hm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// ---------- Mecze tygodnia ----------

export interface WeekMatch {
  key: string;
  mid: string | null;
  time: Date;
  manual: boolean; // wpisany ręcznie w Nakka - bez godziny i bez średnich
  tpid1: string;
  tpid2: string;
  name1: string;
  name2: string;
  legs1: number;
  legs2: number;
  avg1: number | null;
  avg2: number | null;
  url: string | null;
  /** klucz wyniku w tournament.lg_result ("<grupa>_<lsid>") */
  lgKey: string | null;
  /** h (najwyższe zamknięcie) i b (best leg) z lg_result - jeśli liga je zapisuje */
  lgDetail: Record<string, { h?: number; b?: number }>;
}

export interface LeagueWeek {
  id: string;
  name: string;
  matches: WeekMatch[];
  error: boolean;
  /** pełne dane turnieju (do tabeli przed / po tygodniu) */
  tournament: any | null;
}

export async function loadLeagueWeek(league: LeagueConfig, start: Date, end: Date): Promise<LeagueWeek> {
  const [archive, data, schedule] = await Promise.all([
    fetchMatchesInRange(league.nakkaId, Math.floor(start.getTime() / 1000), Math.floor(end.getTime() / 1000)),
    fetchLeagueData(league.nakkaId),
    fetchLeagueSchedule(league.nakkaId),
  ]);
  const tournament = data?.tournament;
  const matches: WeekMatch[] = [];
  const seenPairs = new Set<string>();
  const fromSec = start.getTime() / 1000;
  const toSec = end.getTime() / 1000;

  // 1) Mecze rozegrane na żywo w Nakka - mają dokładną godzinę rozpoczęcia
  const byTmid: Record<string, any> = {};
  (archive || []).forEach((m: any) => {
    const tmid = String(m?.tmid || '');
    // dodatkowe zabezpieczenie: tylko mecze ligowe TEJ ligi i z wybranego tygodnia
    if (!tmid.startsWith(`${league.nakkaId}_lg_`)) return;
    if (Number(m.endMatch) !== 1) return;
    const st = Number(m.startTime || 0);
    if (st < fromSec || st >= toSec) return;
    const prev = byTmid[tmid];
    if (!prev || st > Number(prev.startTime || 0)) byTmid[tmid] = m;
  });

  Object.values(byTmid).forEach((m: any) => {
    const p1 = m.statsData?.[0] || {};
    const p2 = m.statsData?.[1] || {};
    if (p1.tpid && p2.tpid) seenPairs.add(pairKey(p1.tpid, p2.tpid));

    // tmid = <tdid>_lg_<grupa>_<lsid>_<tpid>_<tpid> -> wpis w lg_result["<grupa>_<lsid>"]
    const parts = String(m.tmid).slice(league.nakkaId.length + 4).split('_');
    const lgEntry = tournament?.lg_result?.[`${parts[0]}_${parts[1]}`];
    const lgDetail: WeekMatch['lgDetail'] = {};
    if (lgEntry && p1.tpid && p2.tpid) {
      lgDetail[p1.tpid] = lgEntry[p1.tpid]?.[p2.tpid] || {};
      lgDetail[p2.tpid] = lgEntry[p2.tpid]?.[p1.tpid] || {};
    }

    matches.push({
      key: m.tmid,
      mid: m.mid || null,
      time: new Date(Number(m.startTime || 0) * 1000),
      manual: false,
      tpid1: p1.tpid || '',
      tpid2: p2.tpid || '',
      name1: p1.tpid && tournament ? getEntryName(tournament, p1.tpid) : p1.name || 'Gracz 1',
      name2: p2.tpid && tournament ? getEntryName(tournament, p2.tpid) : p2.name || 'Gracz 2',
      legs1: p1.winLegs ?? 0,
      legs2: p2.winLegs ?? 0,
      avg1: calcAverage(p1.allScore || 0, p1.allDarts || 0),
      avg2: calcAverage(p2.allScore || 0, p2.allDarts || 0),
      url: `https://n01darts.com/n01/league/n01_view.html?tmid=${m.tmid}`,
      lgKey: `${parts[0]}_${parts[1]}`,
      lgDetail,
    });
  });

  // 2) Mecze wpisane ręcznie (bez średnich) - data z tytułu karty w terminarzu
  if (tournament) {
    const standings = computeLeagueStandings(tournament);
    const manualPairs = new Set(
      (standings?.results || []).filter((r) => !r.hasDetail).map((r) => pairKey(r.tpid1, r.tpid2))
    );
    buildFixtures(tournament, schedule as any[][] | null).forEach((f) => {
      const pk = pairKey(f.tpid1, f.tpid2);
      if (!f.played || !f.date || !manualPairs.has(pk) || seenPairs.has(pk)) return;
      if (f.date < start || f.date >= end) return;
      matches.push({
        key: `manual_${f.divIndex}_${f.lsid}`,
        mid: null,
        time: f.date,
        manual: true,
        tpid1: f.tpid1,
        tpid2: f.tpid2,
        name1: f.name1,
        name2: f.name2,
        legs1: f.legs1 ?? 0,
        legs2: f.legs2 ?? 0,
        avg1: null,
        avg2: null,
        url: null,
        lgKey: `${f.divIndex}_${f.lsid}`,
        lgDetail: {},
      });
    });
  }

  matches.sort((a, b) => a.time.getTime() - b.time.getTime());
  return { id: league.id, name: league.name, matches, error: archive === null && !tournament, tournament: tournament || null };
}

// ---------- Best leg i checkout z przebiegu legów ----------

interface PlayerLegStats {
  bestLeg: number | null; // najmniej lotek w wygranym legu
  checkout: number | null; // najwyższe zamknięcie
}

/**
 * Liczy best leg i najwyższe zamknięcie każdego gracza z legData meczu.
 * Nakka zapisuje rundy jako {score, left}; przy zamknięciu score jest ujemny i oznacza
 * numer lotki (-1/-2/-3). Nie wiemy na pewno, czy pierwszy wpis to stan startowy,
 * więc sprawdzamy oba warianty i bierzemy ten, w którym suma lotek zgadza się
 * z allDarts z Nakka. Gdy żaden się nie zgadza - nie zgadujemy (zwracamy null).
 */
export function analyzeMatchLegs(detail: any): Record<string, PlayerLegStats> | null {
  const stats = detail?.statsData;
  const legs = detail?.legData;
  if (!Array.isArray(stats) || stats.length < 2 || !Array.isArray(legs) || legs.length === 0) return null;

  for (const skipFirst of [false, true]) {
    const totals = [0, 0];
    const best: (number | null)[] = [null, null];
    const checkout: (number | null)[] = [null, null];
    let valid = true;

    for (const leg of legs) {
      for (const p of [0, 1]) {
        const raw = leg?.playerData?.[p];
        if (!Array.isArray(raw)) {
          valid = false;
          break;
        }
        let rounds = raw;
        if (skipFirst) {
          if (raw.length === 0 || Number(raw[0]?.score) !== 0) {
            valid = false;
            break;
          }
          rounds = raw.slice(1);
        }
        const fin = rounds.findIndex((r: any) => Number(r?.score) < 0);
        if (fin >= 0) {
          const darts = 3 * fin + Math.abs(Number(rounds[fin].score));
          totals[p] += darts;
          const prevLeft = fin > 0 ? Number(rounds[fin - 1]?.left) : skipFirst ? Number(raw[0]?.left) : NaN;
          if (Number(leg?.middleForDiddle) !== 1) {
            if (darts >= 9 && (best[p] === null || darts < (best[p] as number))) best[p] = darts;
          }
          if (prevLeft > 1 && prevLeft <= 170 && (checkout[p] === null || prevLeft > (checkout[p] as number))) {
            checkout[p] = prevLeft;
          }
        } else {
          totals[p] += 3 * rounds.length;
        }
      }
      if (!valid) break;
    }

    if (!valid) continue;
    const d0 = Number(stats[0]?.allDarts);
    const d1 = Number(stats[1]?.allDarts);
    // suma lotek musi się zgadzać dokładnie - inaczej nie pokazujemy wyliczeń
    if (totals[0] === d0 && totals[1] === d1) {
      const out: Record<string, PlayerLegStats> = {};
      [0, 1].forEach((p) => {
        const tpid = stats[p]?.tpid;
        if (tpid) out[tpid] = { bestLeg: best[p], checkout: checkout[p] };
      });
      return out;
    }
  }
  return null;
}

// ---------- Wyróżnienia tygodnia ----------

export interface Highlight {
  name: string;
  opponent: string;
  value: number;
}

export interface WeekHighlights {
  topAverage: Highlight | null;
  bestLeg: Highlight | null;
  topCheckout: Highlight | null;
}

export async function computeHighlights(matches: WeekMatch[]): Promise<WeekHighlights> {
  let topAverage: Highlight | null = null;
  let bestLeg: Highlight | null = null;
  let topCheckout: Highlight | null = null;

  const consider = (name: string, opponent: string, avg: number | null) => {
    if (avg != null && avg > 0 && (!topAverage || avg > topAverage.value)) topAverage = { name, opponent, value: avg };
  };

  const details = await Promise.all(
    matches.map((m) => (m.mid && !m.manual ? fetchMatchDetail(m.mid) : Promise.resolve(null)))
  );

  matches.forEach((m, i) => {
    consider(m.name1, m.name2, m.avg1);
    consider(m.name2, m.name1, m.avg2);

    const legStats = details[i] ? analyzeMatchLegs(details[i]) : null;
    const sides: [string, string, string][] = [
      [m.tpid1, m.name1, m.name2],
      [m.tpid2, m.name2, m.name1],
    ];
    sides.forEach(([tpid, name, opp]) => {
      // pierwszeństwo: wartości zapisane przez Nakka w lg_result, potem wyliczone z legów
      const lg = m.lgDetail[tpid] || {};
      const bl = Number(lg.b) > 0 ? Number(lg.b) : legStats?.[tpid]?.bestLeg ?? null;
      const co = Number(lg.h) > 0 ? Number(lg.h) : legStats?.[tpid]?.checkout ?? null;
      if (bl != null && (!bestLeg || bl < bestLeg.value)) bestLeg = { name, opponent: opp, value: bl };
      if (co != null && (!topCheckout || co > topCheckout.value)) topCheckout = { name, opponent: opp, value: co };
    });
  });

  return { topAverage, bestLeg, topCheckout };
}
