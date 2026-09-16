'use client';

import { StandingRow, MatchResultRow, PlayerStatRow } from '@/lib/standings';
import LeaguePositionCard from '@/components/LeaguePositionCard';
import RingProgress from '@/components/RingProgress';

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-brand to-brand-dark flex items-center justify-center text-2xl font-extrabold text-white shadow-glow mb-3">
          {playerName.trim().charAt(0).toUpperCase()}
        </div>
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
            <Stat label="Best leg" value={myStats.bestLeg ?? '-'} />
            <Stat label="High out" value={myStats.highOut ?? '-'} />
            <Stat label="Mecze (W)" value={`${myStats.matches} (${myStats.matchesWon})`} />
          </div>
        ) : (
          <p className="text-sm text-slate-500 mb-3">Brak zapisanych statystyk.</p>
        )}

        {myStats && (myStats.t100 + myStats.t140 + myStats.t170 + myStats.t180 > 0) && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Rozkład rzutów punktowanych</p>
            <MilestoneDonut
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

function MilestoneDonut({ milestones }: { milestones: { label: string; value: number; color: string }[] }) {
  const total = milestones.reduce((sum, m) => sum + m.value, 0);
  if (total === 0) return null;

  let cumulative = 0;
  const stops = milestones.map((m) => {
    const start = (cumulative / total) * 360;
    cumulative += m.value;
    const end = (cumulative / total) * 360;
    return `${m.color} ${start}deg ${end}deg`;
  });

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-28 h-28 rounded-full shrink-0" style={{ background: `conic-gradient(${stops.join(', ')})` }}>
        <div className="absolute inset-3 rounded-full bg-ink-800 flex items-center justify-center">
          <span className="text-lg font-extrabold text-white">{total}</span>
        </div>
      </div>
      <div className="space-y-1.5 text-xs flex-1">
        {milestones.map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
            <span className="text-slate-300 font-medium">{m.label}</span>
            <span className="text-white font-bold ml-auto">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
