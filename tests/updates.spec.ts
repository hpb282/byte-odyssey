import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
async function mockUpdates(page: Page, initial = 'available') {
  await page.addInitScript(
    ({ initial }) => {
      const listeners = new Set<(state: any) => void>();
      let state: any = {
        status: initial,
        currentVersion: '0.2.0',
        version: initial === 'available' ? '0.3.0' : null,
        notes: 'Thêm từ mới <script>unsafe</script>',
        percent: 0,
        error: '',
      };
      const emit = (patch: any) => {
        state = { ...state, ...patch };
        for (const listener of listeners) listener({ ...state });
      };
      (window as any).updateTest = { installs: 0, downloads: 0, emit };
      window.byteUpdates = {
        getState: async () => ({ ...state }),
        check: async () => {
          emit({ status: 'checking' });
          return { ...state };
        },
        download: async () => {
          (window as any).updateTest.downloads++;
          emit({ status: 'downloading', percent: 32 });
          return { ...state };
        },
        install: async () => {
          (window as any).updateTest.installs++;
          return true;
        },
        openRelease: async () => {},
        subscribe: (listener) => {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
      };
    },
    { initial },
  );
}
test('announces a new release, renders notes as text, defers without downloading, and reopens in settings', async ({
  page,
}) => {
  await mockUpdates(page);
  await page.goto('/');
  const dialog = page.getByRole('dialog', { name: 'Cập nhật Byte Odyssey' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/unsafe/)).toContainText('<script>unsafe</script>');
  await dialog.getByRole('button', { name: 'Để sau' }).click();
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(() => (window as any).updateTest.downloads)).toBe(0);
  await page.getByRole('button', { name: 'Cài đặt', exact: true }).click();
  await page.getByRole('button', { name: 'Cập nhật ứng dụng', exact: true }).click();
  await expect(dialog).toBeVisible();
});
test('one consent click downloads, saves profiles, then requests installation', async ({ page }) => {
  await mockUpdates(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Cập nhật ngay', exact: true }).click();
  await expect(page.getByRole('progressbar', { name: 'Tiến độ tải cập nhật' })).toHaveAttribute(
    'value',
    '32',
  );
  expect(await page.evaluate(() => (window as any).updateTest.installs)).toBe(0);
  await page.evaluate(() => (window as any).updateTest.emit({ status: 'downloaded', percent: 100 }));
  await expect.poll(() => page.evaluate(() => (window as any).updateTest.installs)).toBe(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('byte-odyssey:data:v1')!).version)).toBe(
    1,
  );
});
test('deferring while downloading prevents automatic installation', async ({ page }) => {
  await mockUpdates(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Cập nhật ngay', exact: true }).click();
  await page.getByRole('button', { name: 'Để sau' }).click();
  await page.evaluate(() => (window as any).updateTest.emit({ status: 'downloaded', percent: 100 }));
  await page.getByRole('button', { name: 'Cài đặt', exact: true }).click();
  await page.getByRole('button', { name: 'Cập nhật ứng dụng', exact: true }).click();
  expect(await page.evaluate(() => (window as any).updateTest.installs)).toBe(0);
  await page.getByRole('button', { name: 'Lưu và cài đặt bản mới' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).updateTest.installs)).toBe(1);
});
test('offline failure is retryable and closing a pending check does not reopen the prompt', async ({
  page,
}) => {
  await mockUpdates(page, 'idle');
  await page.goto('/');
  await page.getByRole('button', { name: 'Cài đặt', exact: true }).click();
  await page.getByRole('button', { name: 'Cập nhật ứng dụng', exact: true }).click();
  await page.getByRole('button', { name: 'Kiểm tra cập nhật', exact: true }).click();
  await page.evaluate(() =>
    (window as any).updateTest.emit({ status: 'error', error: 'Mất kết nối Internet' }),
  );
  await expect(page.getByText('Mất kết nối Internet')).toBeVisible();
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await page.getByRole('button', { name: 'Để sau' }).click();
  await page.evaluate(() => (window as any).updateTest.emit({ status: 'available', version: '0.3.0' }));
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('does not interrupt a game when a release becomes available', async ({ page }) => {
  await mockUpdates(page, 'idle');
  await page.goto('/');
  await page
    .getByRole('button', { name: /Bắt đầu chơi/i })
    .first()
    .click();
  await page.getByLabel('Tên học sinh').fill('Thử cập nhật');
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
  await page.evaluate(() => (window as any).updateTest.emit({ status: 'available', version: '0.3.0' }));
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.submit-answer')).toBeVisible();
});
