const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultName) => ipcRenderer.invoke('save-file-dialog', defaultName),
  savePDF: (data) => ipcRenderer.invoke('save-pdf', data),
  saveToDownloads: (data) => ipcRenderer.invoke('save-to-downloads', data),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath),
  
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // Platform info
  platform: process.platform
});
