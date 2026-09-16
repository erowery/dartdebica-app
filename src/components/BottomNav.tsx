'use client';

export type ViewId = 'start' | 'liga' | 'moje' | 'live' | 'profil';

const ITEMS: { id: ViewId; label: string; icon: string }[] = [
  { id: 'start', label: 'Start', icon: '🏠' },
  { id: 'liga', label: 'Liga', icon: '🏆' },
  { id: 'moje', label: 'Moje mecze', icon: '🎯' },
  { id: 'live', label: 'Live', icon: 'live' },
  { id: 'profil', label: 'Profil', icon: '👤' },
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
      <div className="max-w-4xl mx-auto grid grid-cols-5">
        {ITEMS.map((item) => {
          const activeItem = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                activeItem ? 'text-brand-light' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {item.icon === 'live' ? (
                <span className="relative flex h-4 w-4 items-center justify-center">
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
                <span className="text-base leading-none">{item.icon}</span>
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
