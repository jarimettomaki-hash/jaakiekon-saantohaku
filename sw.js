const CACHE='saantokirja-offline-v3';
const LOCAL=['./','./index.html','./manifest.webmanifest','./icon.svg'];
const EXTERNAL=['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs'];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
   const cache=await caches.open(CACHE);
   await cache.addAll(LOCAL);
   for(const url of EXTERNAL){try{const response=await fetch(url,{mode:'cors'});if(response.ok)await cache.put(url,response)}catch(e){}}
   await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
   const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('saantokirja-offline-')&&k!==CACHE).map(k=>caches.delete(k)));
   await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin&&!EXTERNAL.includes(url.href))return;
 event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const hit=await cache.match(event.request,{ignoreSearch:false});
   if(hit)return hit;
   try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response}
   catch(error){if(event.request.mode==='navigate'){const fallback=await cache.match('./index.html');if(fallback)return fallback}throw error}
 })());
});