'use client';

import { useEffect, useState } from 'react';
import { LEAGUES_CONFIG } from '@/config/leagues';
import { fetchLeagueData, fetchLeagueSchedule, fetchLiveMatches } from '@/lib/nakkaApi';
import { buildFixtures, buildLivePairKeys, computeLeagueStandings, pairKey } from '@/lib/standings';
import { copyText } from '@/lib/clipboard';

interface OverdueMatch {
  key: string;
  name1: string;
  name2: string;
  date: Date;
  days: number;
}

interface LeagueOverdue {
  id: string;
  name: string;
  matches: OverdueMatch[];
  noDate: number; // nierozegrane mecze bez daty w terminarzu - nie da się ich ocenić
  error: boolean;
}

const DAY = 24 * 60 * 60 * 1000;
const THRESHOLDS = [7, 14, 30];
const WEEKDAYS = ['nd', 'pn', 'wt', 'śr', 'czw', 'pt', 'sb'];
const pad = (n: number) => String(n).padStart(2, '0');
const dmy = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

function daysLabel(n: number): string {
  if (n === 1) return '1 dzień';
  return `${n} dni`;
}

async function loadLeague(league: (typeof LEAGUES_CONFIG)[number], minDays: number): Promise<LeagueOverdue> {
  const [data, schedule, live] = await Promise.all([
    fetchLeagueData(league.nakkaId),
    fetchLeagueSchedule(league.nakkaId),
    fetchLiveMatches(league.nakkaId),
  ]);
  const tournament = data?.tournament;
  if (!tournament || !schedule) {
    return { id: league.id, name: league.name, matches: [], noDate: 0, error: true };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const matches: OverdueMatch[] = [];
  let noDate = 0;

  const activeLive = (live || []).filter((m: any) => m.endMatch !== 1 && m.endMatch !== true);
  const robin = Number(tournament.lg_setting?.robin_count) || 1;
  const playedPairs = new Set((computeLeagueStandings(tournament)?.results || []).map((r) => pairKey(r.tpid1, r.tpid2)));
  buildFixtures(tournament, schedule as any[][], buildLivePairKeys(activeLive)).forEach((f) => {
    if (f.played || f.isLive) return;
    // terminarz z kartami w obie strony przy jednej rundzie: para już zagrała na drugiej karcie
    if (robin === 1 && playedPairs.has(pairKey(f.tpid1, f.tpid2))) return;
    if (!f.date) {
      noDate++;
      return;
    }
    const days = Math.round((today.getTime() - f.date.getTime()) / DAY);
    if (days < minDays) return;
    matches.push({ key: `${f.divIndex}_${f.lsid}`, name1: f.name1, name2: f.name2, date: f.date, days });
  });

  matches.sort((a, b) => b.days - a.days);
  return { id: league.id, name: league.name, matches, noDate, error: false };
}

export default function AdminZalegle() {
  const [minDays, setMinDays] = useState(14);
  const [leagues, setLeagues] = useState<LeagueOverdue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(LEAGUES_CONFIG.map((l) => loadLeague(l, minDays))).then((res) => {
      if (cancelled) return;
      setLeagues(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [minDays, refreshKey]);

  const total = leagues.reduce((s, l) => s + l.matches.length, 0);
  const [copied, setCopied] = useState(false);

  useEffect(() => setCopied(false), [minDays, refreshKey]);

  function buildListText(): string {
    const lines: string[] = [`ZALEGŁE MECZE (co najmniej ${minDays} dni po terminie)`];
    leagues.forEach((l) => {
      if (l.matches.length === 0) return;
      lines.push('', l.name);
      l.matches.forEach((m) => lines.push(`${m.name1} – ${m.name2}, termin ${dmy(m.date)}, ${daysLabel(m.days)} po terminie`));
    });
    lines.push('', 'Prosimy o pilne rozegranie lub ustalenie nowego terminu z organizatorem.');
    return lines.join('\n');
  }

  async function handleCopy() {
    const ok = await copyText(buildListText());
    setCopied(ok);
    if (!ok) alert('Nie udało się skopiować tekstu.');
  }

  return (
    <div className="mx-auto max-w-[640px]">
      {/* Próg opóźnienia */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className="text-[13px] text-slate-400 mr-1 whitespace-nowrap">Min.</span>
        {THRESHOLDS.map((t) => (
          <button
            key={t}
            onClick={() => setMinDays(t)}
            className={`px-3 py-2 rounded-xl text-sm font-bold border transition whitespace-nowrap ${
              t === minDays ? 'bg-gold text-ink-950 border-gold' : 'bg-ink-800 text-slate-300 border-ink-700'
            }`}
          >
            {t} dni
          </button>
        ))}
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="ml-auto px-3 py-2 rounded-xl text-sm font-bold bg-ink-800 text-slate-300 border border-ink-700"
        >
          Odśwież
        </button>
      </div>

      {/* Podsumowanie */}
      <div
        className={`rounded-2xl border p-4 mb-5 ${
          !loading && total > 0 ? 'border-red-500/60 bg-red-500/10' : 'border-ink-700 bg-ink-900'
        }`}
      >
        {loading ? (
          <p className="text-slate-400">Sprawdzam terminarze…</p>
        ) : total > 0 ? (
          <p className="text-[17px] font-bold text-white">
            {total} {total === 1 ? 'mecz wymaga' : total < 5 ? 'mecze wymagają' : 'meczów wymaga'} interwencji
            <span className="block text-[13px] font-normal text-slate-400 mt-0.5">
              Bez wyniku co najmniej {minDays} dni po terminie z terminarza
            </span>
          </p>
        ) : (
          <p className="text-[17px] font-bold text-brand">
            Brak meczów opóźnionych o {minDays}+ dni
          </p>
        )}
      </div>

      {!loading && total > 0 && (
        <button
          onClick={handleCopy}
          className="w-full mb-5 px-4 py-3 rounded-xl text-base font-extrabold bg-gold text-ink-950 transition"
        >
          {copied ? 'Skopiowano ✓' : 'Kopiuj listę dla zawodników'}
        </button>
      )}

      {!loading &&
        leagues.map((l) => (
          <section key={l.id} className="mb-5">
            <div className="flex items-baseline justify-between mb-2 px-1">
              <h2 className="text-[15px] font-extrabold tracking-wider text-brand uppercase">{l.name}</h2>
              <span className="text-[13px] text-slate-500">
                {l.error ? 'błąd pobierania' : l.matches.length === 0 ? 'brak' : l.matches.length}
              </span>
            </div>

            {l.matches.length > 0 && (
              <div className="rounded-2xl border border-ink-700 bg-ink-900 overflow-hidden divide-y divide-ink-700/70">
                {l.matches.map((m) => {
                  const severe = m.days >= 30;
                  return (
                    <div
                      key={m.key}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ boxShadow: `inset 4px 0 0 ${severe ? '#f87171' : '#f2b134'}` }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[16px] font-semibold text-white leading-snug">
                          {m.name1} <span className="text-slate-500 font-normal">vs</span> {m.name2}
                        </p>
                        <p className="text-[13px] text-slate-400">
                          Termin: {WEEKDAYS[m.date.getDay()]} {dmy(m.date)}
                        </p>
                      </div>
                      <div
                        className={`shrink-0 text-right px-3 py-1.5 rounded-xl border ${
                          severe ? 'border-red-500/50 bg-red-500/10' : 'border-gold/40 bg-gold/10'
                        }`}
                      >
                        <p className={`text-[18px] font-extrabold tabular-nums leading-none ${severe ? 'text-red-400' : 'text-gold'}`}>
                          {daysLabel(m.days)}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">po terminie</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {l.noDate > 0 && (
              <p className="text-[12px] text-slate-500 mt-1.5 px-1">
                {l.noDate === 1
                  ? '1 nierozegrany mecz'
                  : l.noDate < 5
                  ? `${l.noDate} nierozegrane mecze`
                  : `${l.noDate} nierozegranych meczów`}{' '}
                bez daty w terminarzu (nie do sprawdzenia)
              </p>
            )}
          </section>
        ))}

      <p className="text-[12px] text-slate-500 px-1">
        Data z karty meczu w terminarzu Nakka. Mecze trwające właśnie na żywo nie są liczone jako zaległe.
        Żółty — do 29 dni po terminie, czerwony — 30 dni i więcej.
      </p>
    </div>
  );
}
