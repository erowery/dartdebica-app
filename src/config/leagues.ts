export interface LeagueConfig {
  id: string;
  name: string;
  shortName: string;
  nakkaId: string;
}

export const LEAGUES_CONFIG: LeagueConfig[] = [
  { id: 'lsdd1', name: 'I Liga LSDD', shortName: 'I Liga', nakkaId: 't_vqad_6773' },
  { id: 'lsdd2', name: 'II Liga LSDD', shortName: 'II Liga', nakkaId: 't_RmkP_8273' },
  { id: 'lsdd3', name: 'III Liga LSDD', shortName: 'III Liga', nakkaId: 't_hlYd_1847' },
  { id: 'lsdd4', name: 'IV Liga LSDD', shortName: 'IV Liga', nakkaId: 't_lmUL_2298' },
];
