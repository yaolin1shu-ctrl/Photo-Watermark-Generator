const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { writeFile } = require('fs/promises');

function getIndexPath() {
  const srcIndexPath = path.join(__dirname, 'src', 'index.html');
  if (fs.existsSync(srcIndexPath)) {
    return srcIndexPath;
  }

  return path.join(__dirname, 'index.html');
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    title: '今日水印相机',
    width: 1100,
    height: 900,
    minWidth: 900,
    minHeight: 700,
    backgroundColor: '#f0f0f0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(getIndexPath());
}

ipcMain.handle('save-jpg', async (event, { dataUrl, defaultFileName }) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePath } = await dialog.showSaveDialog(window, {
    title: '保存 JPG 图片',
    defaultPath: defaultFileName,
    filters: [
      {
        name: 'JPEG 图片',
        extensions: ['jpg', 'jpeg']
      }
    ]
  });

  if (canceled || !filePath) {
    return {
      canceled: true
    };
  }

  const base64Data = dataUrl.replace(/^data:image\/jpe?g;base64,/, '');
  await writeFile(filePath, Buffer.from(base64Data, 'base64'));

  return {
    canceled: false,
    filePath
  };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
