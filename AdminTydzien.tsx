'use client';

import { useEffect, useRef, useState } from 'react';
import { LEAGUES_CONFIG } from '@/config/leagues';
import { downloadNodeAsPng } from '@/lib/snapshot';
import {
  LeagueWeek,
  WeekHighlights,
  WEEKDAYS,
  addDays,
  computeHighlights,
  defaultWeekStart,
  dm,
  dmy,
  hm,
  loadLeagueWeek,
  thursdayOf,
} from '@/lib/weekly';
import WeekHighlightsCard from '@/components/WeekHighlightsCard';
import { generateWeeklyPost } from '@/lib/postText';

function highlightLines(h: WeekHighlights | undefined): string[] {
  if (!h) return [];
  const out: string[] = [];
  if (h.topAverage) out.push(`Najwyższa średnia: ${h.topAverage.name} ${h.topAverage.value.toFixed(2)} (vs ${h.topAverage.opponent})`);
  if (h.bestLeg) out.push(`Best leg: ${h.bestLeg.name} ${h.bestLeg.value} (vs ${h.bestLeg.opponent})`);
  if (h.topCheckout) out.push(`Najwyższy checkout: ${h.topCheckout.name} ${h.topCheckout.value} (vs ${h.topCheckout.opponent})`);
  return out;
}

function buildPostText(start: Date, end: Date, leagues: LeagueWeek[], hl: Record<string, WeekHighlights>): string {
  const lines: string[] = [`MECZE TYGODNIA ${dm(start)} – ${dmy(addDays(end, -1))}`];
  leagues.forEach((l) => {
    if (l.matches.length === 0) return;
    lines.push('', l.name);
    const h = highlightLines(hl[l.id]);
    if (h.length) lines.push(...h, '');
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
  const [start, setStart] = useState<Date>(() => defaultWeekStart());
  const [leagues, setLeagues] = useState<LeagueWeek[]>([]);
  const [highlights, setHighlights] = useState<Record<string, WeekHighlights>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [post, setPost] = useState('');
  const [postCopied, setPostCopied] = useState(false);
  const [variant, setVariant] = useState(0);
  const captureRef = useRef<HTMLDivElement>(null);

  const end = addDays(start, 7); // następny czwartek 00:00 = koniec środy 23:59:59
  const currentWeekStart = thursdayOf(new Date());
  const isFuture = start.getTime() >= currentWeekStart.getTime();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCopied(false);
    setHighlights({});
    Promise.all(LEAGUES_CONFIG.map((l) => loadLeagueWeek(l, start, end))).then(async (res) => {
      if (cancelled) return;
      setLeagues(res);
      setLoading(false);
      const hs = await Promise.all(res.map((l) => computeHighlights(l.matches)));
      if (cancelled) return;
      const map: Record<string, WeekHighlights> = {};
      res.forEach((l, i) => (map[l.id] = hs[i]));
      setHighlights(map);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start.getTime()]);

  const highlightsReady = !loading && leagues.length > 0 && leagues.every((l) => l.matches.length === 0 || highlights[l.id]);

  useEffect(() => {
    if (!highlightsReady) {
      setPost('');
      return;
    }
    setPostCopied(false);
    setPost(
      generateWeeklyPost(start, leagues, highlights, {
        // tabelę "po kolejce" dodajemy tylko dla bieżącego / ostatniego tygodnia (dla starszych byłaby nieaktualna)
        includeTable: start.getTime() >= defaultWeekStart().getTime(),
        variant,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightsReady, highlights, variant]);

  async function handleCopyPost() {
    const ok = await copyText(post);
    setPostCopied(ok);
    if (!ok) alert('Nie udało się skopiować tekstu.');
  }

  const total = leagues.reduce((s, l) => s + l.matches.length, 0);
  const anyError = leagues.some((l) => l.error);

  async function handleCopy() {
    const ok = await copyText(buildPostText(start, end, leagues, highlights));
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
                <WeekHighlightsCard highlights={highlights[l.id]} className="mb-2" />
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
          {copied ? 'Skopiowano ✓' : 'Kopiuj wyniki'}
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

      {/* Opis kolejki na fanpage */}
      {!loading && total > 0 && (
        <section className="mx-auto max-w-[640px] mt-8 px-1">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-[20px] font-extrabold text-white">Opis na fanpage</h2>
            <button
              onClick={() => setVariant((v) => v + 1)}
              disabled={!post}
              className="text-[13px] font-bold text-brand disabled:opacity-40"
            >
              Inne sformułowania ↻
            </button>
          </div>
          <p className="text-[12px] text-slate-500 mb-2">
            Tekst możesz poprawić bezpośrednio w ramce przed skopiowaniem.
          </p>
          {post ? (
            <textarea
              value={post}
              onChange={(e) => {
                setPost(e.target.value);
                setPostCopied(false);
              }}
              rows={Math.min(40, post.split('\n').length + 2)}
              className="w-full rounded-2xl bg-ink-900 border border-ink-700 p-4 text-[14px] leading-relaxed text-slate-200 focus:outline-none focus:border-brand"
            />
          ) : (
            <div className="h-40 rounded-2xl bg-ink-900 border border-ink-700 animate-pulse" />
          )}
          <button
            onClick={handleCopyPost}
            disabled={!post}
            className="w-full mt-2 px-4 py-3.5 rounded-xl text-base font-extrabold bg-gold text-ink-950 transition disabled:opacity-40"
          >
            {postCopied ? 'Skopiowano ✓' : 'Kopiuj opis'}
          </button>
        </section>
      )}
    </div>
  );
}
