const { app, BrowserWindow, Menu, session, ipcMain, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { autoUpdater } = require('electron-updater');
const { createUpdateController } = require('./updater.cjs');
const pagePath = path.join(__dirname, '../dist/index.html');

if (process.env.BYTE_ODYSSEY_USER_DATA) app.setPath('userData', process.env.BYTE_ODYSSEY_USER_DATA);
if (!app.requestSingleInstanceLock()) app.quit();
let window;
let updates;
function createWindow() {
  window = new BrowserWindow({
    width: 1366,
    height: 960,
    minWidth: 390,
    minHeight: 640,
    title: 'Byte Odyssey',
    backgroundColor: '#8cddf5',
    show: false,
    icon: path.join(__dirname, '../assets/branding/byte-odyssey-icon-256.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });
  window.once('ready-to-show', () => window.show());
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.loadFile(pagePath);
}
app.whenReady().then(() => {
  updates = createUpdateController({
    updater: autoUpdater,
    currentVersion: app.getVersion(),
    supported:
      app.isPackaged &&
      process.platform === 'win32' &&
      !process.env.PORTABLE_EXECUTABLE_DIR &&
      !process.env.PORTABLE_EXECUTABLE_FILE,
    onState: (state) => {
      if (window && !window.isDestroyed()) window.webContents.send('byte-updates:changed', state);
    },
  });
  const register = (name, handler) =>
    ipcMain.handle(`byte-updates:${name}`, (event) => {
      if (
        !window ||
        event.sender !== window.webContents ||
        event.senderFrame !== window.webContents.mainFrame ||
        event.senderFrame.url !== pathToFileURL(pagePath).href
      )
        throw new Error('Invalid update sender');
      return handler();
    });
  register('state', () => updates.getState());
  register('check', () => updates.check());
  register('download', () => updates.download());
  register('install', async () => {
    await session.defaultSession.flushStorageData();
    return updates.install();
  });
  register('release', () => shell.openExternal('https://github.com/hpb282/byte-odyssey/releases/latest'));
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) =>
    callback(false),
  );
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { label: 'Byte Odyssey', submenu: [{ role: 'quit', label: 'Thoát' }] },
      {
        label: 'Hiển thị',
        submenu: [
          { role: 'resetZoom', label: 'Cỡ mặc định' },
          { role: 'zoomIn', label: 'Phóng to' },
          { role: 'zoomOut', label: 'Thu nhỏ' },
          { role: 'togglefullscreen', label: 'Toàn màn hình' },
        ],
      },
    ]),
  );
  createWindow();
  const timer = setTimeout(() => {
    void updates.check();
  }, 5000);
  timer.unref();
});
app.on('second-instance', () => {
  if (window) {
    if (window.isMinimized()) window.restore();
    window.focus();
  }
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
