// src/app/api/push/subscribe/route.js
import { NextResponse } from 'next/server';

// In-memory store — use a DB (Vercel KV / Supabase) for production persistence
const subscriptions = new Map();

export async function POST(request) {
  try {
    const sub = await request.json();
    if (!sub || !sub.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    subscriptions.set(sub.endpoint, sub);
    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const { endpoint } = await request.json();
    subscriptions.delete(endpoint);
    return NextResponse.json({ message: 'Unsubscribed' });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
