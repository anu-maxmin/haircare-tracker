import webpush from "web-push";
import { NextResponse } from "next/server";

// In-memory store
const subscriptions = new Map();

function initWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || "admin@haircare.app";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys missing");
  }

  webpush.setVapidDetails("mailto:" + email, publicKey, privateKey);
}

export async function POST(request) {
  try {
    const { action, subscription, title, body } = await request.json();

    // ✅ Initialize ONLY when needed
    initWebPush();

    if (action === "subscribe" && subscription) {
      subscriptions.set(subscription.endpoint, subscription);
      return NextResponse.json({ ok: true });
    }

    if (action === "notify") {
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

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Bad request" },
      { status: 400 },
    );
  }
}
