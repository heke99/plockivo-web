// No private response cache, no offline checkout, no forced activation during a purchase.
self.addEventListener('install',()=>{});
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
