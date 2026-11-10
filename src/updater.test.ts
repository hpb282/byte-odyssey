import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { createRequire } from 'node:module';
const { createUpdateController } = createRequire(import.meta.url)('../electron/updater.cjs');
function setup(supported = true) {
  const updater = Object.assign(new EventEmitter(), {
    autoDownload: true,
    autoInstallOnAppQuit: true,
    allowPrerelease: true,
    allowDowngrade: true,
    checkForUpdates: vi.fn(async () => {
      updater.emit('update-available', { version: '0.3.0', releaseNotes: 'Học liệu mới' });
    }),
    downloadUpdate: vi.fn(async () => {
      updater.emit('download-progress', { percent: 42 });
      updater.emit('update-downloaded');
    }),
    quitAndInstall: vi.fn(),
  });
  const onState = vi.fn(),
    beforeInstall = vi.fn();
  const controller = createUpdateController({
    updater,
    currentVersion: '0.2.0',
    supported,
    onState,
    beforeInstall,
  });
  return { updater, controller, onState, beforeInstall };
}
describe('Desktop update consent and failures', () => {
  it('checks without downloading or installing and keeps release notes', async () => {
    const { controller, updater } = setup();
    await controller.check();
    expect(controller.getState()).toMatchObject({
      status: 'available',
      version: '0.3.0',
      notes: 'Học liệu mới',
    });
    expect(updater.autoDownload).toBe(false);
    expect(updater.autoInstallOnAppQuit).toBe(false);
    expect(updater.allowDowngrade).toBe(false);
    expect(updater.downloadUpdate).not.toHaveBeenCalled();
    expect(updater.quitAndInstall).not.toHaveBeenCalled();
  });
  it('requires a downloaded update, flushes before install, and installs once', async () => {
    const { controller, updater, onState, beforeInstall } = setup();
    expect(controller.install()).toBe(false);
    await controller.download();
    expect(updater.downloadUpdate).not.toHaveBeenCalled();
    await controller.check();
    await controller.download();
    expect(onState.mock.calls.some(([state]) => state.status === 'downloading' && state.percent === 42)).toBe(
      true,
    );
    expect(controller.getState().status).toBe('downloaded');
    expect(updater.quitAndInstall).not.toHaveBeenCalled();
    expect(controller.install()).toBe(true);
    expect(beforeInstall).toHaveBeenCalledOnce();
    expect(updater.quitAndInstall).toHaveBeenCalledExactlyOnceWith(true, true);
    expect(controller.install()).toBe(false);
  });
  it('recovers from offline checks', async () => {
    const { controller, updater } = setup();
    updater.checkForUpdates.mockRejectedValueOnce(new Error('offline'));
    await controller.check();
    expect(controller.getState().status).toBe('error');
    expect(controller.install()).toBe(false);
    await controller.check();
    expect(controller.getState().status).toBe('available');
  });
  it('rejects installing failed/corrupt downloads and supports retry', async () => {
    const { controller, updater } = setup();
    await controller.check();
    updater.downloadUpdate.mockRejectedValueOnce(new Error('SHA512 mismatch'));
    await controller.download();
    expect(controller.getState().status).toBe('error');
    expect(controller.install()).toBe(false);
    await controller.download();
    expect(controller.getState().status).toBe('downloaded');
  });
  it('serializes concurrent checks and downloads', async () => {
    const { controller, updater } = setup();
    await Promise.all([controller.check(), controller.check()]);
    expect(updater.checkForUpdates).toHaveBeenCalledOnce();
    await Promise.all([controller.download(), controller.download()]);
    expect(updater.downloadUpdate).toHaveBeenCalledOnce();
  });
  it('does not call the updater on portable, development or unsupported platforms', async () => {
    const { controller, updater } = setup(false);
    await controller.check();
    await controller.download();
    expect(controller.install()).toBe(false);
    expect(controller.getState().status).toBe('unsupported');
    expect(updater.checkForUpdates).not.toHaveBeenCalled();
  });
  it('reports an up-to-date installation', async () => {
    const { controller, updater } = setup();
    updater.checkForUpdates.mockImplementationOnce(async () => {
      updater.emit('update-not-available');
    });
    await controller.check();
    expect(controller.getState().status).toBe('current');
  });
});
