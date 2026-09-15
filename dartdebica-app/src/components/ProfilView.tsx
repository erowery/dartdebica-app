'use client';

import { StandingRow, PlayerStatRow } from '@/lib/standings';

export default function ProfilView({
  playerName,
  leagueName,
  myStanding,
  myRank,
  myStats,
  onReset,
}: {
  playerName: string;
  leagueName: string;
  myStanding: StandingRow | null;
  myRank: number | null;
  myStats: PlayerStatRow | null;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-brand to-brand-dark flex items-center justify-center text-2xl font-extrabold text-white shadow-glow mb-3">
          {playerName.trim().charAt(0).toUpperCase()}
        </div>
        <h1 className="text-xl font-extrabold text-white">{playerName}</h1>
        <p className="text-slate-400 text-sm">{leagueName}</p>
      </div>

      <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl">
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Pozycja w lidze</p>
        {myStanding ? (
          <div className="flex items-center gap-4">
            <div className="text-3xl font-extrabold text-gold">{myRank ? `#${myRank}` : '-'}</div>
            <div className="text-sm text-slate-400">
              <div>Mecze: <span className="text-white font-semibold">{myStanding.played}</span></div>
              <div>
                Wygrane: <span className="text-emerald-400 font-semibold">{myStanding.won}</span>
                {' · '}
                Przegrane: <span className="text-red-400 font-semibold">{myStanding.lost}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Jeszcze nie rozegrałeś meczu w tabeli.</p>
        )}
      </div>

      <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl">
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Statystyki sezonu</p>
        {myStats ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-center">
            <Stat label="Średnia" value={myStats.average?.toFixed(2) ?? '-'} highlight />
            <Stat label="100+" value={myStats.t100} />
            <Stat label="140+" value={myStats.t140} />
            <Stat label="170+" value={myStats.t170} />
            <Stat label="180" value={myStats.t180} />
            <Stat label="Best leg" value={myStats.bestLeg ?? '-'} />
            <Stat label="High out" value={myStats.highOut ?? '-'} />
            <Stat label="Legi (W)" value={`${myStats.legs} (${myStats.legsWon})`} />
          </div>
        ) : (
          <p className="text-sm text-slate-500">Brak zapisanych statystyk.</p>
        )}
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
