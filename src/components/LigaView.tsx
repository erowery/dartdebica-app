'use client';

import { useState, useMemo } from 'react';
import { LeagueStandingsResult, PlayerStatRow } from '@/lib/standings';
import { IconTrophy, IconClipboardCheck, IconUsers, IconVs } from '@/components/icons';

export interface GlobalPlayer extends PlayerStatRow {
  leagueName: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];
function rankBadge(idx: number) {
  return MEDALS[idx] || `${idx + 1}`;
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
function ComparisonRow({ label, a, b, suffix = '' }: { label: string; a: number | null; b: number | null; suffix?: string }) {
  const av = a ?? 0;
  const bv = b ?? 0;
  const total = av + bv;
  const pctA = total > 0 ? (av / total) * 100 : 50;
  const pctB = 100 - pctA;

  return (
    <div className="mb-3">
      <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 text-center">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-14 text-right text-sm font-bold text-gold">
          {a !== null ? a : '-'}
          {suffix}
        </span>
        <div className="flex-1 h-2.5 rounded-full overflow-hidden flex bg-ink-900/60">
          <div className="h-full bg-gold" style={{ width: `${pctA}%` }} />
          <div className="h-full bg-brand" style={{ width: `${pctB}%` }} />
        </div>
        <span className="w-14 text-left text-sm font-bold text-brand-light">
          {b !== null ? b : '-'}
          {suffix}
        </span>
      </div>
    </div>
  );
}

export default function LigaView({
  leagueName,
  standingsResult,
  statsRows,
  allPlayers,
  myTpid,
  leagueUrl,
}: {
  leagueName: string;
  standingsResult: LeagueStandingsResult | null;
  statsRows: PlayerStatRow[];
  allPlayers: GlobalPlayer[];
  myTpid: string;
  leagueUrl?: string;
}) {
  const [subTab, setSubTab] = useState<'table' | 'results' | 'players'>('table');
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
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-semibold transition-all ${
              subTab === t.id ? 'bg-gradient-to-b from-brand to-brand-dark text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.Icon className="w-4 h-4 shrink-0" />
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'table' && (
        <div>
          <h2 className="text-lg font-bold mb-4">{leagueName}</h2>
          {!standingsResult && <p className="text-slate-400 text-sm">Brak danych tabeli dla tej ligi.</p>}
          {standingsResult?.divisions.map((rows, divIndex) => (
            <div key={divIndex} className="mb-6 overflow-x-auto rounded-2xl border border-ink-700/60">
              <table className="w-full min-w-[520px] text-left text-sm text-slate-300">
                <thead className="bg-ink-800/80 text-slate-500 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Zawodnik</th>
                    <th className="p-3 text-center">M</th>
                    <th className="p-3 text-center">W</th>
                    <th className="p-3 text-center">R</th>
                    <th className="p-3 text-center">P</th>
                    <th className="p-3 text-center">Legi</th>
                    <th className="p-3 text-center">Pkt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-700/60">
                  {rows.map((row, idx) => (
                    <tr
                      key={row.tpid}
                      className={`hover:bg-ink-800/40 transition-colors ${row.tpid === myTpid ? 'bg-brand/10' : ''}`}
                    >
                      <td className="p-3 text-slate-500 font-medium">{rankBadge(idx)}</td>
                      <td className="p-3 font-semibold text-white">
                        {row.name}
                        {row.tpid === myTpid && <span className="ml-1.5 text-[10px] text-brand-light">(Ty)</span>}
                      </td>
                      <td className="p-3 text-center">{row.played}</td>
                      <td className="p-3 text-center text-emerald-400">{row.won}</td>
                      <td className="p-3 text-center text-slate-400">{row.drawn}</td>
                      <td className="p-3 text-center text-red-400">{row.lost}</td>
                      <td className="p-3 text-center text-slate-400">
                        {row.legsFor}:{row.legsAgainst}
                      </td>
                      <td className="p-3 text-center font-bold text-white">{row.points}</td>
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
            {visibleResults.map((m, idx) => (
              <a
                key={idx}
                href={m.nakkaMatchUrl}
                target="_blank"
                rel="noreferrer"
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
              </a>
            ))}
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
              <div className="mt-5 animate-fadeIn">
                <div className="flex items-center justify-between mb-4 text-sm font-bold">
                  <span className="text-gold">{h2hPlayerA.name}</span>
                  <span className="text-slate-500">vs</span>
                  <span className="text-brand-light">{h2hPlayerB.name}</span>
                </div>

                <ComparisonRow label="Średnia" a={h2hPlayerA.average} b={h2hPlayerB.average} />
                <ComparisonRow label="100+" a={h2hPlayerA.t100} b={h2hPlayerB.t100} />
                <ComparisonRow label="140+" a={h2hPlayerA.t140} b={h2hPlayerB.t140} />
                <ComparisonRow label="170+" a={h2hPlayerA.t170} b={h2hPlayerB.t170} />
                <ComparisonRow label="180" a={h2hPlayerA.t180} b={h2hPlayerB.t180} />
                <ComparisonRow label="100+ kończenie" a={h2hPlayerA.finishes100} b={h2hPlayerB.finishes100} />
                <ComparisonRow label="High out" a={h2hPlayerA.highOut} b={h2hPlayerB.highOut} />

                <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-400">
                  <span>
                    Best leg: <span className="text-gold font-bold">{h2hPlayerA.bestLeg ?? '-'}</span>
                  </span>
                  <span>
                    Best leg: <span className="text-brand-light font-bold">{h2hPlayerB.bestLeg ?? '-'}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold mb-1">Zawodnicy - {leagueName}</h2>
          <p className="text-xs text-slate-500 mb-3">Lista i wyszukiwarka dotyczą tylko tej ligi. Do porównania z inną ligą użyj porównywarki H2H powyżej.</p>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Szukaj zawodnika w ${leagueName}...`}
            className="w-full mb-3 px-4 py-2.5 rounded-xl bg-ink-800/60 border border-ink-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand/50 text-sm"
          />

          <div className="overflow-x-auto rounded-2xl border border-ink-700/60 mb-4">
            <table className="w-full min-w-[720px] text-left text-sm text-slate-300">
              <thead className="bg-ink-800/80 text-slate-500 uppercase text-[11px] tracking-wider">
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
                      {p.tpid === myTpid && <span className="ml-1.5 text-[10px] text-brand-light">(Ty)</span>}
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
            <p className="text-slate-500 text-sm mb-4">Brak wyników dla &quot;{query}&quot;</p>
          )}

          {selectedPlayer && (
            <div className="p-4 bg-ink-800/60 border border-ink-700/60 rounded-2xl animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">{selectedPlayer.name}</h3>
                <button onClick={() => setSelectedTpid(null)} className="text-slate-500 hover:text-slate-300 text-sm">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-center">
                <StatBadge label="Średnia" value={selectedPlayer.average?.toFixed(2) ?? '-'} />
                <StatBadge label="100+" value={selectedPlayer.t100} />
                <StatBadge label="140+" value={selectedPlayer.t140} />
                <StatBadge label="170+" value={selectedPlayer.t170} />
                <StatBadge label="180" value={selectedPlayer.t180} />
                <StatBadge label="100+ kończ." value={selectedPlayer.finishes100} />
                <StatBadge label="High out" value={selectedPlayer.highOut ?? '-'} />
                <StatBadge label="Best leg" value={selectedPlayer.bestLeg ?? '-'} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-ink-900/60 border border-ink-700/60 rounded-xl py-2.5 px-2">
      <div className="text-base font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
