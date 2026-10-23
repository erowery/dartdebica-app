'use client';

export interface WhoAmI {
  leagueId: string;
  tpid: string;
  name: string;
}

const KEY = 'dartdebica_whoami_v1';

export function loadWhoAmI(): WhoAmI | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.leagueId || !parsed?.tpid) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWhoAmI(data: WhoAmI) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignorujemy - w najgorszym razie trzeba będzie wybrać siebie ponownie
  }
}

export function clearWhoAmI() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
