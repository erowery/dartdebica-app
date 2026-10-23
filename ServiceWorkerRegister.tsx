'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // cicho ignorujemy - brak service workera nie blokuje działania apki,
        // tylko ewentualnie automatycznej propozycji instalacji w niektórych przeglądarkach
      });
    }
  }, []);

  return null;
}
