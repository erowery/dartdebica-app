'use client';

export type TierId = 'adept' | 'debiutant' | 'specjalista' | 'ekspert' | 'mistrz';

export interface PyramidLevel {
  poziom: 1 | 2 | 3;
  challenges: string[];
}

export interface TierDef {
  id: TierId;
  title: string;
  subtitle: string;
  minAvg: number;
  maxAvg: number;
  color: string;
  levels: PyramidLevel[];
}

export const PYRAMID_TIERS: TierDef[] = [
  {
    id: 'adept',
    title: 'Adept Darta',
    subtitle: 'Średnia: 35–45',
    minAvg: 35,
    maxAvg: 45,
    color: '#22c55e',
    levels: [
      {
        poziom: 1,
        challenges: [
          'Ostrzał S20/S19: Traf łącznie 20 razy w duży sektor 20 lub 19',
          'Praca na tarczy: Traf łącznie 15 razy w duży sektor 18',
          'Środek: Traf łącznie 4 razy w dowolny środek (zielony lub czerwony Bull)',
          'Rozgrzewka na podwójnych: Traf łącznie 3 razy w D20 lub D16 (dowolne podejścia)',
          'Niski checkout: Wykonaj checkout 20 (np. S10 + D5 lub D10) w max 3 lotkach',
        ],
      },
      {
        poziom: 2,
        challenges: [
          'Pojedyncza seria: Traf 3 razy w jednym podejściu (3 lotki) w sektor 20 lub 19 - powtórz to 2 razy w ciągu 10 minut',
          'Precyzja dubli: Traf 2 razy pod rząd w wybrany podwójny sektor (D20 lub D16)',
          'Średni checkout: Wykonaj checkout 32 lub 40 w max 3 lotkach',
        ],
      },
      {
        poziom: 3,
        challenges: [
          'Końcowy Test: Wykonaj checkout 50 (np. S10 + D20) w max 3 lotkach LUB rzuć minimum 60 punktów w jednym podejściu (3 lotki)',
        ],
      },
    ],
  },
  {
    id: 'debiutant',
    title: 'Debiutant Darta',
    subtitle: 'Średnia: 45–55',
    minAvg: 45,
    maxAvg: 55,
    color: '#84cc16',
    levels: [
      {
        poziom: 1,
        challenges: [
          'Główny sektor: Traf łącznie 30 razy w sektor 20 lub 19',
          'Dolne sektory: Traf łącznie 20 razy w sektor 18 lub 19',
          'Centrum: Traf łącznie 6 razy w dowolny środek (Bull / Red Bull)',
          'Trening dubli: Traf łącznie 5 razy w D20, D16 lub D8',
          'Prosty checkout: Wykonaj checkout 36-40 w max 3 lotkach - zrób to 2 razy w trakcie 10 minut',
        ],
      },
      {
        poziom: 2,
        challenges: [
          'Kompaktowe podejście: Rzuć 3 lotki w sektor 20 lub 19 w jednym podejściu - wykonaj to 3 razy w ciągu 10 minut',
          'Seria w double: Traf 2 razy pod rząd w ten sam podwójny sektor (np. 2x D20)',
          'Wyższy checkout: Wykonaj checkout 50-60 w max 3 lotkach',
        ],
      },
      {
        poziom: 3,
        challenges: [
          'Końcowy Test: Wykonaj checkout 70 (np. T10 + D20 lub S10 + T20 + D0 / S20 + S10 + D20) w max 3 lotkach',
        ],
      },
    ],
  },
  {
    id: 'specjalista',
    title: 'Specjalista Darta',
    subtitle: 'Średnia: 55–65',
    minAvg: 55,
    maxAvg: 65,
    color: '#06b6d4',
    levels: [
      {
        poziom: 1,
        challenges: [
          'Ostrzał S20: Traf łącznie 40 razy w sektor 20',
          'Główne duble: Traf łącznie 10 razy w D20 lub D16',
          'Presja środka: Traf łącznie 8 razy w dowolny środek (Bull / Red Bull)',
          'Średnie zamknięcia: Wykonaj 2 różne checkouty z zakresu 41-60',
          'Scoring: Rzuć 60+ punktów w jednym podejściu 4 razy w trakcie 10 minut',
        ],
      },
      {
        poziom: 2,
        challenges: [
          'Czysta seria w dubel: Traf 3 razy pod rząd w wybrany podwójny sektor (np. 3x D20 lub 3x D16)',
          'Wejście w potrójne: Traf 2 razy w potrójny sektor (T20 lub T19) w jednym podejściu (3 lotki)',
          'Trudniejszy checkout: Wykonaj checkout 71-85 w max 3 lotkach',
        ],
      },
      {
        poziom: 3,
        challenges: [
          'Końcowy Test: Wykonaj checkout 100 w max 3 lotkach LUB rzuć 100+ punktów w jednym podejściu ORAZ zrób checkout 80+ w tej samej 10-minutowej sesji',
        ],
      },
    ],
  },
  {
    id: 'ekspert',
    title: 'Ekspert Darta',
    subtitle: 'Średnia: 65–75',
    minAvg: 65,
    maxAvg: 75,
    color: '#3b82f6',
    levels: [
      {
        poziom: 1,
        challenges: [
          'Ostrzał tarczy: Traf łącznie 45 razy w sektor 20',
          'Równowaga dubli: Traf łącznie 8 razy w D20 ORAZ 8 razy w D16',
          'Środek: Traf łącznie 10 razy w środek (w tym minimum 3 razy w Red Bulla)',
          'Szybkie zamykanie: Wykonaj 3 różne checkouty z zakresu 61-80 w max 3 lotkach',
          'Mocny scoring: Rzuć 80+ punktów w jednym podejściu 5 razy w ciągu 10 minut',
        ],
      },
      {
        poziom: 2,
        challenges: [
          'Seryjny dubel: Traf 4 razy pod rząd w wybrany podwójny sektor (np. 4x D20 lub 4x D16)',
          'Atak na potrójne: Rzuć wynik 140+ punktów (lub 180) w jednym podejściu',
          'Wysoki checkout: Wykonaj checkout 86-105 w max 3 lotkach',
        ],
      },
      {
        poziom: 3,
        challenges: [
          'Końcowy Test: Wykonaj checkout 121 w max 3 lotkach LUB ustrzel 180 (3x T20) w trakcie trwania 10-minutowej sesji',
        ],
      },
    ],
  },
  {
    id: 'mistrz',
    title: 'Mistrz Darta',
    subtitle: 'Średnia: 75+',
    minAvg: 75,
    maxAvg: 999,
    color: '#eab308',
    levels: [
      {
        poziom: 1,
        challenges: [
          'Maksymalny ostrzał: Traf łącznie 50 razy w sektor 20',
          'Precyzyjne duble: Traf łącznie 10 razy w D20 ORAZ 10 razy w D16',
          'Potrójne w serii: Traf 3 razy pod rząd w potrójny sektor (Treble) w jednym podejściu (np. T20-T20-T20 lub mix T20/T19)',
          'Czyste centrum: Traf 3 razy pod rząd w środek (Bull/Red Bull) w jednym podejściu (3 lotki)',
          'Seryjne zamknięcia: Wykonaj 3 checkouty powyżej 80 pkt w max 3 lotkach',
        ],
      },
      {
        poziom: 2,
        challenges: [
          'Żelazny dubel: Traf 5 razy pod rząd w ten sam podwójny sektor (np. D20-D20-D20-D20-D20)',
          'Ciężki scoring: Rzuć dwukrotnie wynik 140+ (lub jeden raz 180) w ciągu jednej 10-minutowej sesji',
          'Trudne zamknięcie: Wykonaj checkout 116-130 w max 3 lotkach',
        ],
      },
      {
        poziom: 3,
        challenges: [
          'Końcowy Test: Ustrzel 180 (3x T20) ORAZ wykonaj checkout 100+ w tej samej 10-minutowej sesji (LUB wykonaj pojedynczy checkout 131+ / klasyczny Big Fish 170)',
        ],
      },
    ],
  },
];

