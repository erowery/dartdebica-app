'use client';

import { useState, useMemo } from 'react';
import { LeagueStandingsResult, PlayerStatRow } from '@/lib/standings';
import { IconTrophy, IconClipboardCheck, IconUsers, IconVs, IconClock } from '@/components/icons';
import WeekView from '@/components/WeekView';
import H2HCompare from '@/components/H2HCompare';
import HistoryView from '@/components/HistoryView';
import { ARCHIVE_SEASONS, LeagueConfig } from '@/config/leagues';
import RingProgress from '@/components/RingProgress';
import MilestoneBarChart from '@/components/MilestoneBarChart';

export interface GlobalPlayer extends PlayerStatRow {
  leagueName: string;
}

function normalize(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function playerKey(p: GlobalPlayer) {
  return `${p.leagueName}::${p.tpid}`;
}

/** Pasek proporcjonalny - cała szerokość to 100%, kolor dzielony wg udziału wartości a/b */
// pasek stref jak w panelu: 1 awans, 2-3 baraż, przedostatnie dwa baraż, ostatni spadek
function zoneColor(idx: number, n: number): string {
  if (idx === 0) return '#2dd6a7';
  if (idx === n - 1) return '#f87171';
  if (idx <= 2 || idx >= n - 3) return '#f2b134';
  return '#64748b';
}

export default function LigaView({
  leagueName,
  standingsResult,
  statsRows,
  allPlayers,
  myTpid,
  leagueUrl,
  league,
  initialSubTab = 'table',
}: {
  league: LeagueConfig;
  initialSubTab?: 'table' | 'results' | 'players' | 'week' | 'history';
  leagueName: string;
  standingsResult: LeagueStandingsResult | null;
  statsRows: PlayerStatRow[];
  allPlayers: GlobalPlayer[];
  myTpid: string;
  leagueUrl?: string;
}) {
  const [subTab, setSubTab] = useState<'table' | 'results' | 'players' | 'week' | 'history'>(initialSubTab);
  const [query, setQuery] = useState('');
  const [selectedTpid, setSelectedTpid] = useState<string | null>(null);
  const [h2hA, setH2hA] = useState<string>('');
  const [h2hB, setH2hB] = useState<string>('');

  const myLeaguePlayers: GlobalPlayer[] = useMemo(
    () => statsRows.map((p) => ({ ...p, leagueName })),
    [statsRows, leagueName]
  );

  const sortedByAverage = useMemo(
    () => [...myLeaguePlayers].sort((a, b) => (b.average ?? -1) - (a.average ?? -1)),
    [myLeaguePlayers]
  );

  const filteredPlayers = sortedByAverage.filter((p) => normalize(p.name).includes(normalize(query)));

  const selectedPlayer = myLeaguePlayers.find((p) => p.tpid === selectedTpid) || null;
  const h2hPlayerA = allPlayers.find((p) => playerKey(p) === h2hA) || null;
  const h2hPlayerB = allPlayers.find((p) => playerKey(p) === h2hB) || null;

  // Grupowanie graczy do porównania wg ligi (żeby można było wybrać kogoś z dowolnej ligi)
  const playersByLeague = useMemo(() => {
    const groups: Record<string, GlobalPlayer[]> = {};
    allPlayers.forEach((p) => {
      if (!groups[p.leagueName]) groups[p.leagueName] = [];
      groups[p.leagueName].push(p);
    });
    Object.values(groups).forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));
    return groups;
  }, [allPlayers]);

  const results = standingsResult?.results || [];
  const visibleResults = results.slice(-5).reverse();

  return (
    <div>
      <div className="flex gap-1 mb-5 p-1 rounded-2xl bg-ink-800/60 border border-ink-700 text-xs sm:text-sm">
        {[
          { id: 'table', label: 'Tabela', Icon: IconTrophy },
          { id: 'results', label: 'Wyniki', Icon: IconClipboardCheck },
          { id: 'players', label: 'Zawodnicy', Icon: IconUsers },
          { id: 'week', label: 'Tydzień', Icon: IconClock },
          // zakładka Historia pojawia się dopiero, gdy w archiwum jest choć jeden sezon
          ...(ARCHIVE_SEASONS.length > 0 ? [{ id: 'history', label: 'Historia', Icon: IconTrophy }] : []),
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as any)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl font-semibold transition-all ${
              subTab === t.id ? 'bg-gradient-to-b from-brand to-brand-dark text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.Icon className="w-4 h-4 shrink-0 hidden min-[400px]:block" />
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'week' && <WeekView league={league} myTpid={myTpid} />}
      {subTab === 'history' && <HistoryView />}

      {subTab === 'table' && (
        <div>
          <h2 className="text-lg font-bold mb-4">{leagueName}</h2>
          {!standingsResult && <p className="text-slate-400 text-sm">Brak danych tabeli dla tej ligi.</p>}
          {standingsResult?.divisions.map((rows, divIndex) => (
            <div key={divIndex} className="mb-6 overflow-x-auto rounded-2xl border border-ink-700/60">
              <table className="w-full text-left text-[14px] text-slate-300 tabular-nums">
                <thead className="bg-ink-800/80 text-slate-400 uppercase text-[10px] sm:text-[11px] tracking-wide">
                  <tr>
                    <th className="py-2.5 pl-3 pr-1 text-center">#</th>
                    <th className="py-2.5 px-1.5">Zawodnik</th>
                    <th className="py-2.5 px-1 text-center">M</th>
                    <th className="py-2.5 px-1 text-center">W</th>
                    <th className="py-2.5 px-1 text-center">R</th>
                    <th className="py-2.5 px-1 text-center">P</th>
                    <th className="py-2.5 px-1 text-center">Legi</th>
                    <th className="py-2.5 pl-1 pr-3 text-center">Pkt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-700/60">
                  {rows.map((row, idx) => (
                    <tr
                      key={row.tpid}
                      className={`hover:bg-ink-800/40 transition-colors ${row.tpid === myTpid ? 'bg-brand/10' : ''}`}
                    >
                      <td
                        className="py-2.5 pl-3 pr-1 text-center font-bold text-slate-200"
                        style={{ boxShadow: `inset 4px 0 0 ${zoneColor(idx, rows.length)}` }}
                      >
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-1.5 font-semibold text-white leading-tight">{row.name}</td>
                      <td className="py-2.5 px-1 text-center">{row.played}</td>
                      <td className="py-2.5 px-1 text-center text-emerald-400">{row.won}</td>
                      <td className="py-2.5 px-1 text-center text-slate-400">{row.drawn}</td>
                      <td className="py-2.5 px-1 text-center text-red-400">{row.lost}</td>
                      <td className="py-2.5 px-1 text-center text-slate-400 whitespace-nowrap">
                        {row.legsFor}:{row.legsAgainst}
                      </td>
                      <td className="py-2.5 pl-1 pr-3 text-center font-extrabold text-brand">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {subTab === 'results' && (
        <div>
          <h2 className="text-lg font-bold mb-4">Ostatnie wyniki ligowe</h2>
          {results.length === 0 && <p className="text-slate-400 text-sm">Brak rozegranych meczów.</p>}
          <div className="space-y-2">
            {visibleResults.map((m, idx) => {
              const Row: any = m.hasDetail ? 'a' : 'div';
              const linkProps = m.hasDetail ? { href: m.nakkaMatchUrl, target: '_blank', rel: 'noreferrer' } : {};
              return (
                <Row
                  key={idx}
                  {...linkProps}
                  className={`flex items-center justify-between text-sm border rounded-xl px-4 py-2.5 transition-colors ${
                    m.tpid1 === myTpid || m.tpid2 === myTpid
                      ? 'bg-brand/10 border-brand/30'
                      : 'bg-ink-800/50 border-ink-700/60 hover:border-brand/30'
                  }`}
                >
                  <span className="flex flex-col min-w-0">
                    <span className="text-slate-200 font-medium truncate">{m.name1}</span>
                    {m.avg1 > 0 && <span className="text-[11px] text-gold">śr. {m.avg1}</span>}
                  </span>
                  <span className="font-bold text-white px-3 whitespace-nowrap bg-ink-700/60 rounded-lg py-0.5 mx-2 shrink-0">
                    {m.legs1} - {m.legs2}
                  </span>
                  <span className="flex flex-col min-w-0 items-end text-right">
                    <span className="text-slate-200 font-medium truncate">{m.name2}</span>
                    {m.avg2 > 0 && <span className="text-[11px] text-gold">śr. {m.avg2}</span>}
                  </span>
                </Row>
              );
            })}
          </div>

          {leagueUrl && (
            <a
              href={leagueUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2.5 bg-gradient-to-b from-brand to-brand-dark hover:brightness-110 text-white rounded-xl text-xs font-semibold shadow-glow transition-all"
            >
              Zobacz więcej wyników w Nakka ↗
            </a>
          )}
        </div>
      )}

      {subTab === 'players' && (
        <div>
          {/* Dedykowana, widoczna od razu porównywarka H2H */}
          <div className="p-4 bg-gradient-to-b from-brand/15 to-transparent border border-brand/30 rounded-2xl mb-6">
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
              <IconVs className="w-4 h-4 text-gold" /> Porównywarka graczy (H2H)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={h2hA}
                onChange={(e) => setH2hA(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-900/70 border border-gold/40 text-white text-sm focus:outline-none focus:border-gold"
              >
                <option value="">Gracz A — wybierz...</option>
                {(Object.entries(playersByLeague) as [string, GlobalPlayer[]][]).map(([lg, players]) => (
                  <optgroup key={lg} label={lg}>
                    {players
                      .filter((p) => playerKey(p) !== h2hB)
                      .map((p) => (
                        <option key={playerKey(p)} value={playerKey(p)}>
                          {p.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <select
                value={h2hB}
                onChange={(e) => setH2hB(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-900/70 border border-brand/40 text-white text-sm focus:outline-none focus:border-brand"
              >
                <option value="">Gracz B — wybierz...</option>
                {(Object.entries(playersByLeague) as [string, GlobalPlayer[]][]).map(([lg, players]) => (
                  <optgroup key={lg} label={lg}>
                    {players
                      .filter((p) => playerKey(p) !== h2hA)
                      .map((p) => (
                        <option key={playerKey(p)} value={playerKey(p)}>
                          {p.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {h2hPlayerA && h2hPlayerB && (
              <H2HCompare a={h2hPlayerA} b={h2hPlayerB} allPlayers={allPlayers} results={results} />
            )}
          </div>

          <h2 className="text-lg font-bold mb-1">Zawodnicy - {leagueName}</h2>
          <p className="text-xs text-slate-400 mb-3">Lista i wyszukiwarka dotyczą tylko tej ligi. Do porównania z inną ligą użyj porównywarki H2H powyżej.</p>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Szukaj zawodnika w ${leagueName}...`}
            className="w-full mb-3 px-4 py-2.5 rounded-xl bg-ink-800/60 border border-ink-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-brand/50 text-sm"
          />

          <div className="overflow-x-auto rounded-2xl border border-ink-700/60 mb-4">
            <table className="w-full min-w-[720px] text-left text-sm text-slate-300">
              <thead className="bg-ink-800/80 text-slate-400 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-3">Gracz</th>
                  <th className="p-3 text-center">Średnia</th>
                  <th className="p-3 text-center">100+</th>
                  <th className="p-3 text-center">140+</th>
                  <th className="p-3 text-center">170+</th>
                  <th className="p-3 text-center">180</th>
                  <th className="p-3 text-center">100+ kończ.</th>
                  <th className="p-3 text-center">High out</th>
                  <th className="p-3 text-center">Best leg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700/60">
                {filteredPlayers.map((p) => (
                  <tr
                    key={p.tpid}
                    onClick={() => setSelectedTpid(p.tpid === selectedTpid ? null : p.tpid)}
                    className={`cursor-pointer hover:bg-ink-800/40 transition-colors ${
                      p.tpid === selectedTpid ? 'bg-brand/10' : ''
                    } ${p.tpid === myTpid ? 'font-semibold' : ''}`}
                  >
                    <td className="p-3 font-semibold text-white">
                      {p.name}
                    </td>
                    <td className="p-3 text-center text-gold font-bold">
                      {p.average !== null ? p.average.toFixed(2) : '-'}
                    </td>
                    <td className="p-3 text-center">{p.t100}</td>
                    <td className="p-3 text-center">{p.t140}</td>
                    <td className="p-3 text-center">{p.t170}</td>
                    <td className="p-3 text-center">{p.t180}</td>
                    <td className="p-3 text-center">{p.finishes100}</td>
                    <td className="p-3 text-center">{p.highOut ?? '-'}</td>
                    <td className="p-3 text-center">{p.bestLeg ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPlayers.length === 0 && (
            <p className="text-slate-400 text-sm mb-4">Brak wyników dla &quot;{query}&quot;</p>
          )}

          {selectedPlayer && (
            <div className="p-4 bg-ink-800/60 border border-ink-700/60 rounded-2xl animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">{selectedPlayer.name}</h3>
                <button onClick={() => setSelectedTpid(null)} className="text-slate-400 hover:text-slate-300 text-sm">
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-5 mb-5">
                <RingProgress
                  percent={Math.min(selectedPlayer.average ?? 0, 100)}
                  centerValue={selectedPlayer.average?.toFixed(1) ?? '-'}
                  centerLabel="Średnia"
                  size={96}
                  strokeWidth={8}
                />
                <div className="grid grid-cols-2 gap-2 flex-1 text-center">
                  <MiniBadge label="High out" value={selectedPlayer.highOut ?? '-'} />
                  <MiniBadge label="Best leg" value={selectedPlayer.bestLeg ?? '-'} />
                </div>
              </div>

              <MilestoneBarChart
                milestones={[
                  { label: '100+', value: selectedPlayer.t100, color: '#94a3b8' },
                  { label: '140+', value: selectedPlayer.t140, color: '#2dd6a7' },
                  { label: '170+', value: selectedPlayer.t170, color: '#f2b134' },
                  { label: '180', value: selectedPlayer.t180, color: '#f87171' },
                  { label: '100+ kończ.', value: selectedPlayer.finishes100, color: '#5eead4' },
                ]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-ink-900/60 border border-ink-700/60 rounded-xl py-2.5 px-2">
      <div className="text-base font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}
