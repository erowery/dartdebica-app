'use client';

import { useEffect, useRef, useState } from 'react';
import { LEAGUES_CONFIG } from '@/config/leagues';
import { fetchLeagueData, fetchLeagueSchedule, fetchMatchesInRange } from '@/lib/nakkaApi';
import { buildFixtures, calcAverage, computeLeagueStandings, getEntryName, pairKey } from '@/lib/standings';
import { downloadNodeAsPng } from '@/lib/snapshot';

interface WeekMatch {
  key: string;
  time: Date;
  manual: boolean; // wpisany ręcznie w Nakka - bez godziny i bez średnich
  name1: string;
  name2: string;
  legs1: number;
  legs2: number;
  avg1: number | null;
  avg2: number | null;
  url: string | null;
}

interface LeagueWeek {
  id: string;
  name: string;
  matches: WeekMatch[];
  error: boolean;
}

const DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['nd', 'pn', 'wt', 'śr', 'czw', 'pt', 'sb'];

/** Początek tygodnia ligowego: czwartek 00:00 (czas lokalny) dla podanej daty */
function thursdayOf(d: Date): Date {
  const diff = (d.getDay() - 4 + 7) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff, 0, 0, 0, 0);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 0, 0, 0, 0);
}

const pad = (n: number) => String(n).padStart(2, '0');
const dm = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
const dmy = (d: Date) => `${dm(d)}.${d.getFullYear()}`;
const hm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

async function loadLeagueWeek(
  league: (typeof LEAGUES_CONFIG)[number],
  start: Date,
  end: Date
): Promise<LeagueWeek> {
  const [archive, data, schedule] = await Promise.all([
    fetchMatchesInRange(league.nakkaId, Math.floor(start.getTime() / 1000), Math.floor(end.getTime() / 1000)),
    fetchLeagueData(league.nakkaId),
    fetchLeagueSchedule(league.nakkaId),
  ]);
  const tournament = data?.tournament;
  const matches: WeekMatch[] = [];
  const seenPairs = new Set<string>();

  // 1) Mecze rozegrane na żywo w Nakka - mają dokładną godzinę rozpoczęcia
  const byTmid: Record<string, any> = {};
  (archive || []).forEach((m: any) => {
    if (!m?.tmid || !String(m.tmid).includes('_lg_')) return;
    if (Number(m.endMatch) !== 1) return;
    const prev = byTmid[m.tmid];
    if (!prev || (m.startTime ?? 0) > (prev.startTime ?? 0)) byTmid[m.tmid] = m;
  });
  Object.values(byTmid).forEach((m: any) => {
    const p1 = m.statsData?.[0] || {};
    const p2 = m.statsData?.[1] || {};
    if (p1.tpid && p2.tpid) seenPairs.add(pairKey(p1.tpid, p2.tpid));
    matches.push({
      key: m.tmid,
      time: new Date((m.startTime ?? 0) * 1000),
      manual: false,
      name1: p1.tpid && tournament ? getEntryName(tournament, p1.tpid) : p1.name || 'Gracz 1',
      name2: p2.tpid && tournament ? getEntryName(tournament, p2.tpid) : p2.name || 'Gracz 2',
      legs1: p1.winLegs ?? 0,
      legs2: p2.winLegs ?? 0,
      avg1: calcAverage(p1.allScore || 0, p1.allDarts || 0),
      avg2: calcAverage(p2.allScore || 0, p2.allDarts || 0),
      url: `https://n01darts.com/n01/league/n01_view.html?tmid=${m.tmid}`,
    });
  });

  // 2) Mecze wpisane ręcznie (bez średnich) - data z tytułu karty w terminarzu
  if (tournament) {
    const standings = computeLeagueStandings(tournament);
    const manualPairs = new Set(
      (standings?.results || []).filter((r) => !r.hasDetail).map((r) => pairKey(r.tpid1, r.tpid2))
    );
    buildFixtures(tournament, schedule as any[][] | null).forEach((f) => {
      const pk = pairKey(f.tpid1, f.tpid2);
      if (!f.played || !f.date || !manualPairs.has(pk) || seenPairs.has(pk)) return;
      if (f.date < start || f.date >= end) return;
      matches.push({
        key: `manual_${f.divIndex}_${f.lsid}`,
        time: f.date,
        manual: true,
        name1: f.name1,
        name2: f.name2,
        legs1: f.legs1 ?? 0,
        legs2: f.legs2 ?? 0,
        avg1: null,
        avg2: null,
        url: null,
      });
    });
  }

  matches.sort((a, b) => a.time.getTime() - b.time.getTime());
  return { id: league.id, name: league.name, matches, error: archive === null && !tournament };
}

