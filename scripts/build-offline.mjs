import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
const root = 'dist';
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : join(dir, entry.name))),
    )
  ).flat();
}
const files = (await walk(root)).filter((file) => !file.endsWith('sw.js'));
const digest = createHash('sha256');
for (const file of files.sort()) digest.update(await readFile(file));
const version = digest.digest('hex').slice(0, 16);
const paths = files.map((file) => './' + relative(root, file).replaceAll('\\', '/'));
await writeFile(
  join(root, 'sw.js'),
  `
const CACHE = 'byte-odyssey-${version}';
const FILES = ${JSON.stringify(paths)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('byte-odyssey-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  // Chỉ cache tài nguyên tĩnh cùng nguồn. Origin của fetch cài cache khác
  // Origin của thẻ module/CSS; Vary: Origin không được làm mất bản offline.
  event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request, { ignoreVary: true }).then(hit => hit || fetch(event.request).catch(async error => {
    if (event.request.mode === 'navigate') return await cache.match(new URL('./index.html', self.registration.scope), { ignoreVary: true }) || new Response('Hãy kết nối mạng một lần để tải lại Byte Odyssey.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    throw error;
  }))));
});
`,
);
console.log('Offline cache:', files.length, 'files, revision', version);
