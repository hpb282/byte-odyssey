const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('byteUpdates', {
  getState: () => ipcRenderer.invoke('byte-updates:state'),
  check: () => ipcRenderer.invoke('byte-updates:check'),
  download: () => ipcRenderer.invoke('byte-updates:download'),
  install: () => ipcRenderer.invoke('byte-updates:install'),
  openRelease: () => ipcRenderer.invoke('byte-updates:release'),
  subscribe: (listener) => {
    const handler = (_event, state) => listener(state);
    ipcRenderer.on('byte-updates:changed', handler);
    return () => ipcRenderer.removeListener('byte-updates:changed', handler);
  },
});
