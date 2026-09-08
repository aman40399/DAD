// Singh Monster Service Worker - Web Push & Background Sync

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Listen for push events sent by the Singh Monster server
self.addEventListener('push', (event) => {
  let data = {
    title: 'Singh Monster — Breaking News',
    body: 'New investigative dispatch published by Dhananjay Singh.',
    url: '/',
    icon: '/authr.png',
    badge: '/authr.png',
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      data = { ...data, ...payload }
    } catch (e) {
      try {
        data.body = event.data.text()
      } catch (err) {}
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/authr.png',
    badge: data.badge || '/authr.png',
    image: data.imageUrl || undefined,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    vibrate: [100, 50, 100],
    requireInteraction: Boolean(data.isBreaking),
    tag: data.tag || 'singh-monster-news',
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification click: focus or open the article page
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open with the site, focus and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl)) {
            return client.focus()
          }
          if (client.navigate) {
            return client.navigate(targetUrl).then((c) => c?.focus())
          }
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
