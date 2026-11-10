// No Electron imports here: the consent and download state machine is tested independently.
function createUpdateController({ updater, currentVersion, supported, onState, beforeInstall = () => {} }) {
  let state = {
    status: supported ? 'idle' : 'unsupported',
    currentVersion,
    version: null,
    notes: '',
    percent: 0,
    error: '',
  };
  let busy = false;
  let ready = false;
  const publish = (patch) => {
    state = { ...state, ...patch };
    onState({ ...state });
  };
  const fail = () =>
    publish({
      status: 'error',
      error: 'Chưa kết nối được với nơi cập nhật. Hãy kiểm tra Internet và thử lại.',
    });
  if (supported) {
    updater.autoDownload = false;
    updater.autoInstallOnAppQuit = false;
    updater.allowPrerelease = false;
    updater.allowDowngrade = false;
    updater.on('update-available', (info) => {
      const notes =
        typeof info.releaseNotes === 'string'
          ? info.releaseNotes
          : Array.isArray(info.releaseNotes)
            ? info.releaseNotes.map((item) => item.note || '').join('\n')
            : '';
      publish({
        status: 'available',
        version: info.version,
        notes: notes.slice(0, 12000),
        error: '',
        percent: 0,
      });
    });
    updater.on('update-not-available', () =>
      publish({ status: 'current', version: null, notes: '', error: '' }),
    );
    updater.on('download-progress', (info) =>
      publish({ status: 'downloading', percent: Math.max(0, Math.min(100, Number(info.percent) || 0)) }),
    );
    updater.on('update-downloaded', () => {
      ready = true;
      publish({ status: 'downloaded', percent: 100 });
    });
    updater.on('error', fail);
  }
  return {
    getState: () => ({ ...state }),
    async check() {
      if (!supported || busy || ['available', 'downloaded', 'installing'].includes(state.status))
        return { ...state };
      busy = true;
      publish({ status: 'checking', error: '' });
      try {
        await updater.checkForUpdates();
      } catch {
        fail();
      } finally {
        busy = false;
      }
      return { ...state };
    },
    async download() {
      if (!supported || busy || !state.version || !['available', 'error'].includes(state.status))
        return { ...state };
      busy = true;
      ready = false;
      publish({ status: 'downloading', percent: 0, error: '' });
      try {
        await updater.downloadUpdate();
      } catch {
        fail();
      } finally {
        busy = false;
      }
      return { ...state };
    },
    install() {
      if (!supported || busy || !ready || state.status !== 'downloaded') return false;
      // The renderer saves before asking to install. Main also waits for disk writes.
      beforeInstall();
      publish({ status: 'installing' });
      updater.quitAndInstall(true, true);
      return true;
    },
  };
}
module.exports = { createUpdateController };
