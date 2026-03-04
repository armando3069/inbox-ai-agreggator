// Dev-only preload (plain JS — Electron can't load .ts files directly).
// Mirrors preload.ts exactly; keep both in sync.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  notify: (title, body) => ipcRenderer.send('notify', { title, body }),
});
