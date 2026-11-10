const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('node:path');

if (process.env.BYTE_ODYSSEY_USER_DATA) app.setPath('userData', process.env.BYTE_ODYSSEY_USER_DATA);
if (!app.requestSingleInstanceLock()) app.quit();
let window;
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
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  window.once('ready-to-show', () => window.show());
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.loadFile(path.join(__dirname, '../dist/index.html'));
}
app.whenReady().then(() => {
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
