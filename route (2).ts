import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:kontakt@dartdebica.pl';
const ADMIN_SECRET = process.env.ADMIN_SECRET;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

interface StoredSub {
  subscription: PushSubscriptionJSON;
  tpid: string;
  leagueId: string;
  playerName: string | null;
  updatedAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret, title, message, leagueId, tpid, url } = body || {};

    if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Brak dostępu' }, { status: 401 });
    }
    if (!title || !message) {
      return NextResponse.json({ error: 'Podaj tytuł i treść' }, { status: 400 });
    }

    const keys = (await kv.smembers('sub:all')) as string[];
    if (!keys || keys.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, info: 'Brak zapisanych subskrypcji' });
    }

    let sent = 0;
    let removed = 0;

    await Promise.all(
      keys.map(async (key) => {
        const entry = (await kv.get(key)) as StoredSub | null;
        if (!entry) return;

        // Filtrowanie: konkretny gracz, konkretna liga, albo wszyscy (gdy nic nie podano)
        if (tpid && entry.tpid !== tpid) return;
        if (!tpid && leagueId && entry.leagueId !== leagueId) return;

        try {
          await webpush.sendNotification(
            entry.subscription as any,
            JSON.stringify({ title, body: message, url: url || '/' })
          );
          sent++;
        } catch (err: any) {
          // Subskrypcja wygasła / telefon odinstalował apkę - sprzątamy
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await kv.del(key);
            await kv.srem('sub:all', key);
            removed++;
          }
        }
      })
    );

    return NextResponse.json({ ok: true, sent, removed });
  } catch (err) {
    return NextResponse.json({ error: 'Błąd wysyłki' }, { status: 500 });
  }
}
