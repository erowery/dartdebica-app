import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Klucz w KV: subscription:<hash endpointu> -> { tpid, leagueId, subscription, updatedAt }
// Dodatkowo utrzymujemy zbiór "all-endpoints" żeby móc wysłać do wszystkich naraz.

function endpointHash(endpoint: string): string {
  // Prosty, stabilny "hash" bez dodatkowych bibliotek - endpoint sam w sobie jest unikalny,
  // ale zawiera znaki niepasujące do klucza KV, więc kodujemy go do base64url.
  return Buffer.from(endpoint).toString('base64url');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, tpid, leagueId, playerName } = body || {};

    if (!subscription?.endpoint || !tpid || !leagueId) {
      return NextResponse.json({ error: 'Brak wymaganych danych' }, { status: 400 });
    }

    const key = `sub:${endpointHash(subscription.endpoint)}`;

    await kv.set(key, {
      subscription,
      tpid,
      leagueId,
      playerName: playerName || null,
      updatedAt: new Date().toISOString(),
    });

    await kv.sadd('sub:all', key);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Błąd zapisu subskrypcji' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body || {};
    if (!endpoint) return NextResponse.json({ error: 'Brak endpointu' }, { status: 400 });

    const key = `sub:${endpointHash(endpoint)}`;
    await kv.del(key);
    await kv.srem('sub:all', key);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Błąd usuwania subskrypcji' }, { status: 500 });
  }
}
