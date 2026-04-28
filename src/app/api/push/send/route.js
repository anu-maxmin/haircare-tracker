// src/app/api/push/send/route.js
import webpush from 'web-push';
import { NextResponse } from 'next/server';

webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'admin@haircare.app'),
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

// In-memory store — replace with DB for production
const subscriptions = new Map();

export async function POST(request) {
  try {
    const { action, subscription, title, body } = await request.json();

    // Save subscription
    if (action === 'subscribe' && subscription) {
      subscriptions.set(subscription.endpoint, subscription);
      return NextResponse.json({ ok: true });
    }

    // Send notification to all stored subs
    if (action === 'notify') {
      const payload = JSON.stringify({ title, body });
      const results = [];
      for (const [endpoint, sub] of subscriptions.entries()) {
        try {
          await webpush.sendNotification(sub, payload);
          results.push({ endpoint, ok: true });
        } catch (err) {
          if (err.statusCode === 410) subscriptions.delete(endpoint);
          results.push({ endpoint, ok: false, error: err.message });
        }
      }
      return NextResponse.json({ results });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
