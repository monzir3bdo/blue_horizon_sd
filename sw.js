const CACHE_NAME = 'blue-horizon-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/favicon.png',
    '/apple-touch-icon.png',
    '/manifest.json',
    '/tarco.png',
    '/badr.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    'https://images.unsplash.com/photo-1539768942893-daf53e448371?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event Handler
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response if found
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                // Make network request
                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    // Cache the fetched response
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Push Notification Handler
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/favicon.png',
        badge: '/favicon.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Flights',
                icon: '/favicon.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/favicon.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Blue Horizon', options)
    );
});

// Background Sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-flights') {
        event.waitUntil(syncFlights());
    }
});

// Handle offline form submissions
self.addEventListener('backgroundfetchsuccess', (event) => {
    event.waitUntil(
        Promise.all(
            event.registration.matchAll().then((records) => {
                return Promise.all(
                    records.map((record) => {
                        return record.responseReady;
                    })
                );
            })
        )
    );
}); 