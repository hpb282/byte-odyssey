import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { GAMES } from '../src/catalog';
import { questionById } from '../src/questions';
import type { Question } from '../src/types';
import { readFile } from 'node:fs/promises';

async function createPlayer(page: Page, name = 'Minh Anh') {
  await page.goto('/');
  await page
    .getByRole('button', { name: /Bắt đầu chơi/i })
    .first()
    .click();
  await page.getByLabel('Tên học sinh').fill(name);
  await page.getByLabel(/^Lớp/).fill('2A');
  await page.getByRole('button', { name: 'Tạo và chọn hồ sơ' }).click();
}
async function reducedMotion(page: Page) {
  await page.getByRole('button', { name: 'Cài đặt', exact: true }).click();
  await page.getByLabel(/Giảm chuyển động/).check();
  await page.getByRole('button', { name: 'Đóng', exact: true }).click();
}
async function prepare(page: Page, gameIndex: number, groupName: string, character = 'Robot Byte') {
  await page.getByRole('button', { name: new RegExp(groupName) }).click();
  await page.getByRole('button', { name: /Tiếp tục/ }).click();
  await expect(page.locator('.game-grid>.choice-card')).toHaveCount(4);
  await page.getByRole('button', { name: new RegExp(GAMES[gameIndex].name) }).click();
  await page.getByRole('button', { name: /Tiếp tục/ }).click();
  await expect(page.locator('.character-grid>.choice-card')).toHaveCount(10);
  await page.getByRole('button', { name: character, exact: true }).click();
  await page.getByRole('button', { name: /Tiếp tục/ }).click();
  const maps = GAMES[gameIndex].maps;
  await expect(page.locator('.map-grid>.choice-card')).toHaveCount(maps.length);
  await expect(page.getByRole('button', { name: /Bắt đầu chơi/i })).toBeDisabled();
  await page.getByRole('button', { name: maps.at(-1)!.name, exact: true }).click();
  await page.getByRole('button', { name: /Bắt đầu chơi/i }).click();
  await expect(page.locator('.question-panel')).toBeVisible();
}
async function question(page: Page): Promise<Question> {
  const id = await page.locator('.question-panel').getAttribute('data-question-id');
  return questionById.get(id!)!;
}
async function answer(page: Page, q: Question, wrong = false) {
  if (q.type === 'choice')
    await page
      .locator('.answer-options')
      .getByRole('button', { name: wrong ? q.options.find((x) => x !== q.correct)! : q.correct, exact: true })
      .click();
  if (q.type === 'order')
    for (const token of q.correct)
      await page.locator('.word-bank').getByRole('button', { name: token, exact: true }).click();
  if (q.type === 'match')
    for (const pair of q.pairs) {
      await page.locator('.match-word').filter({ hasText: pair.word }).click();
      await page.locator('.match-picture').filter({ hasText: pair.picture }).click();
    }
  await page.locator('.submit-answer').click();
}
async function solveAll(page: Page) {
  const seen = new Set<string>();
  for (let i = 0; i < 10; i++) {
    const q = await question(page);
    seen.add(q.type);
    await answer(page, q);
    if (i < 9) await expect(page.locator('.question-panel')).not.toHaveAttribute('data-question-id', q.id);
  }
  await expect(page.getByRole('heading', { name: 'Hoàn thành rồi!' })).toBeVisible();
  return seen;
}

