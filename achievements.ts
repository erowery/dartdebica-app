import { MatchResultRow, PlayerStatRow } from '@/lib/standings';
import { thursdayOf } from '@/lib/weekly';

export type Tier = 'bronze' | 'silver' | 'gold';

export interface Achievement {
  id: string;
  symbol: string; // krótki znak na odznace (bez emotek)
  title: string;
  description: string;
  tier: Tier;
  unlocked: boolean;
  /** postęp do zdobycia, np. 3 / 5 (gdy ma sens) */
  progress?: { value: number; target: number };
}

/**
 * Osiągnięcia liczone na bieżąco z wyników ligi i statystyk sezonu z Nakka.
 * Nic nie jest zapisywane - przy każdym otwarciu aplikacji liczą się od nowa.
 */
export function computeAchievements(
  myTpid: string,
  results: MatchResultRow[],
  stats: PlayerStatRow | null,
  matchDates: Date[] = []
): Achievement[] {
  const mine = results.filter((r) => r.tpid1 === myTpid || r.tpid2 === myTpid);
  const legs = (r: MatchResultRow) =>
    r.tpid1 === myTpid ? { me: r.legs1, opp: r.legs2, avg: r.avg1 } : { me: r.legs2, opp: r.legs1, avg: r.avg2 };

  const matches = mine.length;
  const wins = mine.filter((r) => legs(r).me > legs(r).opp).length;
  const cleanWin = mine.some((r) => legs(r).me > 0 && legs(r).opp === 0);
  const bestMatchAvg = Math.max(0, ...mine.map((r) => legs(r).avg || 0));

  let streak = 0;
  let bestStreak = 0;
  mine.forEach((r) => {
    const l = legs(r);
    streak = l.me > l.opp ? streak + 1 : 0;
    bestStreak = Math.max(bestStreak, streak);
  });

  // Seria meczów "bez tygodnia przerwy": kolejne mecze w tym samym albo następnym tygodniu ligowym (czw–śr)
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const weeks = matchDates
    .map((d) => Math.round(thursdayOf(d).getTime() / WEEK))
    .sort((x, y) => x - y);
  let chain = 0;
  let bestChain = 0;
  weeks.forEach((w, i) => {
    chain = i > 0 && w - weeks[i - 1] <= 1 ? chain + 1 : 1;
    bestChain = Math.max(bestChain, chain);
  });

  const t180 = stats?.t180 ?? 0;
  const highOut = stats?.highOut ?? 0;
  const bestLeg = stats?.bestLeg ?? 0;
  const ton100Finishes = stats?.finishes100 ?? 0;

  const p = (value: number, target: number) => ({ value: Math.min(value, target), target });
  const list: Achievement[] = [
    { id: 'debut', symbol: '1', title: 'Debiut', description: 'Rozegraj pierwszy mecz ligowy', tier: 'bronze', unlocked: matches >= 1 },
    { id: 'first-win', symbol: 'W', title: 'Pierwsza wygrana', description: 'Wygraj mecz ligowy', tier: 'bronze', unlocked: wins >= 1 },
    {
      id: 'clean',
      symbol: '0',
      title: 'Czyste konto',
      description: 'Wygraj mecz bez straty lega',
      tier: 'silver',
      unlocked: cleanWin,
    },
    {
      id: 'streak3',
      symbol: '3×',
      title: 'Seria',
      description: 'Wygraj 3 mecze z rzędu',
      tier: 'gold',
      unlocked: bestStreak >= 3,
      progress: p(bestStreak, 3),
    },
    {
      id: 'avg50',
      symbol: '50',
      title: 'Średnia 50+',
      description: 'Rzuć średnią 50 lub więcej w jednym meczu',
      tier: 'bronze',
      unlocked: bestMatchAvg >= 50,
    },
    {
      id: 'avg60',
      symbol: '60',
      title: 'Średnia 60+',
      description: 'Rzuć średnią 60 lub więcej w jednym meczu',
      tier: 'silver',
      unlocked: bestMatchAvg >= 60,
    },
    {
      id: 'avg70',
      symbol: '70',
      title: 'Średnia 70+',
      description: 'Rzuć średnią 70 lub więcej w jednym meczu',
      tier: 'gold',
      unlocked: bestMatchAvg >= 70,
    },
    { id: 'first180', symbol: '180', title: 'Maksy', description: 'Rzuć pierwsze 180', tier: 'silver', unlocked: t180 >= 1 },
    {
      id: 'collector180',
      symbol: '5×',
      title: 'Kolekcjoner 180',
      description: 'Rzuć 5 razy 180 w sezonie',
      tier: 'gold',
      unlocked: t180 >= 5,
      progress: p(t180, 5),
    },
    {
      id: 'ton-out',
      symbol: '100+',
      title: 'Wysoki finisz',
      description: 'Zamknij lega checkoutem 100 lub więcej',
      tier: 'silver',
      unlocked: highOut >= 100,
    },
    {
      id: 'ton-out3',
      symbol: '3×',
      title: 'Snajper',
      description: 'Zamknij 3 legi checkoutem 100+ w sezonie',
      tier: 'gold',
      unlocked: ton100Finishes >= 3,
      progress: p(ton100Finishes, 3),
    },
    { id: 'bigfish', symbol: '170', title: 'Big Fish', description: 'Zamknij lega checkoutem 170', tier: 'gold', unlocked: highOut === 170 },
    {
      id: 'leg18',
      symbol: '18',
      title: 'Szybki leg',
      description: 'Wygraj lega w 18 lotkach lub mniej',
      tier: 'bronze',
      unlocked: bestLeg > 0 && bestLeg <= 18,
    },
    {
      id: 'leg15',
      symbol: '15',
      title: 'Błyskawica',
      description: 'Wygraj lega w 15 lotkach lub mniej',
      tier: 'gold',
      unlocked: bestLeg > 0 && bestLeg <= 15,
    },
    {
      id: 'marathon',
      symbol: '10',
      title: 'Maratończyk',
      description: 'Rozegraj 10 meczów z rzędu bez tygodnia przerwy',
      tier: 'silver',
      unlocked: bestChain >= 10,
      progress: p(bestChain, 10),
    },
  ];
  return list;
}

// ---------- "Nowe osiągnięcie" - pamiętane tylko w tej przeglądarce ----------

const seenKey = (tpid: string) => `dartdebica_badges_seen_${tpid}`;

/** Zwraca osiągnięcia zdobyte od ostatniej wizyty. Przy pierwszej wizycie tylko zapamiętuje stan (bez gratulacji). */
export function getNewAchievements(tpid: string, list: Achievement[]): Achievement[] {
  const unlocked = list.filter((a) => a.unlocked);
  try {
    const raw = localStorage.getItem(seenKey(tpid));
    if (raw === null) {
      localStorage.setItem(seenKey(tpid), JSON.stringify(unlocked.map((a) => a.id)));
      return [];
    }
    const seen: string[] = JSON.parse(raw);
    return unlocked.filter((a) => !seen.includes(a.id));
  } catch {
    return [];
  }
}

export function markAchievementsSeen(tpid: string, list: Achievement[]) {
  try {
    localStorage.setItem(seenKey(tpid), JSON.stringify(list.filter((a) => a.unlocked).map((a) => a.id)));
  } catch {
    // brak pamięci przeglądarki - gratulacje pokażą się ponownie, nic złego
  }
}
