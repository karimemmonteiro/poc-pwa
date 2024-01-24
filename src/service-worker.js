import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

// Rota para imagens, utilizando CacheFirst
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      // Personalize os plugins conforme necessário
    ],
  })
);

// Rota para scripts e estilos, utilizando StaleWhileRevalidate
registerRoute(
  ({ request }) => request.destination === 'script' ||
                  request.destination === 'style',
  new StaleWhileRevalidate()
);

// Rota específica para a imagem desconectado.svg
registerRoute(
  ({ url }) => url.pathname.includes('desconectado.svg'),
  new CacheFirst({
    cacheName: 'desconectado-images',
    plugins: [
      // Personalize os plugins conforme necessário
    ],
  })
);
