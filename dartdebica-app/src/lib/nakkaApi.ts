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
