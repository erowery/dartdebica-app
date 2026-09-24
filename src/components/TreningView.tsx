'use client';

import { useState, useEffect, useRef } from 'react';
import {
  PYRAMID_TIERS,
  CHALLENGE_MINUTES,
  suggestTierId,
  loadProgress,
  saveProgress,
  appendPyramidLog,
  loadPyramidLog,
  TierId,
  PyramidProgress,
  PyramidLogEntry,
} from '@/lib/training';
import { IconStopwatch } from '@/components/icons';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Płaska pozycja wyzwania w całej piramidzie (0-8): poziom 1 = 0-4, poziom 2 = 5-7, poziom 3 = 8 */
function flatPosition(poziom: 1 | 2 | 3, index: number): number {
  if (poziom === 1) return index;
  if (poziom === 2) return 5 + index;
  return 8;
}

export default function TreningView({ myTpid, average }: { myTpid: string; average: number | null }) {
  const suggested = suggestTierId(average);
  const [tierId, setTierId] = useState<TierId>(suggested);
  const tier = PYRAMID_TIERS.find((t) => t.id === tierId)!;

  const [progress, setProgress] = useState<PyramidProgress>(() => loadProgress(myTpid, tierId));
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [attemptFailed, setAttemptFailed] = useState(false);
  const [lastFailWasFinal, setLastFailWasFinal] = useState(false);
  const [justCompletedTier, setJustCompletedTier] = useState(false);
  const [log, setLog] = useState<PyramidLogEntry[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setProgress(loadProgress(myTpid, tierId));
    setRunning(false);
    setAttemptFailed(false);
    setJustCompletedTier(false);
  }, [myTpid, tierId]);

  useEffect(() => {
    setLog(loadPyramidLog(myTpid));
  }, [myTpid]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          handleFail();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const currentLevel = tier.levels.find((l) => l.poziom === progress.poziom)!;
  const currentChallenge = currentLevel.challenges[progress.index];

  function startAttempt() {
    setSecondsLeft(CHALLENGE_MINUTES * 60);
    setRunning(true);
    setAttemptFailed(false);
  }

  function handleFail() {
    try {
      navigator.vibrate?.(400);
    } catch {
      // brak wibracji - nic się nie dzieje
    }
    setAttemptFailed(true);
    setLastFailWasFinal(progress.poziom === 3);

    let next: PyramidProgress;
    if (progress.poziom === 3) {
      // Nieudany test końcowy - cała piramida od nowa
      next = { poziom: 1, index: 0, completed: false };
    } else {
      // Powrót do pierwszego wyzwania tego samego poziomu
      next = { ...progress, index: 0 };
    }
    setProgress(next);
    saveProgress(myTpid, tierId, next);
  }

  function handleSuccess() {
    setRunning(false);
    try {
      navigator.vibrate?.([100, 60, 100]);
    } catch {
      // ignore
    }

    appendPyramidLog(myTpid, {
      date: todayStr(),
      tierId,
      tierTitle: tier.title,
      poziom: progress.poziom,
      challenge: currentChallenge,
    });
    setLog(loadPyramidLog(myTpid));

    const isLastInLevel = progress.index + 1 >= currentLevel.challenges.length;

    let next: PyramidProgress;
    if (!isLastInLevel) {
      next = { ...progress, index: progress.index + 1 };
    } else if (progress.poziom < 3) {
      next = { poziom: (progress.poziom + 1) as 1 | 2 | 3, index: 0, completed: false };
    } else {
      // Ukończono poziom 3 - cała piramida zaliczona!
      next = { poziom: 1, index: 0, completed: true, completedAt: todayStr() };
      setJustCompletedTier(true);
    }
    setProgress(next);
    saveProgress(myTpid, tierId, next);
  }

  function restartTier() {
    const fresh: PyramidProgress = { poziom: 1, index: 0, completed: false };
    setProgress(fresh);
    saveProgress(myTpid, tierId, fresh);
    setJustCompletedTier(false);
  }

  const currentFlat = flatPosition(progress.poziom, progress.index);
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Darterska Piramida Treningowa</h2>
      <p className="text-slate-400 text-sm mb-5">Wyzwania krok po kroku - od podstaw do mistrzostwa</p>

      {/* Wybór poziomu */}
      <div className="flex gap-1 mb-5 p-1 rounded-2xl bg-ink-800/60 border border-ink-700 text-xs overflow-x-auto">
        {PYRAMID_TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTierId(t.id)}
            className={`flex-1 whitespace-nowrap py-2 px-2 rounded-xl font-semibold transition-all ${
              tierId === t.id ? 'text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
            }`}
            style={tierId === t.id ? { background: `linear-gradient(to bottom, ${t.color}, ${t.color}cc)` } : {}}
          >
            {t.title}
          </button>
        ))}
      </div>

      {tierId === suggested && (
        <p className="text-[11px] text-slate-500 mb-4 -mt-3">
          ⭐ Sugerowany dla Ciebie poziom na podstawie Twojej średniej{average ? ` (${average.toFixed(1)})` : ''}
        </p>
      )}

      {/* Mapa piramidy */}
      <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl mb-5">
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 text-center">{tier.subtitle}</p>
        <div className="space-y-2 flex flex-col items-center">
          {[3, 2, 1].map((poz) => {
            const level = tier.levels.find((l) => l.poziom === poz)!;
            return (
              <div key={poz} className="flex gap-1.5">
                {level.challenges.map((_, i) => {
                  const flat = flatPosition(poz as 1 | 2 | 3, i);
                  const state = flat < currentFlat || progress.completed ? 'done' : flat === currentFlat ? 'current' : 'locked';
                  return (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        state === 'done'
                          ? 'bg-emerald-500/80 text-white'
                          : state === 'current'
                          ? 'text-black animate-pulse'
                          : 'bg-ink-700/60 text-slate-600'
                      }`}
                      style={state === 'current' ? { backgroundColor: tier.color } : {}}
                    >
                      {state === 'done' ? '✓' : poz}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {(currentFlat > 0 || progress.completed) && !justCompletedTier && (
        <button
          onClick={restartTier}
          className="w-full mb-6 py-2 rounded-xl text-xs font-semibold bg-ink-800/40 border border-ink-700 text-slate-500 hover:text-red-400 hover:border-red-500/40 transition-all"
        >
          ↺ Resetuj postęp tego poziomu
        </button>
      )}

      {justCompletedTier ? (
        <div className="p-5 bg-gold/10 border-2 border-gold/50 rounded-2xl text-center mb-6">
          <p className="text-3xl mb-2">🏆</p>
          <p className="text-lg font-extrabold text-white mb-1">Piramida ukończona!</p>
          <p className="text-sm text-slate-400 mb-4">{tier.title} - gratulacje!</p>
          <button
            onClick={restartTier}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-b from-brand to-brand-dark text-white text-sm font-semibold shadow-glow"
          >
            Zacznij od nowa
          </button>
        </div>
      ) : (
        <div className="p-5 bg-ink-800/60 border rounded-2xl mb-6" style={{ borderColor: `${tier.color}55` }}>
          <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
            Poziom {progress.poziom} · Wyzwanie {progress.index + 1} z {currentLevel.challenges.length}
          </p>
          <p className="text-base font-semibold text-white mb-4">{currentChallenge}</p>

          {!running && !attemptFailed && (
            <button
              onClick={startAttempt}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold shadow-glow"
              style={{ background: `linear-gradient(to bottom, ${tier.color}, ${tier.color}bb)` }}
            >
              Rozpocznij wyzwanie ({CHALLENGE_MINUTES} min)
            </button>
          )}

          {running && (
            <>
              <div className="text-center py-3">
                <span className="text-4xl font-extrabold text-white tabular-nums">
                  {mm}:{pad(ss)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSuccess}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
                >
                  Udało się! ✓
                </button>
                <button
                  onClick={() => {
                    setRunning(false);
                    handleFail();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-ink-700/70 border border-ink-600 text-slate-300 text-sm font-semibold"
                >
                  Poddaj się
                </button>
              </div>
            </>
          )}

          {attemptFailed && !running && (
            <div>
              <p className="text-sm text-red-400 font-semibold mb-3 text-center">
                Czas minął - wracasz na początek {lastFailWasFinal ? 'całej piramidy' : 'tego poziomu'}.
              </p>
              <button
                onClick={startAttempt}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold shadow-glow"
                style={{ background: `linear-gradient(to bottom, ${tier.color}, ${tier.color}bb)` }}
              >
                Spróbuj ponownie
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
