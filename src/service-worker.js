// src/service-worker.js

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst()
);

registerRoute(
  ({ request }) => request.destination === 'script' ||
                  request.destination === 'style',
  new StaleWhileRevalidate()
);
