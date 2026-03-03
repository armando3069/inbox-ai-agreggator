import { contextBridge } from 'electron';

// Expose a minimal safe API to the renderer process.
// Extend this when you need main ↔ renderer communication (ipcRenderer, etc.).
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
