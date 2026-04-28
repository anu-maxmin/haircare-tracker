self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🌿 HairCare Reminder';
  const options = {
    body: data.body || "Don't forget your hair care routine today!",
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'haircare-reminder',
    renotify: true,
    actions: [
      { action: 'open', title: 'View Routine' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow('/'));
  }
});
