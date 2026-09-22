'use client';

import { useState } from 'react';
import TreningView from '@/components/TreningView';
import SessionTrainingView from '@/components/SessionTrainingView';

type Mode = 'menu' | 'pyramid' | 'double' | 'triple';

export default function TreningHub({ myTpid, average }: { myTpid: string; average: number | null }) {
  const [mode, setMode] = useState<Mode>('menu');

  if (mode === 'pyramid') {
    return (
      <div>
        <BackButton onClick={() => setMode('menu')} />
        <TreningView myTpid={myTpid} average={average} />
      </div>
    );
  }

  if (mode === 'double') {
    return (
      <div>
        <BackButton onClick={() => setMode('menu')} />
        <SessionTrainingView type="double" myTpid={myTpid} />
      </div>
    );
  }

  if (mode === 'triple') {
    return (
      <div>
        <BackButton onClick={() => setMode('menu')} />
        <SessionTrainingView type="triple" myTpid={myTpid} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Treningi</h2>
      <p className="text-slate-400 text-sm mb-6">Wybierz rodzaj treningu na dziś</p>

      <div className="space-y-3">
        <button
          onClick={() => setMode('pyramid')}
          className="w-full text-left p-5 bg-ink-800/60 border border-ink-700 hover:border-brand/40 rounded-2xl transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-white">🎯 Darterska Piramida Treningowa</h3>
          </div>
          <p className="text-sm text-slate-400">
            Progresywne wyzwania z minutnikiem, dopasowane do Twojej średniej - od podstaw do mistrzostwa.
          </p>
        </button>

        <button
          onClick={() => setMode('double')}
          className="w-full text-left p-5 bg-ink-800/60 border border-ink-700 hover:border-red-400/40 rounded-2xl transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-white">🔴 Trening Double</h3>
          </div>
          <p className="text-sm text-slate-400">
            Pełna sesja (75 lub 115 min): rozgrzewka, podwójne sektory, symulacja meczu, trening mentalny.
          </p>
        </button>

        <button
          onClick={() => setMode('triple')}
          className="w-full text-left p-5 bg-ink-800/60 border border-ink-700 hover:border-brand/40 rounded-2xl transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-white">🟢 Trening Triple</h3>
          </div>
          <p className="text-sm text-slate-400">
            Pełna sesja (75 lub 115 min): rozgrzewka, potrójne sektory, symulacja meczu, trening mentalny.
          </p>
        </button>
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-xs text-slate-500 hover:text-slate-300 mb-4 flex items-center gap-1">
      ← Wróć do wyboru treningu
    </button>
  );
}
