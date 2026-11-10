// Windows integration: real NSIS download + checksum validation; intercept only OS install handoff.
import { _electron as electron, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, mkdtemp, rm, stat } from 'node:fs/promises';
import { resolve, join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
if (process.platform !== 'win32') throw new Error('This integration must run on Windows.');
const executable = resolve(process.argv[2]);
const metadataPath = resolve('release/latest.yml');
const metadata = (await readFile(metadataPath, 'utf8')).replace(/^version:.*$/m, 'version: 99.0.0');
const directory = await mkdtemp(join(tmpdir(), 'byte-updater-'));
let payloadRequests = 0;
const server = createServer(async (req, res) => {
  try {
    const filename = basename(decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (filename === 'latest.yml') {
      res.writeHead(200, { 'Content-Type': 'text/yaml' });
      res.end(metadata);
      return;
    }
    if (!/^Byte-Odyssey-[\d.]+-Setup-x64\.exe(?:\.blockmap)?$/.test(filename)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const file = resolve('release', filename);
    const info = await stat(file);
    payloadRequests++;
    res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': info.size });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;
let app;
try {
  app = await electron.launch({
    executablePath: executable,
    env: { ...process.env, BYTE_ODYSSEY_USER_DATA: directory },
    timeout: 30000,
  });
  await app.evaluate(({ app }, feed) => {
    const requireApp = process
      .getBuiltinModule('node:module')
      .createRequire(app.getAppPath() + '/package.json');
    const updater = requireApp('electron-updater').autoUpdater;
    updater.setFeedURL({ provider: 'generic', url: feed });
    globalThis.byteInstallCalls = [];
    updater.quitAndInstall = (...args) => {
      globalThis.byteInstallCalls.push(args);
    };
  }, url);
  const page = await app.firstWindow();
  await page
    .getByRole('button', { name: /Bắt đầu chơi/i })
    .first()
    .click();
  await page.getByLabel('Tên học sinh').fill('Giữ hồ sơ khi cập nhật');
  await page.getByRole('button', { name: 'Tạo và chọn hồ sơ' }).click();
  const before = await page.evaluate(() => localStorage.getItem('byte-odyssey:data:v1'));
  await page.getByRole('button', { name: 'Cài đặt', exact: true }).click();
  await page.getByRole('button', { name: 'Cập nhật ứng dụng', exact: true }).click();
  const check = page.getByRole('button', { name: 'Kiểm tra cập nhật', exact: true });
  if (await check.isVisible()) await check.click();
  await page.getByRole('button', { name: 'Cập nhật ngay', exact: true }).waitFor();
  assert.equal(payloadRequests, 0, 'No installer should download before consent.');
  await page.getByRole('button', { name: 'Cập nhật ngay', exact: true }).click();
  await expect
    .poll(() => app.evaluate(() => globalThis.byteInstallCalls.length), { timeout: 120000 })
    .toBe(1);
  assert.ok(payloadRequests > 0, 'The actual installer must have been requested.');
  assert.deepEqual(await app.evaluate(() => globalThis.byteInstallCalls[0]), [true, true]);
  assert.equal(await page.evaluate(() => localStorage.getItem('byte-odyssey:data:v1')), before);
  console.log(
    'Windows updater passed: packaged preload/IPC, feed discovery, real NSIS download and SHA512 verification, one-click consent, saved profile, silent/relaunch install handoff. OS installation is intercepted.',
  );
} catch (error) {
  if (process.env.GITHUB_ACTIONS) {
    const details = String(error.stack || error)
      .replaceAll('%', '%25')
      .replaceAll('\r', '%0D')
      .replaceAll('\n', '%0A');
    console.error(`::error title=Windows updater integration failed::${details}`);
  }
  throw error;
} finally {
  if (app) await app.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}