for (const [index, group, character] of [
  [0, 'Nhận diện chữ', 'Robot Byte'],
  [1, 'Vần và dấu thanh', 'Linh vật'],
  [2, 'Ghép từ và câu', 'Mèo'],
  [3, 'Ghép từ và câu', 'Sao'],
] as const) {
  test(`${GAMES[index].name}: chơi đủ 10 bài và lưu đúng hồ sơ, map, nhân vật`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await createPlayer(page);
    await reducedMotion(page);
    await prepare(page, index, group, character);
    const seen = await solveAll(page);
    if (index >= 2) expect([...seen].sort()).toEqual(['choice', 'match', 'order']);
    await expect(page.locator('.result-score>strong')).toHaveText('100');
    const data = await page.evaluate(() => JSON.parse(localStorage.getItem('byte-odyssey:data:v1')!));
    expect(data.records).toHaveLength(1);
    expect(data.records[0]).toMatchObject({
      score: 100,
      completed: 10,
      outcome: 'completed',
      selection: { game: GAMES[index].id, map: GAMES[index].maps.at(-1)!.id },
    });
    await page.reload();
    await page.getByRole('button', { name: 'Hồ sơ chơi', exact: true }).click();
    await expect(page.locator('.record')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}
test('sai rồi sửa đúng chỉ được 5 điểm; không bị mất tim khi chờ', async ({ page }) => {
  await createPlayer(page);
  await prepare(page, 0, 'Nhận diện chữ');
  const q = await question(page);
  await page.waitForTimeout(1500);
  await expect(page.getByRole('img', { name: 'Còn 3 trái tim' })).toBeVisible();
  await answer(page, q, true);
  await expect(page.getByRole('img', { name: 'Còn 2 trái tim' })).toBeVisible();
  await expect(page.locator('.feedback.needs-practice')).toBeVisible();
  await page.getByRole('button', { name: 'Thử lại bài này ↻' }).click();
  await solveAll(page);
  await expect(page.locator('.result-score>strong')).toHaveText('95');
});
test('ba lần sai kết thúc lượt, hiển thị gợi ý và có thể chơi lại', async ({ page }) => {
  await createPlayer(page);
  await reducedMotion(page);
  await prepare(page, 0, 'Nhận diện chữ');
  const q = await question(page);
  for (let i = 0; i < 3; i++) {
    await answer(page, q, true);
    if (i < 2) await page.getByRole('button', { name: 'Thử lại bài này ↻' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Cùng thử lại nhé!' })).toBeVisible();
  await expect(page.locator('.result-score>strong')).toHaveText('0');
  await page.getByRole('button', { name: 'Chơi lại ↻' }).click();
  await expect(page.getByRole('img', { name: 'Còn 3 trái tim' })).toBeVisible();
});
test('tải lại giữ lượt chơi, tạm dừng và quay về không làm mất điểm', async ({ page }) => {
  await createPlayer(page);
  await reducedMotion(page);
  await prepare(page, 1, 'Vần và dấu thanh');
  const q = await question(page);
  await answer(page, q);
  await expect(page.locator('.question-panel')).not.toHaveAttribute('data-question-id', q.id);
  const next = await question(page);
  await page.reload();
  await page.getByRole('button', { name: /Tiếp tục lượt chơi/ }).click();
  await expect(page.locator('.score-box>strong')).toHaveText('10');
  await expect(page.locator('.question-panel')).toHaveAttribute('data-question-id', next.id);
  await page.getByRole('button', { name: 'Tạm dừng' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tạm dừng' }).click();
  await expect(page.locator('header')).toHaveAttribute('inert', '');
  await page.getByRole('dialog').getByRole('button', { name: 'Về màn hình chính', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Lưu và về màn hình chính' }).click();
  await page.getByRole('button', { name: 'Hồ sơ chơi', exact: true }).click();
  await expect(page.locator('.outcome.abandoned')).toBeVisible();
});
test('xuất và nhập lại hồ sơ JSON, từ chối file hỏng mà không xóa dữ liệu', async ({ page }, testInfo) => {
  await createPlayer(page);
  await reducedMotion(page);
  await prepare(page, 0, 'Nhận diện chữ');
  const q = await question(page);
  for (let i = 0; i < 3; i++) {
    await answer(page, q, true);
    if (i < 2) await page.getByRole('button', { name: 'Thử lại bài này ↻' }).click();
  }
  await page.getByRole('button', { name: 'Xem hồ sơ' }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Sao lưu tất cả (JSON)' }).click();
  const download = await downloaded;
  const path = testInfo.outputPath('backup.json');
  await download.saveAs(path);
  const backup = JSON.parse(await readFile(path, 'utf8'));
  expect(backup.records).toHaveLength(1);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Hồ sơ chơi', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles(path);
  await expect(page.locator('.record')).toHaveCount(1);
  await page.locator('input[type=file]').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":999}'),
  });
  await expect(page.locator('.notice[role=status]')).toContainText('không phải bản sao lưu');
  await expect(page.locator('.record')).toHaveCount(1);
});
test('màn hình điện thoại chơi được cả ghép câu và nối tranh, không tràn ngang', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createPlayer(page, 'Bạn nhỏ');
  await reducedMotion(page);
  await prepare(page, 3, 'Ghép từ và câu', 'Thỏ');
  await solveAll(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('bản web đã lưu ngoại tuyến vẫn mở và chơi khi ngắt mạng', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await createPlayer(page, 'Chơi ngoại tuyến');
  await reducedMotion(page);
  await prepare(page, 2, 'Nhận diện chữ');
  const q = await question(page);
  await answer(page, q);
  await expect(page.locator('.question-panel')).not.toHaveAttribute('data-question-id', q.id);
  await context.setOffline(false);
});
