import React from 'react';
import { Mic, MicOff, Volume2, ShieldCheck, Sparkles, Languages, Radio } from 'lucide-react';
import { soundFX } from '../lib/audio';

interface AlwaysOnVoiceHUDProps {
  isAlwaysOnVoice: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  liveTranscript: string;
  speechLang: 'hi-IN' | 'en-US';
  onToggleAlwaysOn: () => void;
  onToggleLanguage: () => void;
  persona: string;
}

export const AlwaysOnVoiceHUD: React.FC<AlwaysOnVoiceHUDProps> = ({
  isAlwaysOnVoice,
  isListening,
  isSpeaking,
  isThinking,
  liveTranscript,
  speechLang,
  onToggleAlwaysOn,
  onToggleLanguage,
  persona,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-1 mb-2 select-none">
      <div
        className={`relative overflow-hidden rounded-xl border p-2.5 transition-all duration-300 backdrop-blur-md ${
          isAlwaysOnVoice
            ? isListening
              ? 'bg-gradient-to-r from-red-950/70 via-slate-900/90 to-red-950/70 border-red-500/50 shadow-lg shadow-red-950/50'
              : isSpeaking
              ? 'bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-cyan-950/70 border-cyan-500/50 shadow-lg shadow-cyan-950/50'
              : 'bg-slate-950/80 border-cyan-800/40'
            : 'bg-slate-950/60 border-slate-800/60'
        }`}
      >
        {/* Glow ambient background aura */}
        {isAlwaysOnVoice && (
          <div
            className={`absolute inset-0 pointer-events-none opacity-20 blur-xl ${
              isListening ? 'bg-red-500' : isSpeaking ? 'bg-cyan-400' : 'bg-transparent'
            }`}
          />
        )}

        <div className="relative flex items-center justify-between gap-2">
          
          {/* Left: Indicator & Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Animated Mic Radar Disc */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  soundFX.playClick();
                  onToggleAlwaysOn();
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition shadow-md ${
                  isAlwaysOnVoice
                    ? isListening
                      ? 'bg-red-600 text-white shadow-red-600/50 animate-pulse'
                      : isSpeaking
                      ? 'bg-cyan-600 text-white shadow-cyan-600/50'
                      : 'bg-red-950 text-red-300 border border-red-500/50'
                    : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                }`}
                title={isAlwaysOnVoice ? 'All-Time Voice Assistant is ON (Tap to Pause/Disable)' : 'Tap to Activate All-Time Voice'}
              >
                {isAlwaysOnVoice ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              {/* Glowing ping radar ring */}
              {isAlwaysOnVoice && isListening && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>

            {/* Label & Dynamic Subtitle */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono font-bold tracking-wide text-white uppercase flex items-center gap-1">
                  <Radio className={`w-3 h-3 ${isAlwaysOnVoice ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
                  {isAlwaysOnVoice ? 'ALL-TIME DEVIL VOICE' : 'ALL-TIME VOICE: OFF'}
                </span>
                
                {isAlwaysOnVoice && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40 uppercase font-semibold">
                    24x7 HANDS-FREE ON
                  </span>
                )}
              </div>

              {/* Status or Live Transcript */}
              <div className="text-[11px] truncate text-slate-300 font-sans mt-0.5">
                {isSpeaking ? (
                  <span className="text-cyan-300 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-cyan-400 shrink-0 animate-bounce" />
                    <span>DEVIL उत्तर बोल रहा है... (DEVIL is speaking)</span>
                  </span>
                ) : isThinking ? (
                  <span className="text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0 animate-spin" />
                    <span>विचार कर रहा हूँ... (Processing response...)</span>
                  </span>
                ) : liveTranscript ? (
                  <span className="text-red-300 font-medium animate-pulse">
                    🎙️ "{liveTranscript}"
                  </span>
                ) : isAlwaysOnVoice ? (
                  <span className="text-slate-400 text-[10px]">
                    {speechLang === 'hi-IN'
                      ? 'सुन रहा हूँ... बोलिए: "Hey Devil", "Check Battery", "Stopwatch", या कोई भी सवाल!'
                      : 'Always listening... Say "Hey Devil" or speak any request directly!'}
                  </span>
                ) : (
                  <span className="text-slate-500 text-[10px]">
                    ऑल टाइम वॉयस बंद है। हैंड्स-फ्री के लिए एक्टिवेट करें।
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Controls: Equalizer Animation & Toggles */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Equalizer Sound Wave Animation */}
            {isAlwaysOnVoice && isListening && (
              <div className="hidden sm:flex items-end gap-0.5 h-4 px-1.5">
                <span className="w-0.5 bg-red-400 h-2 animate-[pulse_0.6s_ease-in-out_infinite]"></span>
                <span className="w-0.5 bg-red-400 h-4 animate-[pulse_0.4s_ease-in-out_infinite_0.1s]"></span>
                <span className="w-0.5 bg-red-400 h-3 animate-[pulse_0.7s_ease-in-out_infinite_0.2s]"></span>
                <span className="w-0.5 bg-red-400 h-4 animate-[pulse_0.5s_ease-in-out_infinite_0.15s]"></span>
                <span className="w-0.5 bg-red-400 h-2 animate-[pulse_0.8s_ease-in-out_infinite]"></span>
              </div>
            )}

            {/* Language Toggle (HI / EN) */}
            <button
              onClick={() => {
                soundFX.playClick();
                onToggleLanguage();
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-[10px] font-mono text-cyan-300 transition flex items-center gap-1"
              title={`Recognition Language: ${speechLang === 'hi-IN' ? 'Hindi (हिंदी)' : 'English'}. Click to toggle.`}
            >
              <Languages className="w-3 h-3 text-cyan-400" />
              <span>{speechLang === 'hi-IN' ? 'HI' : 'EN'}</span>
            </button>

            {/* Main Toggle Button */}
            <button
              onClick={() => {
                soundFX.playConfirm();
                onToggleAlwaysOn();
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition border active:scale-95 ${
                isAlwaysOnVoice
                  ? 'bg-red-950/80 border-red-500/50 text-red-300 hover:bg-red-900/80'
                  : 'bg-cyan-950 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900'
              }`}
            >
              {isAlwaysOnVoice ? 'PAUSE' : 'TURN ON'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
