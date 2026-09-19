// DEVIL Mobile Background Keep-Alive & WakeLock Engine
// Enables continuous background listening and wake-word ("Devil Bolo") responsiveness on mobile devices

const SILENT_WAV_BASE64 =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let silentAudioElement: HTMLAudioElement | null = null;
let wakeLockSentinel: any = null;
let isServiceRunning = false;

/**
 * Request Screen WakeLock to prevent mobile device screen from going to sleep while open
 */
export async function acquireWakeLock(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return false;
  try {
    if (!wakeLockSentinel) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    }
  } catch (e) {
    // Wake lock might be rejected on low battery or non-active window
  }
  return false;
}

export function releaseWakeLock(): void {
  if (wakeLockSentinel) {
    try {
      wakeLockSentinel.release();
    } catch (e) {}
    wakeLockSentinel = null;
  }
}

/**
 * Starts continuous background service using MediaSession and silent audio loop
 * Prevents mobile OS (Android/iOS) from suspending background listening
 */
export async function startMobileBackgroundService(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  isServiceRunning = true;

  // 1. Acquire WakeLock
  await acquireWakeLock();

  // 2. Start Silent Loop Audio for Background Process Keep-Alive
  try {
    if (!silentAudioElement) {
      silentAudioElement = new Audio(SILENT_WAV_BASE64);
      silentAudioElement.loop = true;
      silentAudioElement.volume = 0.01; // tiny volume so mobile browsers register as active audio
    }

    const playPromise = silentAudioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may wait for user gesture; handled by caller clicks
      });
    }
  } catch (e) {
    console.warn('Background audio loop setup failed:', e);
  }

  // 3. Register MediaSession metadata for Mobile LockScreen / Notification shade
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'DEVIL All-Time Live Mobile Core',
        artist: 'Wake Word: "Devil Bolo" (डेविल बोलो)',
        album: '24x7 Active Mobile Background Listening',
        artwork: [
          { src: '/favicon.ico', sizes: '96x96', type: 'image/png' },
          { src: '/favicon.ico', sizes: '192x192', type: 'image/png' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (silentAudioElement) silentAudioElement.play().catch(() => {});
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        // Keep active or restart
      });
    } catch (e) {
      console.warn('MediaSession registration error:', e);
    }
  }

  return true;
}

/**
 * Stops background service
 */
export function stopMobileBackgroundService(): void {
  isServiceRunning = false;
  releaseWakeLock();

  if (silentAudioElement) {
    try {
      silentAudioElement.pause();
    } catch (e) {}
    silentAudioElement = null;
  }

  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = null;
    } catch (e) {}
  }
}

export function isMobileBackgroundRunning(): boolean {
  return isServiceRunning;
}

/**
 * Haptic feedback vibration when Wake-Word "Devil Bolo" is recognized
 */
export function triggerWakeHaptic(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([120, 60, 180]);
    } catch (e) {}
  }
}
