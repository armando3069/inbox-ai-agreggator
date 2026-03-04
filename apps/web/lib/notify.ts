/**
 * Unified notification helper.
 *
 * Priority:
 *  1. Electron — calls window.electronAPI.notify() → ipcMain → OS Notification
 *  2. Browser  — uses the Web Notification API (requires 'granted' permission)
 */

// ── Type augmentation for window.electronAPI ──────────────────────────────────

declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      notify: (title: string, body: string) => void;
    };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function platformLabel(platform: string): string {
  if (platform === 'telegram') return 'Telegram';
  if (platform === 'whatsapp') return 'WhatsApp';
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

function truncate(text: string, max = 120): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface NotifyPayload {
  platform: string;
  contactName: string;
  textPreview: string;
}

/**
 * Show a notification for a new incoming message.
 * Chooses Electron OS notification or browser Notification automatically.
 */
export function notifyNewMessage({ platform, contactName, textPreview }: NotifyPayload): void {
  if (typeof window === 'undefined') return;

  const title = `${contactName || 'Mesaj nou'} · ${platformLabel(platform)}`;
  const body  = truncate(textPreview);

  // ── Electron path ──────────────────────────────────────────────────────────
  if (window.electronAPI?.notify) {
    window.electronAPI.notify(title, body);
    return;
  }

  // ── Browser path ───────────────────────────────────────────────────────────
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  new Notification(title, { body, icon: '/logo.png' });
}

/**
 * Request browser notification permission.
 * In Electron, permission is always granted via the OS.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined') return 'denied';

  // In Electron, OS notifications are always available
  if (window.electronAPI) return 'granted';

  if (typeof Notification === 'undefined') return 'denied';
  if (Notification.permission === 'granted') return 'granted';

  return Notification.requestPermission();
}

/**
 * Returns the current notification permission status.
 * Returns 'granted' inside Electron (OS-level, no browser permission needed).
 */
export function getNotificationPermission(): NotificationPermission | 'unavailable' {
  if (typeof window === 'undefined') return 'unavailable';
  if (window.electronAPI) return 'granted';
  if (typeof Notification === 'undefined') return 'unavailable';
  return Notification.permission;
}
