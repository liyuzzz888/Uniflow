const { app, BrowserWindow, protocol, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const APP_ORIGIN = 'uniflow://app';
const WEB_ROOT = path.resolve(__dirname, '..', 'dist');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.gz': 'application/gzip',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

protocol.registerSchemesAsPrivileged([{
  scheme: 'uniflow',
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true }
}]);

async function serveApp(request) {
  let url;
  try { url = new URL(request.url); } catch { return new Response('Invalid URL', { status: 400 }); }
  if (url.protocol !== 'uniflow:' || url.hostname !== 'app' || url.port || url.username || url.password) {
    return new Response('Forbidden', { status: 403 });
  }

  let relative;
  try { relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html'; }
  catch { return new Response('Invalid path', { status: 400 }); }
  if (relative.includes('\0')) return new Response('Invalid path', { status: 400 });

  const target = path.resolve(WEB_ROOT, relative);
  if (!target.startsWith(`${WEB_ROOT}${path.sep}`)) return new Response('Forbidden', { status: 403 });
  try {
    const bytes = await fs.readFile(target);
    return new Response(bytes, {
      headers: {
        'content-type': MIME_TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-cache'
      }
    });
  } catch (error) {
    return new Response(error.code === 'ENOENT' ? 'Not found' : 'Unable to read resource', {
      status: error.code === 'ENOENT' ? 404 : 500
    });
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 860,
    minHeight: 600,
    backgroundColor: '#f4f5f7',
    title: 'UniFlow · 大学时序',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`${APP_ORIGIN}/`)) event.preventDefault();
  });
  window.loadURL(`${APP_ORIGIN}/index.html`);
}

app.whenReady().then(() => {
  app.setName('UniFlow');
  protocol.handle('uniflow', serveApp);

  const isAppPage = url => typeof url === 'string' && url.startsWith(`${APP_ORIGIN}/`);
  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) =>
    permission === 'clipboard-read' && isAppPage(requestingOrigin) && isAppPage(webContents?.getURL()));
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) =>
    callback(permission === 'clipboard-read' && isAppPage(webContents?.getURL())));

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
