import { LeagueWeek, WeekHighlights, addDays, dm, dmy, WeekMatch } from '@/lib/weekly';
import { computeLeagueStandings, StandingRow } from '@/lib/standings';

/**
 * Generator opisu kolejki na fanpage - z gotowych zdań (bez sztucznej inteligencji, za darmo).
 * Nazwiska zawsze stoją w mianowniku i bez czasowników z rodzajem, żeby nie było błędów odmiany.
 * Wariant zdań zależy od tygodnia, więc kolejne posty nie są identyczne.
 */

function pick<T>(list: T[], seed: number, salt = 0): T {
  return list[Math.abs(seed + salt * 7) % list.length];
}

function matchesWord(n: number): string {
  if (n === 1) return 'mecz';
  const last = n % 10;
  const lastTwo = n % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'mecze';
  return 'meczów';
}

function sortRows(rows: StandingRow[]): StandingRow[] {
  return [...rows].sort(
    (a, b) =>
      b.points - a.points ||
      b.legsFor - b.legsAgainst - (a.legsFor - a.legsAgainst) ||
      b.legsFor - a.legsFor ||
      a.name.localeCompare(b.name, 'pl')
  );
}

const score = (m: WeekMatch) => `${m.name1} – ${m.name2} ${m.legs1}:${m.legs2}`;

function tableSentences(week: LeagueWeek, seed: number): string[] {
  const t = week.tournament;
  if (!t) return [];
  const after = computeLeagueStandings(t);
  if (!after) return [];

  // tabela przed tym tygodniem = bez wyników meczów z tego tygodnia
  const weekKeys = new Set(week.matches.map((m) => m.lgKey).filter(Boolean) as string[]);
  const lgBefore: Record<string, any> = {};
  Object.keys(t.lg_result || {}).forEach((k) => {
    if (!weekKeys.has(k)) lgBefore[k] = t.lg_result[k];
  });
  const before = computeLeagueStandings({ ...t, lg_result: lgBefore });

  const out: string[] = [];
  after.divisions.forEach((div, i) => {
    const rows = sortRows(div);
    if (rows.length === 0 || rows[0].played === 0) return;
    const prefix = after.divisions.length > 1 ? `Grupa ${i + 1}: ` : '';
    const leader = rows[0];
    const prevRows = before ? sortRows(before.divisions[i] || []) : [];
    const prevLeader = prevRows[0] && prevRows[0].played > 0 ? prevRows[0] : null;
    const rest = rows
      .slice(1, 3)
      .map((r) => `${r.name} (${r.points} pkt)`)
      .join(' i ');

    let lead: string;
    if (prevLeader && prevLeader.tpid !== leader.tpid) {
      lead = pick(
        [
          `Zmiana na fotelu lidera! Na czele tabeli jest teraz ${leader.name} (${leader.points} pkt).`,
          `Mamy nowego lidera: ${leader.name} (${leader.points} pkt).`,
        ],
        seed,
        i
      );
    } else {
      lead = pick(
        [
          `Pozycję lidera utrzymuje ${leader.name} (${leader.points} pkt).`,
          `Na czele tabeli bez zmian: ${leader.name} (${leader.points} pkt).`,
          `Tabelę nadal otwiera ${leader.name} (${leader.points} pkt).`,
        ],
        seed,
        i
      );
    }
    out.push(`${prefix}${lead}${rest ? ` Dalej: ${rest}.` : ''}`);
  });
  return out;
}

export function generateWeeklyPost(
  start: Date,
  leagues: LeagueWeek[],
  highlights: Record<string, WeekHighlights>,
  options: { includeTable: boolean; variant?: number }
): string {
  const end = addDays(start, 7);
  const range = `${dm(start)}–${dmy(addDays(end, -1))}`;
  const seed = Math.floor(start.getTime() / (7 * 24 * 60 * 60 * 1000)) + (options.variant || 0);

  const lines: string[] = [];
  lines.push(
    pick(
      [
        `Za nami kolejny tydzień rozgrywek LSDD! Oto podsumowanie meczów z dni ${range}.`,
        `Podsumowanie tygodnia w ligach LSDD (${range}). Sprawdźcie, co działo się przy tarczach!`,
        `Kolejny tydzień ligowej rywalizacji za nami (${range}). Zapraszamy do podsumowania!`,
        `Tak wyglądał tydzień w ligach LSDD (${range}) – wyniki, wyróżnienia i sytuacja w tabelach.`,
      ],
      seed
    )
  );

  const played = leagues.filter((l) => l.matches.length > 0);
  if (played.length === 0) {
    lines.push('', 'W tym tygodniu nie rozegrano żadnych meczów ligowych.');
  }

  played.forEach((l, li) => {
    const h = highlights[l.id];
    const n = l.matches.length;
    lines.push('', l.name.toUpperCase());
    const verb = n === 1 ? 'odbył się' : matchesWord(n) === 'mecze' ? 'odbyły się' : 'odbyło się';
    lines.push(pick([`Rozegrano ${n} ${matchesWord(n)}.`, `W tym tygodniu ${verb} ${n} ${matchesWord(n)}.`], seed, li));
    lines.push('');
    l.matches.forEach((m) => lines.push(`${m.name1} ${m.legs1}:${m.legs2} ${m.name2}`));

    const extra: string[] = [];
    if (h?.topAverage) {
      extra.push(
        pick(
          [
            `Najwyższą średnią tygodnia może pochwalić się ${h.topAverage.name} – ${h.topAverage.value.toFixed(2)}.`,
            `Najwyższa średnia tygodnia: ${h.topAverage.value.toFixed(2)} – ${h.topAverage.name}.`,
            `Średnia tygodnia: ${h.topAverage.name} z wynikiem ${h.topAverage.value.toFixed(2)}.`,
          ],
          seed,
          li + 1
        )
      );
    }
    if (h?.bestLeg) extra.push(`Best leg tygodnia: ${h.bestLeg.name} – ${h.bestLeg.value}.`);
    if (h?.topCheckout) {
      extra.push(
        h.topCheckout.value >= 100
          ? `Wysoki finisz tygodnia: checkout ${h.topCheckout.value} – ${h.topCheckout.name}!`
          : `Najwyższy checkout tygodnia: ${h.topCheckout.name} – ${h.topCheckout.value}.`
      );
    }

    const draws = l.matches.filter((m) => m.legs1 === m.legs2 && m.legs1 > 0);
    const close = l.matches
      .filter((m) => Math.abs(m.legs1 - m.legs2) === 1)
      .sort((a, b) => b.legs1 + b.legs2 - (a.legs1 + a.legs2))[0];
    const clean = l.matches.filter((m) => (m.legs1 === 0) !== (m.legs2 === 0));
    if (draws.length > 0) {
      extra.push(`Remisem zakończył${draws.length > 1 ? 'y się mecze' : ' się mecz'}: ${draws.map(score).join(', ')}.`);
    } else if (close) {
      extra.push(pick([`Najbardziej wyrównany mecz: ${score(close)}.`, `Do ostatniego lega: ${score(close)}.`], seed, li + 2));
    }
    if (clean.length > 0 && clean.length <= 2) {
      extra.push(`Bez straty lega: ${clean.map(score).join(', ')}.`);
    }

    if (options.includeTable) extra.push(...tableSentences(l, seed + li));

    if (extra.length > 0) lines.push('', ...extra);
  });

  lines.push('', '#LSDD #DartDębica #darts');
  return lines.join('\n');
}
