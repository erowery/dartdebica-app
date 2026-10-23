export interface LeagueConfig {
  id: string;
  name: string;
  shortName: string;
  nakkaId: string;
}

export const LEAGUES_CONFIG: LeagueConfig[] = [
  { id: 'lsdd1', name: 'I Liga LSDD', shortName: 'I Liga', nakkaId: 't_iKfq_6965' },
  { id: 'lsdd2', name: 'II Liga LSDD', shortName: 'II Liga', nakkaId: 't_pjgk_4087' },
  { id: 'lsdd3', name: 'III Liga LSDD', shortName: 'III Liga', nakkaId: 't_Hlu8_7788' },
  { id: 'lsdd4', name: 'IV Liga LSDD', shortName: 'IV Liga', nakkaId: 't_YOvw_3453' },
];

// ---------- Archiwum zakończonych sezonów (zakładka Liga → Historia) ----------
// Po zakończeniu sezonu dopisz go tutaj (najnowszy na górze). Dane i tak zostają w Nakka,
// aplikacja pobierze z nich końcowe tabele i mistrzów. Instrukcja: INSTRUKCJA-LIGI.md.
export interface ArchiveSeason {
  season: string; // np. '2025/2026'
  leagues: { name: string; nakkaId: string }[];
}

export const ARCHIVE_SEASONS: ArchiveSeason[] = [
  // {
  //   season: '2025/2026',
  //   leagues: [
  //     { name: 'I Liga LSDD', nakkaId: 't_XXXX_1111' },
  //     { name: 'II Liga LSDD', nakkaId: 't_XXXX_2222' },
  //   ],
  // },
];
