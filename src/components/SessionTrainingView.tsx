'use client';

import { useState, useEffect, useRef } from 'react';
import {
  SessionType,
  SessionMinutes,
  getSessionPlan,
  flattenPlan,
  appendSessionLog,
  loadSessionLog,
  SessionLogEntry,
} from '@/lib/sessionTraining';
import { getPhaseFields, generateTrainingFeedback, TrainingFormData, TrainingFeedback } from '@/lib/trainingDiagnostics';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function SessionTrainingView({ type, myTpid }: { type: SessionType; myTpid: string }) {
  const [totalMinutes, setTotalMinutes] = useState<SessionMinutes | null>(null);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [waitingReady, setWaitingReady] = useState(false);
  const [pendingPhaseIndex, setPendingPhaseIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<TrainingFormData>({});
  const [feedback, setFeedback] = useState<TrainingFeedback | null>(null);
  const [log, setLog] = useState<SessionLogEntry[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLog(loadSessionLog(myTpid));
  }, [myTpid]);

  const plan = getSessionPlan(type);
  const exercises = totalMinutes ? flattenPlan(type, totalMinutes) : [];
  const current = exercises[index];

  // Mapowanie: dla każdego indeksu ćwiczenia w spłaszczonej liście - do którego bloku (0-4) należy
  const phaseOfIndex: number[] = [];
  plan.forEach((phase, phaseIdx) => {
    phase.exercises.forEach(() => phaseOfIndex.push(phaseIdx));
  });

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          try {
            navigator.vibrate?.(300);
          } catch {
            // ignore
          }
          const finishedPhase = phaseOfIndex[index];
          const nextIndex = index + 1;
          const crossingPhase = nextIndex >= exercises.length || phaseOfIndex[nextIndex] !== finishedPhase;
          if (crossingPhase) {
            setPendingPhaseIndex(finishedPhase);
          } else {
            setWaitingReady(true);
          }
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

  function pickDuration(m: SessionMinutes) {
    setTotalMinutes(m);
    setIndex(0);
    setFormData({});
    setFeedback(null);
    setPendingPhaseIndex(null);
    setWaitingReady(false);
  }

  function startExercise() {
    if (!current) return;
    setSecondsLeft(current.minutes * 60);
    setRunning(true);
    setWaitingReady(false);
  }

  function continueSamePhase() {
    setIndex((i) => i + 1);
    setWaitingReady(false);
  }

  function submitPhaseForm() {
    if (pendingPhaseIndex === null) return;
    const isLastPhase = pendingPhaseIndex === plan.length - 1;

    if (isLastPhase) {
      const fb = generateTrainingFeedback(formData);
      setFeedback(fb);
      if (totalMinutes) {
        appendSessionLog(myTpid, { date: todayStr(), type, totalMinutes, formData, feedback: fb });
        setLog(loadSessionLog(myTpid));
      }
    } else {
      setIndex((i) => i + 1);
    }
    setPendingPhaseIndex(null);
  }

  function setField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;
  const label = type === 'double' ? 'Trening Double' : 'Trening Triple';
  const color = type === 'double' ? '#f87171' : '#2dd6a7';

  const recentLog = log.filter((e) => e.type === type).slice(-5).reverse();

  function resetToMenu() {
    setTotalMinutes(null);
    setFeedback(null);
  }

  if (!totalMinutes) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-1">{label}</h2>
        <p className="text-slate-400 text-sm mb-5">Wybierz, ile czasu chcesz przeznaczyć na dzisiejszy trening</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[75, 115].map((m) => (
            <button
              key={m}
              onClick={() => pickDuration(m as SessionMinutes)}
              className="py-6 rounded-2xl bg-ink-800/60 border border-ink-700 hover:border-brand/40 text-center transition-all"
            >
              <div className="text-3xl font-extrabold text-white">{m}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">minut</div>
            </button>
          ))}
        </div>

        {recentLog.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Ostatnie sesje</p>
            <div className="space-y-2">
              {recentLog.map((e, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-ink-800/40 border border-ink-700/60 rounded-xl px-4 py-2.5">
                  <span className="text-white">{e.date} · {e.totalMinutes} min</span>
                  <span className="font-bold text-gold">{e.feedback.score}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (feedback) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-1">{feedback.summary_title}</h2>
        <p className="text-slate-400 text-sm mb-5">{label} · {totalMinutes} minut · Ocena {feedback.score}/10</p>

        <div className="p-4 bg-gold/10 border border-gold/30 rounded-2xl mb-4">
          <p className="text-xs uppercase tracking-wider text-gold mb-2">Rada trenerska</p>
          <p className="text-sm text-slate-200 leading-relaxed">{feedback.coach_advice}</p>
        </div>

        {feedback.positives.length > 0 && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-emerald-400 mb-2">Mocne strony</p>
            <div className="space-y-1.5">
              {feedback.positives.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 shrink-0">✓</span> {p}
                </div>
              ))}
            </div>
          </div>
        )}

        {feedback.negatives.length > 0 && (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider text-red-400 mb-2">Do poprawy</p>
            <div className="space-y-1.5">
              {feedback.negatives.map((n, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-red-400 shrink-0">✗</span> {n}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={resetToMenu}
          className="w-full py-2.5 rounded-xl text-white text-sm font-semibold shadow-glow"
          style={{ background: `linear-gradient(to bottom, ${color}, ${color}bb)` }}
        >
          Zakończ
        </button>
      </div>
    );
  }

  if (pendingPhaseIndex !== null) {
    const fields = getPhaseFields(pendingPhaseIndex, type);
    const isLastPhase = pendingPhaseIndex === plan.length - 1;
    const allAnswered = fields.every((f) => !!formData[f.field as keyof TrainingFormData]);
    const scoreReady = !isLastPhase || typeof formData.OVERALL_SCORE === 'number';

    return (
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Blok ukończony</p>
        <h2 className="text-lg font-bold text-white mb-5">{plan[pendingPhaseIndex].name}</h2>

        <div className="space-y-5 mb-6">
          {fields.map((f) => (
            <div key={f.field}>
              <p className="text-sm text-slate-300 font-medium mb-2">{f.label}</p>
              <div className="flex flex-wrap gap-2">
                {f.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setField(f.field, opt)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      formData[f.field as keyof TrainingFormData] === opt
                        ? 'text-white border-transparent'
                        : 'bg-ink-800/60 border-ink-700 text-slate-400 hover:text-slate-200'
                    }`}
                    style={
                      formData[f.field as keyof TrainingFormData] === opt
                        ? { background: `linear-gradient(to bottom, ${color}, ${color}bb)` }
                        : {}
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {isLastPhase && (
            <div>
              <p className="text-sm text-slate-300 font-medium mb-2">Jak oceniasz cały trening?</p>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setFormData((prev) => ({ ...prev, OVERALL_SCORE: n }))}
                    className={`py-2.5 rounded-lg font-bold text-sm ${
                      formData.OVERALL_SCORE === n ? 'text-white' : 'bg-ink-800/60 border border-ink-700 text-slate-400'
                    }`}
                    style={formData.OVERALL_SCORE === n ? { background: `linear-gradient(to bottom, ${color}, ${color}bb)` } : {}}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={submitPhaseForm}
          disabled={!allAnswered || !scoreReady}
          className="w-full py-2.5 rounded-xl text-white text-sm font-semibold shadow-glow disabled:opacity-40"
          style={{ background: `linear-gradient(to bottom, ${color}, ${color}bb)` }}
        >
          {isLastPhase ? 'Zakończ i przeanalizuj trening' : 'Dalej'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
        {current.phaseName} · Ćwiczenie {index + 1} z {exercises.length}
      </p>
      <h2 className="text-lg font-bold text-white mb-4">{label}</h2>

      <div className="p-5 bg-ink-800/60 border rounded-2xl" style={{ borderColor: `${color}55` }}>
        <h3 className="text-base font-semibold text-white mb-1">{current.title}</h3>
        <p className="text-sm text-slate-400 mb-4">{current.description}</p>

        {waitingReady ? (
          <div>
            <p className="text-sm text-emerald-400 font-semibold mb-4 text-center">
              Ćwiczenie zakończone! Odpocznij chwilę, a gdy będziesz gotowy - zacznij kolejne.
            </p>
            <button
              onClick={continueSamePhase}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold shadow-glow"
              style={{ background: `linear-gradient(to bottom, ${color}, ${color}bb)` }}
            >
              Gotowy - następne ćwiczenie
            </button>
          </div>
        ) : running ? (
          <div className="text-center py-4">
            <span className="text-5xl font-extrabold text-white tabular-nums">
              {mm}:{pad(ss)}
            </span>
          </div>
        ) : (
          <button
            onClick={startExercise}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold shadow-glow"
            style={{ background: `linear-gradient(to bottom, ${color}, ${color}bb)` }}
          >
            Rozpocznij ({current.minutes} min)
          </button>
        )}
      </div>

      <button onClick={resetToMenu} className="mt-4 text-xs text-slate-500 hover:text-slate-300 mx-auto block">
        Przerwij trening
      </button>
    </div>
  );
}
