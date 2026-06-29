const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApp', {
  platform: process.platform,
  saveJpg: (payload) => ipcRenderer.invoke('save-jpg', payload)
});