function buildPostText(start: Date, end: Date, leagues: LeagueWeek[]): string {
  const lines: string[] = [`MECZE TYGODNIA ${dm(start)} – ${dmy(addDays(end, -1))}`];
  leagues.forEach((l) => {
    if (l.matches.length === 0) return;
    lines.push('', l.name);
    l.matches.forEach((m) => {
      const avg = m.avg1 != null && m.avg2 != null ? ` (śr. ${m.avg1.toFixed(2)} – ${m.avg2.toFixed(2)})` : '';
      lines.push(`${m.name1} ${m.legs1}:${m.legs2} ${m.name2}${avg}`);
    });
  });
  return lines.join('\n');
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export default function AdminTydzien() {
  // Domyślnie tydzień, w którym był "wczoraj": w czwartek pokazuje poprzedni (zakończony) tydzień
  const [start, setStart] = useState<Date>(() => thursdayOf(new Date(Date.now() - DAY)));
  const [leagues, setLeagues] = useState<LeagueWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const end = addDays(start, 7); // następny czwartek 00:00 = koniec środy 23:59:59
  const currentWeekStart = thursdayOf(new Date());
  const isFuture = start.getTime() >= currentWeekStart.getTime();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCopied(false);
    Promise.all(LEAGUES_CONFIG.map((l) => loadLeagueWeek(l, start, end))).then((res) => {
      if (cancelled) return;
      setLeagues(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start.getTime()]);

  const total = leagues.reduce((s, l) => s + l.matches.length, 0);
  const anyError = leagues.some((l) => l.error);

  async function handleCopy() {
    const ok = await copyText(buildPostText(start, end, leagues));
    setCopied(ok);
    if (!ok) alert('Nie udało się skopiować tekstu.');
  }

  async function handleImage() {
    if (!captureRef.current || saving) return;
    setSaving(true);
    try {
      await downloadNodeAsPng(
        captureRef.current,
        `Mecze_tygodnia_${dm(start).replace('.', '-')}_${dmy(addDays(end, -1)).replace(/\./g, '-')}.png`
      );
    } catch {
      alert('Nie udało się zapisać zdjęcia. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Wybór tygodnia */}
      <div className="mx-auto max-w-[640px] mb-4 flex items-center gap-2 px-1">
        <button
          onClick={() => setStart(addDays(start, -7))}
          className="px-4 py-2.5 rounded-xl bg-ink-800 border border-ink-700 text-slate-200 font-bold"
          aria-label="Poprzedni tydzień"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <p className="text-[15px] font-bold text-white">
            {dm(start)} – {dmy(addDays(end, -1))}
          </p>
          <p className="text-[12px] text-slate-500">czwartek 00:00 – środa 23:59</p>
        </div>
        <button
          onClick={() => setStart(addDays(start, 7))}
          disabled={isFuture}
          className="px-4 py-2.5 rounded-xl bg-ink-800 border border-ink-700 text-slate-200 font-bold disabled:opacity-30"
          aria-label="Następny tydzień"
        >
          →
        </button>
      </div>

      {/* Obszar zdjęcia */}
      <div ref={captureRef} className="mx-auto max-w-[640px] bg-ink-950 bg-radial-fade p-5">
        <div className="flex items-center gap-4 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-16 w-16 object-contain" />
          <div>
            <h1 className="text-[28px] leading-tight font-extrabold tracking-wide">MECZE TYGODNIA</h1>
            <p className="text-[15px] text-slate-400">
              Ligi LSDD · {dm(start)} – {dmy(addDays(end, -1))}
            </p>
          </div>
        </div>

        {loading && <p className="text-slate-400 pb-2">Ładowanie…</p>}
        {!loading && total === 0 && (
          <p className="text-slate-400 pb-2">
            {anyError ? 'Nie udało się pobrać danych z Nakka.' : 'Brak rozegranych meczów w tym tygodniu.'}
          </p>
        )}

        {!loading &&
          leagues
            .filter((l) => l.matches.length > 0)
            .map((l) => (
              <section key={l.id} className="mb-5 last:mb-1">
                <h2 className="text-[15px] font-extrabold tracking-wider text-brand uppercase mb-2 px-1">
                  {l.name}
                </h2>
                <div className="rounded-2xl border border-ink-700 bg-ink-900 overflow-hidden divide-y divide-ink-700/70">
                  {l.matches.map((m) => {
                    const w1 = m.legs1 > m.legs2;
                    const w2 = m.legs2 > m.legs1;
                    const Row = (
                      <div className="px-3 py-2.5">
                        <p className="text-[12px] text-slate-500 text-center mb-1">
                          {WEEKDAYS[m.time.getDay()]} {dm(m.time)}
                          {m.manual ? ' · wpisany ręcznie' : ` · ${hm(m.time)}`}
                        </p>
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <div className="text-right min-w-0">
                            <p className={`text-[16px] leading-tight ${w1 ? 'font-extrabold text-white' : 'font-semibold text-slate-300'}`}>
                              {m.name1}
                            </p>
                            {m.avg1 != null && <p className="text-[13px] text-slate-500 tabular-nums">śr. {m.avg1.toFixed(2)}</p>}
                          </div>
                          <div className="px-3 py-1 rounded-lg bg-ink-800 border border-ink-700 text-[20px] font-extrabold tabular-nums whitespace-nowrap">
                            <span className={w1 ? 'text-brand' : 'text-white'}>{m.legs1}</span>
                            <span className="text-slate-500 mx-1">:</span>
                            <span className={w2 ? 'text-brand' : 'text-white'}>{m.legs2}</span>
                          </div>
                          <div className="text-left min-w-0">
                            <p className={`text-[16px] leading-tight ${w2 ? 'font-extrabold text-white' : 'font-semibold text-slate-300'}`}>
                              {m.name2}
                            </p>
                            {m.avg2 != null && <p className="text-[13px] text-slate-500 tabular-nums">śr. {m.avg2.toFixed(2)}</p>}
                          </div>
                        </div>
                      </div>
                    );
                    return m.url ? (
                      <a key={m.key} href={m.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-white/[0.03]">
                        {Row}
                      </a>
                    ) : (
                      <div key={m.key}>{Row}</div>
                    );
                  })}
                </div>
              </section>
            ))}
      </div>

      {/* Akcje - poza obszarem zdjęcia */}
      <div className="mx-auto max-w-[640px] mt-6 grid grid-cols-2 gap-2 px-1">
        <button
          onClick={handleCopy}
          disabled={loading || total === 0}
          className="px-4 py-3.5 rounded-xl text-base font-extrabold bg-gold text-ink-950 transition disabled:opacity-40"
        >
          {copied ? 'Skopiowano ✓' : 'Kopiuj do opisu'}
        </button>
        <button
          onClick={handleImage}
          disabled={loading || saving || total === 0}
          className="px-4 py-3.5 rounded-xl text-base font-extrabold bg-brand text-ink-950 shadow-glow transition disabled:opacity-40"
        >
          {saving ? 'Tworzę zdjęcie…' : 'Pobierz zdjęcie'}
        </button>
      </div>
      <p className="mx-auto max-w-[640px] mt-3 px-1 text-[12px] text-slate-500">
        Kliknięcie meczu otwiera jego szczegóły w Nakka. Mecze wpisane ręcznie pokazują się według daty z terminarza.
      </p>
    </div>
  );
}
