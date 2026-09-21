'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

type Status = 'unsupported' | 'default' | 'granted' | 'denied' | 'loading';

export default function NotificationOptIn({
  tpid,
  leagueId,
  playerName,
}: {
  tpid: string;
  leagueId: string;
  playerName: string;
}) {
  const [status, setStatus] = useState<Status>('default');
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }
    setStatus(Notification.permission as Status);

    fetch('/api/push/vapid-key')
      .then((r) => r.json())
      .then((d) => setVapidKey(d.publicKey))
      .catch(() => setVapidKey(null));
  }, []);

  // Gdy zmieni się wybrany gracz, a powiadomienia są już włączone - po cichu przypinamy
  // istniejącą subskrypcję do nowej osoby, bez ponownego pytania o zgodę.
  useEffect(() => {
    if (status !== 'granted') return;
    (async () => {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: existing.toJSON(), tpid, leagueId, playerName }),
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tpid, leagueId, status]);

  async function enableNotifications() {
    if (!vapidKey) return;
    setStatus('loading');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission as Status);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
        });
      }

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), tpid, leagueId, playerName }),
      });

      setStatus('granted');
    } catch {
      setStatus('default');
    }
  }

  if (status === 'unsupported') {
    return (
      <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl text-sm text-slate-400">
        Ta przeglądarka nie obsługuje powiadomień push. Na iPhone upewnij się, że apka jest dodana do ekranu głównego.
      </div>
    );
  }

  if (status === 'granted') {
    return (
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-sm text-emerald-400 font-semibold">
        ✓ Powiadomienia włączone dla tego telefonu
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="p-4 bg-ink-800/50 border border-ink-700/60 rounded-2xl text-sm text-slate-400">
        Powiadomienia zostały zablokowane. Żeby je włączyć, zmień to ręcznie w ustawieniach przeglądarki dla tej strony.
      </div>
    );
  }

  return (
    <button
      onClick={enableNotifications}
      disabled={status === 'loading' || !vapidKey}
      className="w-full py-2.5 rounded-xl bg-gradient-to-b from-brand to-brand-dark text-white text-sm font-semibold shadow-glow disabled:opacity-50"
    >
      {status === 'loading' ? 'Włączanie...' : '🔔 Włącz powiadomienia'}
    </button>
  );
}
