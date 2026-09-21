'use client';

export type TierId = 'adept' | 'specjalista' | 'mistrz';

export interface PyramidLevel {
  poziom: 1 | 2 | 3;
  challenges: string[];
}

export interface TierDef {
  id: TierId;
  title: string; // np. "Adept Darta"
  subtitle: string; // np. "poziom początkujący"
  color: string; // akcent koloru tego poziomu
  levels: PyramidLevel[];
}

export const PYRAMID_TIERS: TierDef[] = [
  {
    id: 'adept',
    title: 'Adept Darta',
    subtitle: 'Poziom początkujący',
    color: '#22c55e',
    levels: [
      {
        poziom: 1,
        challenges: [
          'Traf 5 razy w jeden z wybranych sektorów 20 lub 19',
          'Traf 3 razy w jeden z sektorów D16 lub D20',
          'Rzuć 3 razy w środek czerwony lub zielony',
          'Rzuć 10 razy w sektor 18',
          'Wykonaj checkout 70 w 3 lotkach',
        ],
      },
      {
        poziom: 2,
        challenges: [
          'Rzuć 3 razy w jedną z wybranych potrójnych 20 lub 19',
          'Wykonaj checkout 50 w 2 lotkach',
          'Traf 3 razy pod rząd w jedną z wybranych D20 lub D16',
        ],
      },
      {
        poziom: 3,
        challenges: ['Wykonaj checkout 100'],
      },
    ],
  },
  {
    id: 'specjalista',
    title: 'Darterski Specjalista',
    subtitle: 'Poziom średniozaawansowany',
    color: '#06b6d4',
    levels: [
      {
        poziom: 1,
        challenges: [
          'Traf 10 razy w jeden z wybranych sektorów 20 lub 19',
          'Traf 5 razy w D16',
          'Traf 5 razy w D20',
          'Rzuć 5 razy w środek czerwony lub zielony',
          'Traf 3 razy pod rząd w wybrany podwójny sektor',
        ],
      },
      {
        poziom: 2,
        challenges: [
          'Wykonaj checkout 70 w 3 lotkach',
          'Traf 10 razy w jeden z wybranych D16 lub D20',
          'Wykonaj checkout 121 w 3 lotkach',
        ],
      },
      {
        poziom: 3,
        challenges: ['Rzuć 180 pkt w 3 lotkach'],
      },
    ],
  },
  {
    id: 'mistrz',
    title: 'Darterski Mistrz',
    subtitle: 'Poziom zaawansowany',
    color: '#eab308',
    levels: [
      {
        poziom: 1,
        challenges: [
          'Traf 20 razy w sektor 20 pod rząd',
          'Traf 5 razy pod rząd w D16',
          'Traf 5 razy pod rząd w D20',
          'Traf 3 razy w 3 lotkach sekwencję doubli D20, D10, D5 lub D16, D8, D4',
          'Rzuć 5 razy minimum 140 pkt w 3 lotkach',
        ],
      },
      {
        poziom: 2,
        challenges: [
          'Wykonaj 3 razy checkout 100 w 3 lotkach',
          'Traf 6 razy pod rząd dowolny podwójny sektor',
          'Wykonaj 2 razy pod rząd w 3 lotkach checkout 116',
        ],
      },
      {
        poziom: 3,
        challenges: ['Wykonaj checkout 170'],
      },
    ],
  },
];

export const CHALLENGE_MINUTES = 10;

export function suggestTierId(average: number | null | undefined): TierId {
  if (!average || average <= 0) return 'adept';
  if (average < 55) return 'adept';
  if (average < 80) return 'specjalista';
  return 'mistrz';
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
