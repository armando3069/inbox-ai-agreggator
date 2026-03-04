import { contextBridge, ipcRenderer } from 'electron';

// Expose a minimal safe API to the renderer process.
// All calls go through ipcRenderer.send / invoke so Node never leaks into
// the renderer (contextIsolation: true, nodeIntegration: false).
contextBridge.exposeInMainWorld('electronAPI', {
  /** Current OS platform string (e.g. 'darwin', 'win32', 'linux'). */
  platform: process.platform,

  /**
   * Show an OS-level notification.
   * Calls ipcMain handler in main.ts.
   */
  notify: (title: string, body: string) =>
    ipcRenderer.send('notify', { title, body }),
});
