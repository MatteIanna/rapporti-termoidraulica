const CACHE_NAME = 'termoidraulica-v1';

// Elenco dei file da memorizzare localmente sul telefono
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json'
];

// Installazione: crea la cache e memorizza i file necessari
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache inizializzata con successo');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting()) // Forza l'attivazione immediata del nuovo service worker
  );
});

// Attivazione: elimina le vecchie cache inutilizzate quando si aggiorna l'applicazione
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Rimozione vecchia cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Prende immediatamente il controllo delle pagine aperte
  );
});

// Gestione delle richieste: priorità alla cache se offline, altrimenti scarica da rete
self.addEventListener('fetch', event => {
  // Gestisce solo le richieste verso risorse interne (esclude script esterni o chiamate POST a Google)
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request);
        })
    );
  }
});
