const cacheName = 'cha-price-1';
const filesToCache = [
  '/',
  '/index.html',
  '/static/css/material.indigo-pink.min.css',
  '/static/css/googlefonts.css',
  '/static/js/material.min.js',
  '/static/js/cha-price.min.js',
  '/static/js/notifications.js',
  '/static/js/registration.js',
  '/static/js/app.js',
  '/static/images/icons/icon-72x72.png',
  '/static/fonts/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2'
];

self.addEventListener('install', e => {
  console.log('[ServiceWorker] Install')
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('[ServiceWorker] Caching app shell')
      return cache.addAll(filesToCache)
    })
  )
})

self.addEventListener('activate', e => {
  console.log('[ServiceWorker] Activate')
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key)
          return caches.delete(key)
        }
      }))
    })
  )
  return self.clients.claim()
})


self.addEventListener('fetch', e => {
  console.log('[ServiceWorker] Fetch', e.request.url)
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request)
    })
  )
})

self.addEventListener('push', event => {
  let price = '0'
  if (event.data) {
    price = event.data.text()
  }
  const promiseChain = self.registration.showNotification(`Price: ${price}`)
  .then(() => {
    return clients.matchAll({type: 'window'})
    .then(clientList => {
      clientList.forEach(client => client.postMessage(`Price: ${price}`))
    })
  })
  event.waitUntil(promiseChain)
})

self.addEventListener('message', event => {
  console.log(`SW Received Message: ${event.data}`)
  event.postMessage('SW Says \'Hello back!\'')
})
