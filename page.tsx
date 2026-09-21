'use client';

import { useState } from 'react';
import { LEAGUES_CONFIG } from '@/config/leagues';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [title, setTitle] = useState('Dart Dębica');
  const [message, setMessage] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function send() {
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, title, message, leagueId: leagueId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`Błąd: ${data.error || 'nieznany'}`);
      } else {
        setStatus(`Wysłano do ${data.sent} odbiorców.${data.removed ? ` Usunięto ${data.removed} nieaktywnych.` : ''}`);
      }
    } catch {
      setStatus('Błąd połączenia.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-md mx-auto">
      <h1 className="text-xl font-extrabold text-white mb-6">Panel powiadomień</h1>

      <div className="space-y-3">
        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500 mb-1 block">Hasło administratora</label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-ink-900/70 border border-ink-700 text-white focus:outline-none focus:border-brand/50"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500 mb-1 block">Do kogo</label>
          <select
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-ink-900/70 border border-ink-700 text-white focus:outline-none focus:border-brand/50"
          >
            <option value="">Wszyscy zawodnicy (wszystkie ligi)</option>
            {LEAGUES_CONFIG.map((l) => (
              <option key={l.id} value={l.id}>
                Tylko {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500 mb-1 block">Tytuł</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-ink-900/70 border border-ink-700 text-white focus:outline-none focus:border-brand/50"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-slate-500 mb-1 block">Treść wiadomości</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl bg-ink-900/70 border border-ink-700 text-white focus:outline-none focus:border-brand/50"
          />
        </div>

        <button
          onClick={send}
          disabled={sending || !secret || !message}
          className="w-full py-2.5 rounded-xl bg-gradient-to-b from-brand to-brand-dark text-white text-sm font-semibold shadow-glow disabled:opacity-40"
        >
          {sending ? 'Wysyłanie...' : 'Wyślij powiadomienie'}
        </button>

        {status && <p className="text-sm text-slate-300 text-center">{status}</p>}
      </div>
    </main>
  );
}
