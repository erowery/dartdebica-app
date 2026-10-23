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
          <div className="flex items-center gap-3 mb-2">
            <span className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#f2b13422', border: '1px solid #f2b13466' }}><svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#f2b134" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3 L21 20 H3 Z" /><path d="M7.5 14 H16.5 M9.8 9.5 H14.2" /></svg></span>
            <h3 className="text-base font-bold text-white">Darterska Piramida Treningowa</h3>
          </div>
          <p className="text-sm text-slate-400">
            Progresywne wyzwania z minutnikiem, dopasowane do Twojej średniej - od podstaw do mistrzostwa.
          </p>
        </button>

        <button
          onClick={() => setMode('double')}
          className="w-full text-left p-5 bg-ink-800/60 border border-ink-700 hover:border-red-400/40 rounded-2xl transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#f8717122', border: '1px solid #f8717166' }}><span className="text-[17px] font-extrabold text-red-400">D</span></span>
            <h3 className="text-base font-bold text-white">Trening Podwójnych</h3>
          </div>
          <p className="text-sm text-slate-400">
            Pełna sesja (75 lub 115 min): rozgrzewka, podwójne sektory, symulacja meczu, trening mentalny.
          </p>
        </button>

        <button
          onClick={() => setMode('triple')}
          className="w-full text-left p-5 bg-ink-800/60 border border-ink-700 hover:border-brand/40 rounded-2xl transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#2dd6a722', border: '1px solid #2dd6a766' }}><span className="text-[17px] font-extrabold text-brand">T</span></span>
            <h3 className="text-base font-bold text-white">Trening Potrójnych</h3>
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
    <button onClick={onClick} className="text-sm text-slate-400 hover:text-slate-200 mb-4 flex items-center gap-1">
      ← Wróć do wyboru treningu
    </button>
  );
}
