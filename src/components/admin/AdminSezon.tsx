'use client';

import { useEffect, useState } from 'react';
import { LEAGUES_CONFIG, LeagueConfig } from '@/config/leagues';
import { fetchLeagueData, fetchLeagueSchedule, fetchLiveMatches } from '@/lib/nakkaApi';
import { buildFixtures, buildLivePairKeys, computeLeagueStandings } from '@/lib/standings';

interface Issue {
  key: string;
  text: string;
  detail?: string;
}

interface LeagueSeason {
  id: string;
  name: string;
  error: boolean;
  total: number;
  played: number;
  live: number;
  overdue: number;
  noDate: Issue[]; // nierozegrane mecze bez daty w terminarzu
  badDate: Issue[]; // coś wpisane w tytule karty, ale nie da się z tego odczytać daty
  manual: Issue[]; // wyniki wpisane ręcznie - bez średnich i bez strony meczu
}

async function loadSeason(league: LeagueConfig): Promise<LeagueSeason> {
  const [data, schedule, live] = await Promise.all([
    fetchLeagueData(league.nakkaId),
    fetchLeagueSchedule(league.nakkaId),
    fetchLiveMatches(league.nakkaId),
  ]);
  const tournament = data?.tournament;
  const empty: LeagueSeason = {
    id: league.id,
    name: league.name,
    error: true,
    total: 0,
    played: 0,
    live: 0,
    overdue: 0,
    noDate: [],
    badDate: [],
    manual: [],
  };
  if (!tournament || !schedule) return empty;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fixtures = buildFixtures(tournament, schedule as any[][], buildLivePairKeys(live));
  const res: LeagueSeason = { ...empty, error: false, total: fixtures.length };

  fixtures.forEach((f) => {
    const key = `${f.divIndex}_${f.lsid}`;
    if (f.played) res.played++;
    else if (f.isLive) res.live++;
    if (f.played || f.isLive) return;
    if (f.date) {
      if (f.date.getTime() < today.getTime()) res.overdue++;
      return;
    }
    if (f.title && f.title.trim()) {
      res.badDate.push({ key, text: `${f.name1} – ${f.name2}`, detail: `wpisane: „${f.title.trim()}”` });
    } else {
      res.noDate.push({ key, text: `${f.name1} – ${f.name2}` });
    }
  });

  (computeLeagueStandings(tournament)?.results || [])
    .filter((r) => !r.hasDetail)
    .forEach((r) =>
      res.manual.push({ key: `${r.tpid1}_${r.tpid2}`, text: `${r.name1} ${r.legs1}:${r.legs2} ${r.name2}` })
    );

  return res;
}

function IssueList({ title, hint, items, tone }: { title: string; hint: string; items: Issue[]; tone: 'red' | 'gold' | 'slate' }) {
  if (items.length === 0) return null;
  const color = tone === 'red' ? 'text-red-400' : tone === 'gold' ? 'text-gold' : 'text-slate-300';
  return (
    <div className="mt-3">
      <p className={`text-[14px] font-bold ${color}`}>
        {title} ({items.length})
      </p>
      <p className="text-[12px] text-slate-500 mb-1.5">{hint}</p>
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i.key} className="text-[14px] text-slate-200 leading-snug">
            {i.text}
            {i.detail && <span className="block text-[12px] text-slate-500">{i.detail}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminSezon() {
  const [leagues, setLeagues] = useState<LeagueSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(LEAGUES_CONFIG.map(loadSeason)).then((res) => {
      if (cancelled) return;
      setLeagues(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const totalIssues = leagues.reduce((s, l) => s + l.noDate.length + l.badDate.length + l.manual.length, 0);

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <h1 className="text-[20px] font-extrabold text-white">Postęp sezonu</h1>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="px-3 py-2 rounded-xl text-sm font-bold bg-ink-800 text-slate-300 border border-ink-700"
        >
          Odśwież
        </button>
      </div>

      {loading && <p className="text-slate-400 px-1">Sprawdzam ligi…</p>}

      {!loading && (
        <div className="space-y-3 mb-8">
          {leagues.map((l) => {
            const pct = l.total > 0 ? Math.round((l.played / l.total) * 100) : 0;
            return (
              <div key={l.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-[15px] font-extrabold tracking-wider text-brand uppercase">{l.name}</h2>
                  {!l.error && <span className="text-[22px] font-extrabold text-white tabular-nums">{pct}%</span>}
                </div>
                {l.error ? (
                  <p className="text-[14px] text-red-400">Nie udało się pobrać danych z Nakka.</p>
                ) : (
                  <>
                    <div className="h-3 rounded-full bg-ink-800 overflow-hidden mb-3">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        ['Rozegrane', `${l.played}/${l.total}`, 'text-white'],
                        ['Zostało', String(l.total - l.played - l.live), 'text-white'],
                        ['Trwają', String(l.live), l.live > 0 ? 'text-brand' : 'text-white'],
                        ['Po terminie', String(l.overdue), l.overdue > 0 ? 'text-red-400' : 'text-white'],
                      ].map(([label, value, color]) => (
                        <div key={label} className="rounded-xl bg-ink-800/70 border border-ink-700 py-2">
                          <p className={`text-[18px] font-extrabold tabular-nums ${color}`}>{value}</p>
                          <p className="text-[11px] text-slate-500">{label}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && (
        <>
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h1 className="text-[20px] font-extrabold text-white">Porządek w danych</h1>
            <span className={`text-[14px] font-bold ${totalIssues > 0 ? 'text-gold' : 'text-brand'}`}>
              {totalIssues > 0 ? `${totalIssues} do sprawdzenia` : 'Wszystko w porządku ✓'}
            </span>
          </div>
          <div className="space-y-3">
            {leagues
              .filter((l) => !l.error)
              .map((l) => {
                const count = l.noDate.length + l.badDate.length + l.manual.length;
                return (
                  <div key={l.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-4">
                    <div className="flex items-baseline justify-between">
                      <h2 className="text-[15px] font-extrabold tracking-wider text-brand uppercase">{l.name}</h2>
                      <span className={`text-[13px] ${count > 0 ? 'text-gold' : 'text-slate-500'}`}>
                        {count > 0 ? count : 'OK'}
                      </span>
                    </div>
                    <IssueList
                      title="Nieczytelna data w terminarzu"
                      hint="Wpisz datę jako 2026-10-15 albo 15.10.2026."
                      items={l.badDate}
                      tone="red"
                    />
                    <IssueList
                      title="Brak daty w terminarzu"
                      hint="Bez daty mecz nie trafi do Zaległych, Następnego meczu ani Meczów tygodnia."
                      items={l.noDate}
                      tone="gold"
                    />
                    <IssueList
                      title="Wynik wpisany ręcznie"
                      hint="Brak średnich i strony meczu w Nakka. To tylko informacja - nie trzeba nic poprawiać."
                      items={l.manual}
                      tone="slate"
                    />
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
