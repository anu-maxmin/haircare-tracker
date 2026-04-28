// src/lib/usePushNotification.js
import { useState, useEffect } from 'react';

export function usePushNotification() {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  async function subscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        // Fallback: use browser Notification API only (no server push)
        const perm = await Notification.requestPermission();
        setPermission(perm);
        scheduleLocalReminder();
        return { ok: true, type: 'local' };
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      setSubscription(sub);
      setPermission('granted');

      await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subscribe', subscription: sub }),
      });

      scheduleLocalReminder();
      return { ok: true, type: 'push' };
    } catch (err) {
      console.error('Push subscription failed:', err);
      return { ok: false, error: err.message };
    }
  }

  function scheduleLocalReminder() {
    const now = new Date();
    const reminderHour = 20; // 8 PM
    const target = new Date();
    target.setHours(reminderHour, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const delay = target - now;

    setTimeout(async () => {
      const todayKey = formatDate(new Date());
      const completions = JSON.parse(localStorage.getItem('haircare_completions') || '{}');
      const todayDone = completions[todayKey];
      if (!todayDone || !todayDone.allDone) showLocalNotification();
      scheduleLocalReminder();
    }, delay);
  }

  function showLocalNotification() {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready
        .then(reg => {
          reg.showNotification('🌿 HairCare Reminder', {
            body: "You haven't logged today's hair care routine yet!",
            icon: '/icon-192.png',
            tag: 'haircare-daily',
            renotify: true,
          });
        })
        .catch(() => {
          new Notification('🌿 HairCare Reminder', {
            body: "You haven't logged today's hair care routine yet!",
          });
        });
    }
  }

  return { supported, permission, subscription, subscribe };
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
