const NAKKA_BASE_URL = 'https://push.n01darts.com/api/v1';

async function fetchWithTimeout(url: string, ms = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);

  // Doklejamy znacznik czasu, żeby uniknąć cache'owania odpowiedzi (dane "na żywo")
  const separator = url.includes('?') ? '&' : '?';
  const freshUrl = `${url}${separator}_t=${Date.now()}`;

  try {
    const response = await fetch(freshUrl, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch {
    clearTimeout(id);
    return null;
  }
}

/**
 * Pełne dane turnieju/ligi: ustawienia, tabela grup (lg_table),
 * wyniki rozegranych meczów (lg_result) i lista zawodników (entry_list).
 * Zwraca cały obiekt odpowiedzi ({ result, tournament, url }) albo null przy błędzie.
 */
export async function fetchLeagueData(tdid: string) {
  try {
    const res = await fetchWithTimeout(`${NAKKA_BASE_URL}/tournament/get?tdid=${tdid}`);
    if (!res || !res.ok) return null;
    const data = await res.json();
    if (!data || data.result !== 0) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Mecze aktualnie rozgrywane (jeszcze nie w archiwum).
 * match/list domyślnie zwraca już statsData, więc NIE robimy dodatkowego
 * zapytania match/get dla każdego meczu (to spowalniało apkę i było zbędne).
 */
export async function fetchLiveMatches(tdid: string) {
  try {
    const res = await fetchWithTimeout(`${NAKKA_BASE_URL}/match/list?tdid=${tdid}&live=1`, 6000);
    if (!res || !res.ok) return [];
    const data = await res.json();
    if (!data || data.result !== 0) return [];
    return data.list || [];
  } catch {
    return [];
  }
}

/**
 * Statystyki graczy danej ligi/turnieju.
 * Odpowiedź ma kształt { result, kind, stats: { [tpid]: {...} } }.
 * Zwracamy sam obiekt "stats" (klucz = tpid), albo null przy błędzie.
 */
export async function fetchLeagueStats(tdid: string): Promise<Record<string, any> | null> {
  try {
    const res = await fetchWithTimeout(`${NAKKA_BASE_URL}/tournament/stats?tdid=${tdid}&kind=stats_list`);
    if (!res || !res.ok) return null;
    const data = await res.json();
    if (!data || data.result !== 0) return null;
    return data.stats || null;
  } catch {
    return null;
  }
}

/**
 * Plan gier (pary, które mają jeszcze zagrać w danej lidze) - używany do
 * wyliczenia, które mecze gracz ma jeszcze przed sobą ("do rozegrania").
 * Zwraca tablicę grup, każda z listą kart {p:[tpid,tpid], lsid}, albo null.
 */
export async function fetchLeagueSchedule(tdid: string): Promise<any[] | null> {
  try {
    const res = await fetchWithTimeout(`${NAKKA_BASE_URL}/league/schedule/get?tdid=${tdid}`);
    if (!res || !res.ok) return null;
    const data = await res.json();
    if (!data || data.result !== 0) return null;
    return data.schedule || null;
  } catch {
    return null;
  }
}

/**
 * Mecze z archiwum Nakka rozpoczęte w podanym przedziale czasu
 * (fromSec włącznie, toSec wyłącznie; czas UNIX w sekundach).
 * Archiwum trzyma każdy mecz rozgrywany na żywo w Nakka - mecze wpisane ręcznie
 * przez organizatora się tu nie pojawiają.
 */
export async function fetchMatchesInRange(tdid: string, fromSec: number, toSec: number): Promise<any[] | null> {
  const all: any[] = [];
  try {
    for (let skip = 0; skip < 500; skip += 100) {
      const res = await fetchWithTimeout(
        `${NAKKA_BASE_URL}/match/list?tdid=${tdid}&startTime__gte=${fromSec}&startTime__lt=${toSec}&count=100&skip=${skip}`,
        8000
      );
      if (!res || !res.ok) return skip === 0 ? null : all;
      const data = await res.json();
      if (!data || data.result !== 0) return skip === 0 ? null : all;
      const list = data.list || [];
      all.push(...list);
      if (list.length < 100) break;
    }
    return all;
  } catch {
    return all.length ? all : null;
  }
}

/**
 * Szczegóły jednego meczu (m.in. legData z przebiegiem każdego lega).
 * Zakończony mecz już się nie zmienia, więc trzymamy go w pamięci sesji przeglądarki.
 */
export async function fetchMatchDetail(mid: string): Promise<any | null> {
  const cacheKey = `dartdebica_match_${mid}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}
  try {
    const res = await fetchWithTimeout(`${NAKKA_BASE_URL}/match/get?mid=${encodeURIComponent(mid)}`, 8000);
    if (!res || !res.ok) return null;
    const data = await res.json();
    if (!data || data.result !== 0) return null;
    const match = data.match || data;
    try {
      if (Number(match?.endMatch) === 1) sessionStorage.setItem(cacheKey, JSON.stringify(match));
    } catch {}
    return match;
  } catch {
    return null;
  }
}
