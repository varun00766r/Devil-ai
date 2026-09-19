// Local Notification Helper supporting Browser Notification API and scheduled alerts

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendLocalNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    } catch (e) {
      console.warn('Native notification trigger failed:', e);
    }
  }
}

export function scheduleLocalAlert(id: number | string, title: string, body: string, delayMs: number) {
  // Browser scheduled fallback
  setTimeout(() => {
    sendLocalNotification(title, body);
  }, delayMs);
}
