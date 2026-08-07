// public/firebase-messaging-sw.js

// Import Firebase SDK compat versions (service workers don't support ES modules by default without a bundler)
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// Parse the firebaseConfig from the URL query string
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfigParam = urlParams.get('firebaseConfig');

if (firebaseConfigParam) {
  try {
    const firebaseConfig = JSON.parse(decodeURIComponent(firebaseConfigParam));
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Background message handler
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification?.title || 'Novo Item no Bazar!';
      const notificationOptions = {
        body: payload.notification?.body || 'Clique para conferir as novidades.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: payload.data
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (error) {
    console.error('Failed to initialize Firebase in service worker', error);
  }
}

// Handle notification click to open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || self.location.origin;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
