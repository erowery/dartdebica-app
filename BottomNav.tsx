'use client';

import { IconHome, IconTrophy, IconTarget, IconUser, IconStopwatch } from '@/components/icons';

export type ViewId = 'start' | 'liga' | 'moje' | 'live' | 'trening' | 'profil';

const ITEMS: { id: ViewId; label: string }[] = [
  { id: 'start', label: 'Start' },
  { id: 'liga', label: 'Liga' },
  { id: 'moje', label: 'Moje mecze' },
  { id: 'live', label: 'Live' },
  { id: 'trening', label: 'Trening' },
  { id: 'profil', label: 'Profil' },
];

export default function BottomNav({
  active,
  onChange,
  liveCount,
}: {
  active: ViewId;
  onChange: (v: ViewId) => void;
  liveCount: number;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-ink-900/95 backdrop-blur-md border-t border-ink-700/60">
      <div className="max-w-4xl mx-auto grid grid-cols-6">
        {ITEMS.map((item) => {
          const activeItem = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                activeItem ? 'text-brand-light' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {item.id === 'live' ? (
                <span className="relative flex h-[18px] w-[18px] items-center justify-center">
                  <span className="relative flex h-2 w-2">
                    {liveCount > 0 && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        liveCount > 0 ? 'bg-red-500' : 'bg-slate-600'
                      }`}
                    />
                  </span>
                </span>
              ) : (
                <span className="w-[18px] h-[18px]">
                  {item.id === 'start' && <IconHome className="w-full h-full" />}
                  {item.id === 'liga' && <IconTrophy className="w-full h-full" />}
                  {item.id === 'moje' && <IconTarget className="w-full h-full" />}
                  {item.id === 'trening' && <IconStopwatch className="w-full h-full" />}
                  {item.id === 'profil' && <IconUser className="w-full h-full" />}
                </span>
              )}
              {item.label}
              {activeItem && <span className="absolute -top-px h-0.5 w-8 rounded-full bg-brand-light" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
