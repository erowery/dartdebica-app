'use client';

import { useEffect, useState } from 'react';
import AdminTabele from '@/components/admin/AdminTabele';
import AdminTydzien from '@/components/admin/AdminTydzien';

// Ukryty panel - nic w aplikacji tu nie prowadzi. Nowe narzędzia dokładamy jako kolejne zakładki.
const TABS = [
  { id: 'tabele', label: 'Tabele' },
  { id: 'tydzien', label: 'Mecze tygodnia' },
] as const;

type TabId = (typeof TABS)[number]['id'];
const STORAGE_KEY = 'dartdebica_admin_tab';

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>('tabele');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && TABS.some((t) => t.id === saved)) setTab(saved as TabId);
    } catch {}
  }, []);

  function choose(id: TabId) {
    setTab(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  }

  return (
    <main className="min-h-screen bg-ink-950 text-white px-3 py-5">
      <nav className="mx-auto max-w-[640px] mb-5 flex gap-1 p-1 rounded-2xl bg-ink-900 border border-ink-700">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => choose(t.id)}
            className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
              t.id === tab ? 'bg-ink-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {tab === 'tabele' ? <AdminTabele /> : <AdminTydzien />}
    </main>
  );
}
