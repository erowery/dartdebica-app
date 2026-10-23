'use client';

import { useEffect, useState } from 'react';

type Platform = 'ios' | 'android' | 'other';

function detectPlatform(): Platform {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

function isInstalled(): boolean {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  } catch {
    return false;
  }
}

/**
 * Przycisk "Zainstaluj aplikację". Na Androidzie (Chrome, Edge, Samsung) otwiera systemowe okno instalacji.
 * Na iPhonie i w przeglądarkach bez takiego okna (np. Brave) pokazuje krótką instrukcję.
 * Gdy aplikacja jest już zainstalowana - nic nie pokazuje.
 */
export default function InstallApp({ compact = false }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(true);
  const [platform, setPlatform] = useState<Platform>('other');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setInstalled(isInstalled());
    setPlatform(detectPlatform());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (prompt) {
      prompt.prompt();
      try {
        const choice = await prompt.userChoice;
        if (choice?.outcome === 'accepted') setInstalled(true);
      } catch {}
      setPrompt(null);
    } else {
      setShowHelp((v) => !v);
    }
  }

  return (
    <div className={`rounded-2xl border border-brand/30 bg-gradient-to-b from-brand/10 to-transparent ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" className="w-11 h-11 rounded-xl shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-white leading-tight">Zainstaluj aplikację</p>
          <p className="text-[12.5px] text-slate-400 leading-snug">Ikona na ekranie telefonu, otwieranie jednym dotknięciem</p>
        </div>
      </div>
      <button onClick={install} className="w-full mt-3 py-2.5 rounded-xl bg-brand text-ink-950 text-sm font-extrabold shadow-glow">
        {prompt ? 'Zainstaluj' : showHelp ? 'Ukryj instrukcję' : 'Jak zainstalować?'}
      </button>

      {showHelp && !prompt && (
        <ol className="mt-3 space-y-2 text-[14px] text-slate-300 list-decimal pl-5 leading-snug">
          {platform === 'ios' ? (
            <>
              <li>
                Otwórz tę stronę w przeglądarce <b className="text-white">Safari</b>.
              </li>
              <li>
                Dotknij przycisku <b className="text-white">Udostępnij</b> (kwadrat ze strzałką w górę) na dole ekranu.
              </li>
              <li>
                Wybierz <b className="text-white">Do ekranu początkowego</b> i potwierdź <b className="text-white">Dodaj</b>.
              </li>
            </>
          ) : (
            <>
              <li>
                Otwórz menu przeglądarki – <b className="text-white">trzy kropki</b> w rogu ekranu.
              </li>
              <li>
                Wybierz <b className="text-white">Zainstaluj aplikację</b> albo <b className="text-white">Dodaj do ekranu głównego</b>.
              </li>
              <li>
                Potwierdź <b className="text-white">Zainstaluj / Dodaj</b>.
              </li>
            </>
          )}
        </ol>
      )}
    </div>
  );
}