export const CHALLENGE_MINUTES = 10;

export function suggestTierId(average: number | null | undefined): TierId {
  if (!average || average <= 0) return 'adept';
  const found = PYRAMID_TIERS.find((t) => average >= t.minAvg && average < t.maxAvg);
  return found?.id ?? 'mistrz';
}

export interface PyramidProgress {
  poziom: 1 | 2 | 3;
  index: number; // index wyzwania w obrębie bieżącego poziomu
  completed: boolean;
  completedAt?: string;
}

const DEFAULT_PROGRESS: PyramidProgress = { poziom: 1, index: 0, completed: false };

function progressKey(tpid: string, tierId: TierId) {
  return `dartdebica_pyramid_${tpid}_${tierId}`;
}

export function loadProgress(tpid: string, tierId: TierId): PyramidProgress {
  if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS };
  try {
    const raw = window.localStorage.getItem(progressKey(tpid, tierId));
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(tpid: string, tierId: TierId, progress: PyramidProgress) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(progressKey(tpid, tierId), JSON.stringify(progress));
  } catch {
    // brak miejsca w pamięci telefonu lub inny błąd - nie blokujemy działania apki
  }
}

export interface PyramidLogEntry {
  date: string; // RRRR-MM-DD
  tierId: TierId;
  tierTitle: string;
  poziom: 1 | 2 | 3;
  challenge: string;
}

function logKey(tpid: string) {
  return `dartdebica_pyramid_log_${tpid}`;
}

export function loadPyramidLog(tpid: string): PyramidLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(logKey(tpid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendPyramidLog(tpid: string, entry: PyramidLogEntry) {
  if (typeof window === 'undefined') return;
  try {
    const log = loadPyramidLog(tpid);
    log.push(entry);
    window.localStorage.setItem(logKey(tpid), JSON.stringify(log));
  } catch {
    // ignore
  }
}
