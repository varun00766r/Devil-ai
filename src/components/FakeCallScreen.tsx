import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Grid,
  Pause,
  Play,
  User,
  Shield,
  Bot,
  Building2,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Radio,
  Wifi,
  Signal,
  Battery,
} from 'lucide-react';
import { soundFX } from '../lib/audio';
import { FakeCallConfig } from '../types';

interface FakeCallScreenProps {
  config: FakeCallConfig;
  isOpen: boolean;
  onEndCall: () => void;
}

export const FakeCallScreen: React.FC<FakeCallScreenProps> = ({
  config,
  isOpen,
  onEndCall,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [keypadInput, setKeypadInput] = useState('');
  const [quickSmsSent, setQuickSmsSent] = useState<string | null>(null);

  const durationTimerRef = useRef<any>(null);
  const audioContextStartedRef = useRef<boolean>(false);

  // Initialize and play ringtone when modal opens
  useEffect(() => {
    if (!isOpen) {
      setCallState('ringing');
      setDuration(0);
      setShowKeypad(false);
      setKeypadInput('');
      setQuickSmsSent(null);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      soundFX.stopRingtone();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    setCallState('ringing');
    setDuration(0);
    soundFX.startRingtone();

    // Vibrate device in phone cadence if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([600, 300, 600, 300, 1000]);
      } catch (e) {}
    }

    return () => {
      soundFX.stopRingtone();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  // Duration timer when connected
  useEffect(() => {
    if (callState === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  // Handle Answer
  const handleAnswer = () => {
    soundFX.stopRingtone();
    soundFX.playConfirm();
    setCallState('connected');

    // Synthesize caller speech if provided
    if (config.scriptText && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(config.scriptText);
      utterance.rate = 0.98;
      utterance.pitch = 0.88;
      // Slight delay so the user puts phone to ear
      setTimeout(() => {
        if (callState !== 'ended') {
          window.speechSynthesis.speak(utterance);
        }
      }, 700);
    }
  };

  // Handle Decline / Hang up
  const handleHangup = () => {
    soundFX.stopRingtone();
    soundFX.playCallEnd();
    setCallState('ended');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setTimeout(() => {
      onEndCall();
    }, 1200);
  };

  // Quick decline with message
  const handleSendQuickSms = (text: string) => {
    soundFX.playClick();
    setQuickSmsSent(text);
    setTimeout(() => {
      handleHangup();
    }, 900);
  };

  const handleKeypadPress = (digit: string) => {
    soundFX.playDtmfTone(digit);
    setKeypadInput((prev) => (prev + digit).slice(-15));
  };

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const renderCallerIcon = () => {
    switch (config.avatarIcon) {
      case 'shield':
        return <Shield className="w-14 h-14 text-emerald-400" />;
      case 'bot':
        return <Bot className="w-14 h-14 text-red-400" />;
      case 'building':
        return <Building2 className="w-14 h-14 text-amber-400" />;
      case 'alert':
        return <AlertTriangle className="w-14 h-14 text-red-500" />;
      default:
        return <User className="w-14 h-14 text-cyan-400" />;
    }
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      id="devil-fake-call-overlay"
      className="fixed inset-0 z-[9999] flex flex-col justify-between bg-black/95 text-white font-sans select-none overflow-hidden backdrop-blur-2xl transition-all duration-300 animate-in fade-in"
    >
      {/* Dynamic Phone Status Bar */}
      <div className="w-full px-6 pt-3 pb-2 flex items-center justify-between text-xs text-slate-400 tracking-wider">
        <div className="font-semibold text-slate-300">{currentTime}</div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-[10px] font-bold text-red-400 px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/40">
            FAKE CALL SIMULATOR
          </span>
          <Wifi className="w-3.5 h-3.5" />
          <Signal className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1">
            <span className="text-[11px]">88%</span>
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Top Header Information */}
      <div className="text-center pt-8 px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 text-xs text-slate-300 shadow-inner mb-4">
          <Radio className={`w-3 h-3 ${callState === 'ringing' ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
          <span>
            {callState === 'ringing'
              ? 'Incoming Voice Call • आ रहा है फोन...'
              : callState === 'connected'
              ? 'Encrypted Voice Connection Active'
              : 'Call Disconnected'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md mb-1">
          {config.callerName || 'Private Number'}
        </h1>

        <p className="text-lg sm:text-xl font-mono text-cyan-400 font-semibold tracking-wider mb-2">
          {config.callerNumber || '+91 ••••• •••••'}
        </p>

        <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
          {config.callerTag || 'Delhi Telecom Circle • Secure Line'}
        </p>

        {/* Live Call Duration or Ringing Status */}
        <div className="mt-4">
          {callState === 'ringing' && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-950/70 border border-red-600/50 text-red-300 animate-pulse">
              Ringing... (घंटी बज रही है)
            </span>
          )}
          {callState === 'connected' && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-sm font-mono font-bold shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{formatTime(duration)}</span>
            </div>
          )}
          {callState === 'ended' && (
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              Call Ended ({formatTime(duration)})
            </span>
          )}
        </div>
      </div>

      {/* Center Avatar & Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-4 px-4">
        {/* Pulsing radar rings during ringing */}
        {callState === 'ringing' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border border-red-500/20 animate-ping" />
            <div className="w-64 h-64 rounded-full border border-cyan-500/15 animate-pulse" />
          </div>
        )}

        {/* Main Caller Avatar Circle */}
        <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-cyan-400/60 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex items-center justify-center">
          {renderCallerIcon()}
        </div>

        {/* Audio Wave Bars when connected */}
        {callState === 'connected' && (
          <div className="flex items-center gap-1.5 mt-6 h-8">
            {[40, 75, 50, 90, 60, 85, 45, 70, 95, 55, 65, 80].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-cyan-500 to-emerald-400 transition-all duration-150"
                style={{
                  height: `${isMuted ? 8 : (h * ((duration % 3) + 1)) / 3}%`,
                  animationDuration: `${0.4 + (i % 4) * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Keypad Modal Overlay if opened during call */}
        {showKeypad && callState === 'connected' && (
          <div className="mt-4 p-3 bg-slate-900/90 rounded-2xl border border-cyan-500/40 shadow-2xl backdrop-blur-lg w-full max-w-xs animate-in zoom-in-95">
            <div className="text-center font-mono text-cyan-300 text-lg mb-2 tracking-widest min-h-[28px]">
              {keypadInput || '•'}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
                <button
                  key={d}
                  onClick={() => handleKeypadPress(d)}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-950/80 border border-slate-700/60 active:scale-95 text-white font-mono text-base font-bold transition flex flex-col items-center justify-center"
                >
                  <span>{d}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick SMS sent toast */}
        {quickSmsSent && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-medium animate-in fade-in">
            ✓ Quick message sent: "{quickSmsSent}"
          </div>
        )}
      </div>

      {/* Bottom Controls Area */}
      <div className="pb-10 pt-4 px-6 w-full max-w-md mx-auto">
        {/* RINGING CONTROLS */}
        {callState === 'ringing' && (
          <div className="space-y-6">
            {/* Quick SMS Presets */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleSendQuickSms("Can't talk now. What's up?")}
                className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs transition"
              >
                💬 Can't talk now
              </button>
              <button
                onClick={() => handleSendQuickSms("I'll call you right back.")}
                className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs transition"
              >
                💬 Call back later
              </button>
            </div>

            {/* Answer and Decline Buttons */}
            <div className="flex items-center justify-around">
              {/* Decline Button (Red) */}
              <div className="flex flex-col items-center gap-2">
                <button
                  id="devil-fake-call-decline-btn"
                  onClick={handleHangup}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-500 active:scale-90 text-white flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.5)] transition"
                  title="Decline Call"
                >
                  <PhoneOff className="w-8 h-8 rotate-[135deg]" />
                </button>
                <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Decline</span>
              </div>

              {/* Accept Button (Green) */}
              <div className="flex flex-col items-center gap-2">
                <button
                  id="devil-fake-call-answer-btn"
                  onClick={handleAnswer}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-90 text-white flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.6)] animate-pulse transition"
                  title="Answer Call"
                >
                  <Phone className="w-8 h-8" />
                </button>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Answer</span>
              </div>
            </div>
          </div>
        )}

        {/* CONNECTED CALL IN-CALL CONTROLS */}
        {callState === 'connected' && (
          <div className="space-y-6">
            {/* Grid of In-Call Actions */}
            <div className="grid grid-cols-3 gap-3">
              {/* Mute Button */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  setIsMuted(!isMuted);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  isMuted
                    ? 'bg-red-950/80 border-red-500 text-red-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6 mb-1 text-red-400" /> : <Mic className="w-6 h-6 mb-1 text-cyan-400" />}
                <span className="text-[11px] font-medium">{isMuted ? 'Muted' : 'Mute'}</span>
              </button>

              {/* Keypad Button */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  setShowKeypad(!showKeypad);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  showKeypad
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Grid className="w-6 h-6 mb-1 text-cyan-400" />
                <span className="text-[11px] font-medium">Keypad</span>
              </button>

              {/* Speaker Button */}
              <button
                onClick={() => {
                  soundFX.playClick();
                  setIsSpeaker(!isSpeaker);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  isSpeaker
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {isSpeaker ? (
                  <Volume2 className="w-6 h-6 mb-1 text-cyan-400" />
                ) : (
                  <VolumeX className="w-6 h-6 mb-1 text-slate-400" />
                )}
                <span className="text-[11px] font-medium">{isSpeaker ? 'Speaker' : 'Earpiece'}</span>
              </button>
            </div>

            {/* Hang Up Button (Center Red) */}
            <div className="flex flex-col items-center justify-center pt-2">
              <button
                id="devil-fake-call-hangup-btn"
                onClick={handleHangup}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.5)] transition"
                title="End Call"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <span className="text-xs text-red-400 font-semibold uppercase tracking-wider mt-2">End Call</span>
            </div>
          </div>
        )}

        {/* ENDED STATE */}
        {callState === 'ended' && (
          <div className="text-center py-6 text-slate-400 text-sm">
            Closing caller window...
          </div>
        )}
      </div>
    </div>
  );
};
