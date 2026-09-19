import { useState, useEffect, useRef, useCallback } from 'react';
import { soundFX } from './audio';
import {
  startMobileBackgroundService,
  stopMobileBackgroundService,
  triggerWakeHaptic,
} from './backgroundKeepAlive';

interface UseAlwaysOnVoiceOptions {
  enabled: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  speechLang: 'hi-IN' | 'en-US';
  onCommand: (text: string) => void;
  onInterimChange?: (text: string) => void;
}

export function useAlwaysOnVoice({
  enabled,
  isSpeaking,
  isThinking,
  speechLang,
  onCommand,
  onInterimChange,
}: UseAlwaysOnVoiceOptions) {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);
  const isStartedRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);
  const currentTranscriptRef = useRef('');
  const restartTimeoutRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);

  // Store options in refs so callbacks always have freshest state
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const isSpeakingRef = useRef(isSpeaking);
  isSpeakingRef.current = isSpeaking;

  const isThinkingRef = useRef(isThinking);
  isThinkingRef.current = isThinking;

  const speechLangRef = useRef(speechLang);
  speechLangRef.current = speechLang;

  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

  const onInterimChangeRef = useRef(onInterimChange);
  onInterimChangeRef.current = onInterimChange;

  // Screen WakeLock management to keep the screen awake during All-Time voice mode
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch (e) {
        // WakeLock may be rejected if low battery or not focused
      }
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release();
      } catch (e) {}
      wakeLockRef.current = null;
    }
  }, []);

  // Safely start recognition
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || isStartedRef.current) return;
    if (isSpeakingRef.current || isThinkingRef.current || !enabledRef.current) return;

    try {
      recognitionRef.current.lang = speechLangRef.current;
      recognitionRef.current.start();
      isStartedRef.current = true;
      setIsListening(true);
      requestWakeLock();
      startMobileBackgroundService().catch(() => {});
    } catch (e: any) {
      // If already started or aborting, ignore
      if (e.name !== 'InvalidStateError') {
        console.warn('SpeechRecognition start error:', e);
      }
    }
  }, [requestWakeLock]);

  // Safely stop recognition
  const stopRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    clearTimeout(silenceTimerRef.current);
    clearTimeout(restartTimeoutRef.current);

    try {
      recognitionRef.current.stop();
    } catch (e) {}
    isStartedRef.current = false;
    setIsListening(false);
    stopMobileBackgroundService();
  }, []);

  // Process and dispatch spoken command
  const dispatchCommand = useCallback((rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    // Clear transcript preview
    currentTranscriptRef.current = '';
    setLiveTranscript('');
    if (onInterimChangeRef.current) {
      onInterimChangeRef.current('');
    }

    // Play subtle audio confirm
    soundFX.playClick();

    // Trigger user command
    onCommandRef.current(text);
  }, []);

  // Initialize SpeechRecognition instance
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = speechLang;

    recognition.onstart = () => {
      isStartedRef.current = true;
      setIsListening(true);
      setHasPermission(true);
    };

    recognition.onresult = (event: any) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalStr += transcriptPart;
        } else {
          interimStr += transcriptPart;
        }
      }

      const activeText = (finalStr || interimStr || '').trim();
      if (!activeText) return;

      currentTranscriptRef.current = activeText;
      setLiveTranscript(activeText);
      if (onInterimChangeRef.current) {
        onInterimChangeRef.current(activeText);
      }

      // Check for instant Wake-Word trigger (e.g. "devil bolo", "डेविल बोलो", "hey devil", "devil")
      const lower = activeText.toLowerCase();
      const wakeWords = [
        'devil bolo',
        'devli bolo',
        'डेविल बोलो',
        'devil bol',
        'डेविल बोल',
        'devil bolo on',
        'डेविल बोलो ऑन',
        'devil suno',
        'सुनो डेविल',
        'hey devil',
        'devil',
        'devli',
        'हे डेविल',
        'डेविल',
        'नमस्ते डेविल',
        'hey jarvis',
        'jarvis',
      ];

      const matchedWakeWord = wakeWords.find((w) => lower.includes(w));
      if (matchedWakeWord) {
        soundFX.playPowerUp();
        triggerWakeHaptic();
      }

      // Check if utterance is solely the wake word (e.g. "devil bolo" / "डेविल बोलो")
      const isJustWakeWord =
        lower === 'devil bolo' ||
        lower === 'devli bolo' ||
        lower === 'डेविल बोलो' ||
        lower === 'devil bol' ||
        lower === 'डेविल बोल' ||
        lower === 'hey devil' ||
        lower === 'हे डेविल' ||
        lower === 'devil' ||
        lower === 'डेविल' ||
        lower === 'devil suno' ||
        lower === 'सुनो डेविल';

      // Auto-submit on silence: clear previous silence timer
      clearTimeout(silenceTimerRef.current);

      // If speech has substance, set silence debounce
      if (activeText.length > 1) {
        // Ultra-snappy delay if user just spoke the wake-word
        const silenceDelay = isJustWakeWord ? 350 : finalStr ? 800 : 1200;

        silenceTimerRef.current = setTimeout(() => {
          if (currentTranscriptRef.current.trim().length > 1) {
            dispatchCommand(currentTranscriptRef.current);
          }
        }, silenceDelay);
      }
    };

    recognition.onerror = (err: any) => {
      isStartedRef.current = false;
      setIsListening(false);

      if (err.error === 'not-allowed') {
        setHasPermission(false);
        console.warn('Microphone permission denied for speech recognition');
      } else if (err.error === 'no-speech') {
        // Normal silence timeout from browser engine - will auto-restart in onend
      } else {
        console.warn('SpeechRecognition error:', err.error);
      }
    };

    recognition.onend = () => {
      isStartedRef.current = false;
      setIsListening(false);

      // If All-Time Voice mode is enabled and neither DEVIL speaking nor thinking, auto-restart!
      if (
        enabledRef.current &&
        !isSpeakingRef.current &&
        !isThinkingRef.current
      ) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          startRecognition();
        }, 120);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearTimeout(silenceTimerRef.current);
      clearTimeout(restartTimeoutRef.current);
      try {
        recognition.abort();
      } catch (e) {}
      recognitionRef.current = null;
      isStartedRef.current = false;
    };
  }, [speechLang, dispatchCommand, startRecognition]);

  // React to enabled state
  useEffect(() => {
    if (enabled) {
      if (!isSpeaking && !isThinking) {
        startRecognition();
      }
    } else {
      stopRecognition();
      releaseWakeLock();
    }
  }, [enabled, isSpeaking, isThinking, startRecognition, stopRecognition, releaseWakeLock]);

  // Pause listening when DEVIL speaks so DEVIL does not transcribe itself
  useEffect(() => {
    if (isSpeaking) {
      stopRecognition();
    } else if (enabled && !isThinking) {
      // Wait for output audio tail before restarting listener
      const timer = setTimeout(() => {
        startRecognition();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, enabled, isThinking, startRecognition, stopRecognition]);

  // Pause listening while thinking
  useEffect(() => {
    if (isThinking) {
      stopRecognition();
    } else if (enabled && !isSpeaking) {
      const timer = setTimeout(() => {
        startRecognition();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isThinking, enabled, isSpeaking, startRecognition, stopRecognition]);

  // Maintain WakeLock and keep-alive across page visibility states (foreground and mobile background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (enabledRef.current) {
        startMobileBackgroundService().catch(() => {});
        if (document.visibilityState === 'visible') {
          requestWakeLock();
        }
        if (!isSpeakingRef.current && !isThinkingRef.current && !isStartedRef.current) {
          startRecognition();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestWakeLock, startRecognition]);

  return {
    isListening,
    liveTranscript,
    isSupported,
    hasPermission,
    startListening: startRecognition,
    stopListening: stopRecognition,
  };
}
