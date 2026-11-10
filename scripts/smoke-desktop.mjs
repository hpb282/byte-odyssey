import { _electron as electron } from '@playwright/test';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const directory = await mkdtemp(join(tmpdir(), 'byte-desktop-'));
const executable = process.argv[2] ? resolve(process.argv[2]) : undefined;
const args =
  process.platform === 'linux' ? ['--no-sandbox', '--ozone-platform=headless', '--disable-gpu'] : [];
if (!executable) args.push('.');
const options = {
  executablePath: executable,
  args,
  env: { ...process.env, BYTE_ODYSSEY_USER_DATA: directory },
  timeout: 30000,
};
let app;
try {
  app = await electron.launch(options);
  const page = await app.firstWindow();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page
    .getByRole('button', { name: /Bắt đầu chơi/i })
    .first()
    .click();
  await page.getByLabel('Tên học sinh').fill('Kiểm tra desktop');
  await page.getByRole('button', { name: 'Tạo và chọn hồ sơ' }).click();
  await page.getByRole('button', { name: /Nhận diện chữ/ }).click();
  await page.getByRole('button', { name: /Tiếp tục/ }).click();
  await page.getByRole('button', { name: /Đường chạy phiêu lưu/ }).click();
  await page.getByRole('button', { name: /Tiếp tục/ }).click();
  await page.getByRole('button', { name: 'Robot Byte', exact: true }).click();
  await page.getByRole('button', { name: /Tiếp tục/ }).click();
  await page.getByRole('button', { name: 'Rừng xanh', exact: true }).click();
  await page.getByRole('button', { name: /Bắt đầu chơi/i }).click();
  await page.locator('.question-panel').waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  await mkdir('.cache', { recursive: true });
  await page.screenshot({ path: '.cache/desktop-smoke.png', fullPage: true });
  await app.close();
  app = undefined;
  app = await electron.launch(options);
  const reopened = await app.firstWindow();
  await reopened.getByRole('button', { name: /Tiếp tục lượt chơi/ }).waitFor();
  const saved = await reopened.evaluate(() => JSON.parse(localStorage.getItem('byte-odyssey:data:v1')));
  if (saved.profiles[0]?.name !== 'Kiểm tra desktop') throw new Error('Desktop did not retain profile.');
  console.log('Desktop smoke passed: packaged/file assets, setup, gameplay, profile persistence, resume.');
} finally {
  if (app) await app.close();
  await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}
