import { _electron as electron, expect } from '@playwright/test';
import { mkdtemp, rm, mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { questionById } from '../src/questions.ts';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
const directory = await mkdtemp(join(tmpdir(), 'byte-desktop-'));
const executable = process.argv[2] ? resolve(process.argv[2]) : undefined;
const previousAsar = process.argv[3];
const packagedAsar = executable ? join(dirname(executable), 'resources/app.asar') : null;
const newAsar = previousAsar ? await readFile(packagedAsar) : null;
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
  if (previousAsar) await copyFile(previousAsar, packagedAsar);
  app = await electron.launch(options);
  const oldVersion = await app.evaluate(({ app }) => app.getVersion());
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
  const question = questionById.get(await page.locator('.question-panel').getAttribute('data-question-id'));
  await page.locator('.answer-options').getByRole('button', { name: question.correct, exact: true }).click();
  await page.locator('.submit-answer').click();
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('byte-odyssey:active:v1')).score))
    .toBe(10);
  await expect(page.locator('.question-panel')).not.toHaveAttribute('data-question-id', question.id);
  await page.getByRole('button', { name: 'Tạm dừng', exact: true }).click();
  const before = await page.evaluate(() => ({
    data: localStorage.getItem('byte-odyssey:data:v1'),
    active: localStorage.getItem('byte-odyssey:active:v1'),
  }));
  if (errors.length) throw new Error(errors.join('\n'));
  await mkdir('.cache', { recursive: true });
  await page.screenshot({ path: '.cache/desktop-smoke.png', fullPage: true });
  await app.close();
  app = undefined;
  if (newAsar) await writeFile(packagedAsar, newAsar);
  app = await electron.launch(options);
  const reopened = await app.firstWindow();
  await reopened.getByRole('button', { name: /Tiếp tục lượt chơi/ }).waitFor();
  const saved = await reopened.evaluate(() => JSON.parse(localStorage.getItem('byte-odyssey:data:v1')));
  const updateState = await reopened.evaluate(() => window.byteUpdates.getState());
  assert.ok(updateState.currentVersion, 'Packaged preload and restricted IPC must work.');
  if (saved.profiles[0]?.name !== 'Kiểm tra desktop') throw new Error('Desktop did not retain profile.');
  assert.deepEqual(
    await reopened.evaluate(() => ({
      data: localStorage.getItem('byte-odyssey:data:v1'),
      active: localStorage.getItem('byte-odyssey:active:v1'),
    })),
    before,
  );
  if (previousAsar) {
    const newVersion = await app.evaluate(({ app }) => app.getVersion());
    assert.notEqual(oldVersion, newVersion);
    console.log(
      `Upgrade passed: ${oldVersion} -> ${newVersion}; profile, earned score, attempts and active round unchanged.`,
    );
  }
  console.log(
    'Desktop smoke passed: packaged/file assets, setup, gameplay, saved score, profile persistence, resume.',
  );
} finally {
  if (app) await app.close();
  if (newAsar) await writeFile(packagedAsar, newAsar);
  await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}
