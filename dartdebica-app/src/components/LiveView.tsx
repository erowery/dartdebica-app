'use client';

import { calcAverage } from '@/lib/standings';

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function LiveView({
  liveMatches,
  myTpid,
  leagueNakkaId,
}: {
  liveMatches: any[];
  myTpid: string;
  leagueNakkaId: string;
}) {
  const parseMatchDetails = (match: any) => {
    const p1 = match.statsData?.[0] || {};
    const p2 = match.statsData?.[1] || {};

    const p1Name = p1.name || 'Gracz 1';
    const p2Name = p2.name || 'Gracz 2';
    const p1Avg = calcAverage(p1.allScore || 0, p1.allDarts || 0);
    const p2Avg = calcAverage(p2.allScore || 0, p2.allDarts || 0);
    const leg1 = p1.winLegs ?? 0;
    const leg2 = p2.winLegs ?? 0;
    const isMine = p1.tpid === myTpid || p2.tpid === myTpid;

    const tmid = match.tmid || match.mid;
    const nakkaMatchUrl = tmid
      ? `https://n01darts.com/n01/league/n01_view.html?tmid=${tmid}`
      : `https://n01darts.com/n01/league/season.php?id=${leagueNakkaId}`;

    return { p1Name, p2Name, p1Avg, p2Avg, leg1, leg2, isMine, nakkaMatchUrl };
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Mecze Na Żywo</h2>
      {liveMatches.length > 0 ? (
        <div className="space-y-4">
          {liveMatches.map((match: any, idx: number) => {
            const { p1Name, p2Name, p1Avg, p2Avg, leg1, leg2, isMine, nakkaMatchUrl } = parseMatchDetails(match);

            return (
              <div
                key={idx}
                className={`relative p-4 sm:p-5 bg-ink-800/60 border rounded-2xl flex flex-col gap-4 overflow-hidden ${
                  isMine ? 'border-gold/50' : 'border-brand/25'
                }`}
              >
                <div className="absolute inset-0 bg-radial-fade pointer-events-none" />

                <div className="relative flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                    </span>
                    LIVE
                  </span>
                  {isMine && (
                    <span className="text-[11px] bg-gold/15 text-gold border border-gold/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                      Twój mecz
                    </span>
                  )}
                  <a
                    href={nakkaMatchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-ink-700/70 hover:bg-ink-700 text-slate-200 border border-ink-600 px-3 py-1 rounded-lg font-semibold transition-colors"
                  >
                    Otwórz w Nakka ↗
                  </a>
                </div>

                <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="hidden sm:flex shrink-0 w-9 h-9 rounded-full bg-ink-700 border border-ink-600 items-center justify-center font-bold text-slate-300 text-sm">
                      {initials(p1Name)}
                    </span>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-white text-sm sm:text-base truncate">{p1Name}</span>
                      {p1Avg !== null && <span className="text-[11px] text-gold font-medium w-fit">śr. {p1Avg}</span>}
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-ink-700 to-ink-800 text-white font-extrabold text-base sm:text-lg px-4 py-1.5 rounded-xl border border-ink-600 whitespace-nowrap shadow-lg">
                    {leg1} <span className="text-slate-500">-</span> {leg2}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 overflow-hidden text-right">
                    <div className="flex flex-col items-end overflow-hidden">
                      <span className="font-semibold text-white text-sm sm:text-base truncate">{p2Name}</span>
                      {p2Avg !== null && <span className="text-[11px] text-gold font-medium w-fit">śr. {p2Avg}</span>}
                    </div>
                    <span className="hidden sm:flex shrink-0 w-9 h-9 rounded-full bg-ink-700 border border-ink-600 items-center justify-center font-bold text-slate-300 text-sm">
                      {initials(p2Name)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-400 text-sm">Aktualnie żaden mecz tej ligi nie jest rozgrywany na żywo.</p>
      )}
    </div>
  );
}
