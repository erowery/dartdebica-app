'use client';

import { StandingRow, MatchResultRow, PlayerStatRow } from '@/lib/standings';
import LeaguePositionCard from '@/components/LeaguePositionCard';
import RingProgress from '@/components/RingProgress';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

export default function ProfilView({
  playerName,
  leagueName,
  myStanding,
  myRank,
  myTpid,
  myResults,
  myStats,
  onReset,
}: {
  playerName: string;
  leagueName: string;
  myStanding: StandingRow | null;
  myRank: number | null;
  myTpid: string;
  myResults: MatchResultRow[];
  myStats: PlayerStatRow | null;
  onReset: () => void;
}) {
  const winPercent = myStanding && myStanding.played > 0 ? (myStanding.won / myStanding.played) * 100 : 0;

  // Średnia z każdego rozegranego meczu, w kolejności od pierwszego do ostatniego - do wykresu trendu
  const averageTrend = myResults
    .map((m) => (m.tpid1 === myTpid ? m.avg1 : m.avg2))
    .filter((a) => a > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-brand to-brand-dark shadow-glow flex items-center justify-center mb-2">
          <svg viewBox="0 0 24 24" className="w-10 h-10">
            <circle cx="12" cy="12" r="9" fill="none" stroke="white" strokeWidth="1.4" opacity="0.9" />
            <circle cx="12" cy="12" r="5.5" fill="none" stroke="white" strokeWidth="1.4" opacity="0.75" />
            <circle cx="12" cy="12" r="2" fill="white" />
          </svg>
        </div>
        <span className="text-xs font-bold tracking-[0.2em] text-gold uppercase mb-2">{initialsOf(playerName)}</span>
        <h1 className="text-xl font-extrabold text-white">{playerName}</h1>
        <p className="text-slate-400 text-sm">{leagueName}</p>
      </div>

      {/* Pozycja w lidze - identyczna karta jak na Start */}
      <LeaguePositionCard
        leagueName={leagueName}
        myStanding={myStanding}
        myRank={myRank}
        myTpid={myTpid}
        myResults={myResults}
      />

      {/* Skuteczność - kołowy wskaźnik */}
      {myStanding && myStanding.played > 0 && (
        <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl flex items-center gap-5">
          <RingProgress percent={winPercent} centerValue={`${Math.round(winPercent)}%`} centerLabel="Wygrane" size={110} />
          <div className="text-sm text-slate-400">
            <p className="text-white font-semibold mb-1">Skuteczność sezonu</p>
            <p>
              {myStanding.won} wygranych na {myStanding.played} rozegranych meczów
            </p>
          </div>
        </div>
      )}

      <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl">
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Statystyki sezonu</p>
        {myStats ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-center mb-5">
            <Stat label="Średnia" value={myStats.average?.toFixed(2) ?? '-'} highlight />
            <Stat label="100+" value={myStats.t100} />
            <Stat label="140+" value={myStats.t140} />
            <Stat label="170+" value={myStats.t170} />
            <Stat label="180" value={myStats.t180} />
            <Stat label="100+ kończ." value={myStats.finishes100} />
            <Stat label="High out" value={myStats.highOut ?? '-'} />
            <Stat label="Best leg" value={myStats.bestLeg ?? '-'} />
          </div>
        ) : (
          <p className="text-sm text-slate-500 mb-3">Brak zapisanych statystyk.</p>
        )}

        {myStats && (myStats.t100 + myStats.t140 + myStats.t170 + myStats.t180 > 0) && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Rozkład rzutów punktowanych</p>
            <MilestoneBarChart
              milestones={[
                { label: '100+', value: myStats.t100, color: '#94a3b8' },
                { label: '140+', value: myStats.t140, color: '#2dd6a7' },
                { label: '170+', value: myStats.t170, color: '#f2b134' },
                { label: '180', value: myStats.t180, color: '#f87171' },
              ]}
            />
          </div>
        )}

        <p className="text-[11px] text-slate-600 mt-4 leading-relaxed">
          Nakka nie udostępnia w publicznym API danych o celności rzutów kończących w double (tylko
          wynik całego lega), dlatego procentu skuteczności w double nie da się tu pokazać.
        </p>
      </div>

      {averageTrend.length >= 2 && (
        <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Trend średniej w sezonie</p>
          <AverageTrendChart values={averageTrend} />
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-2.5 rounded-xl bg-ink-800/60 border border-ink-700 hover:border-brand/40 text-slate-300 hover:text-white text-sm font-semibold transition-all"
      >
        Zmień gracza / ligę
      </button>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="bg-ink-900/60 border border-ink-700/60 rounded-xl py-2.5 px-2">
      <div className={`text-base font-bold ${highlight ? 'text-gold' : 'text-white'}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

/** Kompaktowy wykres słupkowy - liczba tuż nad słupkiem, etykieta tuż pod nim (blisko siebie) */
function MilestoneBarChart({ milestones }: { milestones: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...milestones.map((m) => m.value));

  return (
    <div className="flex items-end justify-between gap-3 h-28">
      {milestones.map((m) => (
        <div key={m.label} className="flex-1 flex flex-col items-center justify-end h-full">
          <span className="text-sm font-bold text-white mb-1">{m.value}</span>
          <div
            className="w-full max-w-[36px] rounded-t-md"
            style={{
              height: `${Math.max((m.value / max) * 100, m.value > 0 ? 6 : 2)}%`,
              backgroundColor: m.color,
            }}
          />
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-1.5">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Wykres liniowy średniej mecz po meczu - widać czy forma rośnie czy spada */
function AverageTrendChart({ values }: { values: number[] }) {
  const width = 300;
  const height = 100;
  const padding = 14;
  const topPadding = 20;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding - topPadding);
    return { x, y };
  });

  const trendUp = values[values.length - 1] >= values[0];
  const color = trendUp ? '#2dd6a7' : '#f87171';

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPoints = `${padding},${height - padding} ${linePoints} ${width - padding},${height - padding}`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" style={{ color }}>
          {trendUp ? '▲' : '▼'}
        </span>
        <span className="text-sm text-slate-300">
          Od <span className="font-bold text-white">{values[0].toFixed(1)}</span> do{' '}
          <span className="font-bold text-white">{values[values.length - 1].toFixed(1)}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28" preserveAspectRatio="none">
        <polygon points={areaPoints} fill={color} opacity={0.12} />
        <polyline points={linePoints} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => {
          const anchor = i === 0 ? 'start' : i === coords.length - 1 ? 'end' : 'middle';
          return (
            <g key={i}>
              <text x={c.x} y={c.y - 8} textAnchor={anchor} fontSize="10" fontWeight="bold" fill={color}>
                {values[i].toFixed(1)}
              </text>
              <circle cx={c.x} cy={c.y} r={2.5} fill={color} />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
        <span>Mecz 1</span>
        <span>Mecz {values.length}</span>
      </div>
    </div>
  );
}
