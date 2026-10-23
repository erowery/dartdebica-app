'use client';

import { useEffect, useState } from 'react';
import AdminTabele from '@/components/admin/AdminTabele';
import AdminTydzien from '@/components/admin/AdminTydzien';
import AdminZalegle from '@/components/admin/AdminZalegle';
import AdminInstrukcja from '@/components/admin/AdminInstrukcja';
import AdminLiderzy from '@/components/admin/AdminLiderzy';
import AdminSezon from '@/components/admin/AdminSezon';

// Ukryty panel - nic w aplikacji tu nie prowadzi. Nowe narzędzia dokładamy jako kolejne zakładki.
const TABS = [
  { id: 'tabele', label: 'Tabele' },
  { id: 'tydzien', label: 'Mecze tygodnia' },
  { id: 'liderzy', label: 'Liderzy' },
  { id: 'sezon', label: 'Sezon' },
  { id: 'zalegle', label: 'Zaległe' },
  { id: 'instrukcja', label: 'Instrukcja' },
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
    <main className="min-h-screen bg-ink-950 text-white px-2 sm:px-3 py-5">
      <nav className="mx-auto max-w-[640px] mb-5 grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 rounded-2xl bg-ink-900 border border-ink-700">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => choose(t.id)}
            className={`px-1.5 py-2.5 rounded-xl text-[12px] sm:text-[13px] font-bold whitespace-nowrap transition ${
              t.id === tab ? 'bg-ink-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {tab === 'tabele' && <AdminTabele />}
      {tab === 'tydzien' && <AdminTydzien />}
      {tab === 'liderzy' && <AdminLiderzy />}
      {tab === 'sezon' && <AdminSezon />}
      {tab === 'zalegle' && <AdminZalegle />}
      {tab === 'instrukcja' && <AdminInstrukcja />}
    </main>
  );
}
