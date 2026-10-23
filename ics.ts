import { FixtureRow } from '@/lib/standings';

/** Zamiana znaków specjalnych w tekście kalendarza (RFC 5545) */
function esc(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

/**
 * Kalendarz .ics z nierozegranymi meczami zawodnika, które mają datę w terminarzu.
 * Nakka zna tylko dzień meczu (bez godziny), więc wydarzenia są całodniowe.
 * Przypomnienie: dzień wcześniej o 18:00.
 */
export function buildPlayerCalendar(opts: {
  playerName: string;
  myTpid: string;
  leagueName: string;
  fixtures: FixtureRow[];
  calendarId: string;
}): string {
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(
    now.getUTCMinutes()
  )}${pad(now.getUTCSeconds())}Z`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dart Debica Zone//LSDD//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(`Mecze LSDD – ${opts.playerName}`)}`,
    'X-WR-TIMEZONE:Europe/Warsaw',
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
  ];

  opts.fixtures
    .filter((f) => !f.played && f.date && (f.tpid1 === opts.myTpid || f.tpid2 === opts.myTpid))
    .forEach((f) => {
      const d = f.date as Date;
      const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      const opponent = f.tpid1 === opts.myTpid ? f.name2 : f.name1;
      lines.push(
        'BEGIN:VEVENT',
        `UID:${opts.calendarId}-${f.divIndex}-${f.lsid}@dartdebica`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${ymd(d)}`,
        `DTEND;VALUE=DATE:${ymd(next)}`,
        `SUMMARY:${esc(`Dart: ${opts.playerName} – ${opponent}`)}`,
        `DESCRIPTION:${esc(`Mecz ligowy ${opts.leagueName}. Termin z terminarza Nakka.`)}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${esc(`Jutro mecz: ${opponent}`)}`,
        'TRIGGER:-PT6H',
        'END:VALARM',
        'END:VEVENT'
      );
    });

  lines.push('END:VCALENDAR');
  // linie kalendarza kończą się CRLF
  return lines.join('\r\n') + '\r\n';
}
