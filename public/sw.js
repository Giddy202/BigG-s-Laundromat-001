// Service Worker for BigG's Laundromat
const CACHE_NAME = 'biggs-laundromat-v6';
const urlsToCache = [
    '/',
    '/index.html',
    '/laundry.html',
    '/upholstery.html',
    '/hotels.html',
    '/auto.html',
    '/assets/css/style.css',
    '/assets/css/responsive.css',
    '/assets/css/services.css',
    '/assets/css/animations.css',
    '/assets/js/main.js',
    '/assets/js/services.js',
    '/assets/js/service-page.js',
    '/assets/js/animations.js',
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                return fetch(event.request).catch(() => {
                    // If fetch fails, return a fallback response for images
                    if (event.request.destination === 'image') {
                        return new Response('', {
                            status: 200,
                            statusText: 'OK',
                            headers: { 'Content-Type': 'image/svg+xml' }
                        });
                    }
                    throw new Error('Network request failed');
                });
            }
        )
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Cache cleared, checkout.html removed from cache');
            return self.clients.claim();
        })
    );
});
