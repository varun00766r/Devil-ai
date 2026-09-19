import React, { useState, useEffect } from 'react';
import { Persona } from '../types';
import { soundFX } from '../lib/audio';
import { useOnlineStatus } from '../lib/useOnlineStatus';
import { PWAInstallButton } from './PWAInstallButton';
import { Cpu, ShieldCheck, Volume2, VolumeX, Bell, BellOff, Layers, Settings2, Sparkles, Wifi, WifiOff, Gauge, Smartphone, Mic, MicOff, Monitor, Trash2, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface HeaderHUDProps {
  currentPersona: Persona;
  onSelectPersona: (p: Persona) => void;
  onOpenTools: () => void;
  onOpenVision: () => void;
  onOpenScreenVision?: () => void;
  onOpenMobileManager?: () => void;
  isAlwaysOnVoice?: boolean;
  onToggleAlwaysOnVoice?: () => void;
  voiceFeedbackEnabled?: boolean;
  onToggleVoiceFeedback?: () => void;
  onOpenVoiceSettings?: () => void;
  isSpeaking?: boolean;
  onClearUI?: () => void;
  isClearView?: boolean;
  onToggleClearView?: () => void;
  onOpenQuantumCore?: () => void;
  onOpenJarvisInterface?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  currentPersona,
  onSelectPersona,
  onOpenTools,
  onOpenVision,
  onOpenScreenVision,
  onOpenMobileManager,
  isAlwaysOnVoice,
  onToggleAlwaysOnVoice,
  voiceFeedbackEnabled = true,
  onToggleVoiceFeedback,
  onOpenVoiceSettings,
  isSpeaking = false,
  onClearUI,
  isClearView = false,
  onToggleClearView,
  onOpenQuantumCore,
  onOpenJarvisInterface,
}) => {
  const isOnline = useOnlineStatus();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cpuLoad, setCpuLoad] = useState(14);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  // Simulate subtle CPU telemetry fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(Math.floor(12 + Math.random() * 18));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    soundFX.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) soundFX.playClick();
  };

  const personas: { id: Persona; name: string; tag: string; desc: string; color: string }[] = [
    { id: 'devil', name: 'D.E.V.I.L.', tag: 'Supreme Core', desc: 'Invincible, high-tech AI core with supreme execution', color: 'text-red-400 border-red-500/40 bg-red-950/30' },
    { id: 'jarvis', name: 'J.A.R.V.I.S.', tag: 'Iron Man AI', desc: 'Refined British-tinted witty assistant', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30' },
    { id: 'friday', name: 'F.R.I.D.A.Y.', tag: 'Tactical Core', desc: 'Rapid Irish-accented tactical execution', color: 'text-pink-400 border-pink-500/40 bg-pink-950/30' },
    { id: 'edith', name: 'E.D.I.T.H.', tag: 'Defense Net', desc: 'Cybersecurity & orbital intel network', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' },
    { id: 'karen', name: 'K.A.R.E.N.', tag: 'Intuitive AI', desc: 'Encouraging, friendly step-by-step suit AI', color: 'text-purple-400 border-purple-500/40 bg-purple-950/30' },
    { id: 'vision', name: 'V.I.S.I.O.N.', tag: 'Synapse Core', desc: 'Philosophical & deep analytical synthesis', color: 'text-amber-400 border-amber-500/40 bg-amber-950/30' },
  ];

  const activePersonaObj = personas.find(p => p.id === currentPersona) || personas[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-cyan-900/40 px-3 py-2 text-xs font-mono shadow-lg">
      <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
        
        {/* Left: App Title & Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              soundFX.playClick();
              setShowPersonaMenu(!showPersonaMenu);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400/60 transition-all text-slate-100"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold tracking-wider uppercase text-cyan-300">
              {activePersonaObj.name}
            </span>
            <Layers className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* Persona Selection Dropdown */}
          {showPersonaMenu && (
            <div className="absolute left-0 mt-2 w-64 bg-slate-950 border border-cyan-800/80 rounded-xl shadow-2xl p-2 z-50 divide-y divide-slate-800">
              <div className="px-2 py-1.5 text-[10px] text-cyan-400 uppercase tracking-widest font-semibold flex items-center justify-between">
                <span>Select AI Core Matrix</span>
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="pt-1 space-y-1">
                {personas.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      soundFX.playConfirm();
                      onSelectPersona(p.id);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-all border ${
                      currentPersona === p.id ? p.color : 'border-transparent hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{p.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                        {p.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Telemetry Badges */}
        <div className="hidden sm:flex items-center gap-3 text-[11px]">
          <div
            className={`flex items-center gap-1 font-semibold ${
              isOnline ? 'text-cyan-400' : 'text-amber-400 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'QUANTUM 5G' : 'OFFLINE (CACHED)'}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>CPU {cpuLoad}%</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>SECURE</span>
          </div>
          {/* Voice Feedback Telemetry Indicator */}
          <div
            className={`flex items-center gap-1 font-semibold transition-colors ${
              voiceFeedbackEnabled
                ? isSpeaking
                  ? 'text-cyan-300 animate-pulse'
                  : 'text-cyan-400'
                : 'text-slate-500'
            }`}
            title={voiceFeedbackEnabled ? 'Speech Engine: Active' : 'Speech Engine: Muted'}
          >
            {voiceFeedbackEnabled ? (
              <Volume2 className={`w-3 h-3 ${isSpeaking ? 'animate-bounce text-cyan-300' : 'text-cyan-400'}`} />
            ) : (
              <VolumeX className="w-3 h-3 text-slate-500" />
            )}
            <span>{voiceFeedbackEnabled ? (isSpeaking ? 'SPEAKING...' : 'VOICE ACTIVE') : 'VOICE MUTED'}</span>
          </div>
        </div>

        {/* Right Tools Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {/* Clear View / Clarity Mode Toggle */}
          {onToggleClearView && (
            <button
              onClick={() => {
                soundFX.playClick();
                onToggleClearView();
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition text-[10px] font-bold tracking-wider uppercase active:scale-95 shrink-0 ${
                isClearView
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/40'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/60'
              }`}
              title={isClearView ? "Clear View Active: Click to show Full Cockpit (सारे विजेट्स दिखाएं)" : "Click for Clear View: Minimalist distraction-free screen (साफ स्क्रीन मोड)"}
            >
              {isClearView ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isClearView ? "CLEAR VIEW" : "CLEAR VIEW"}</span>
            </button>
          )}

          {/* Quick Clear UI Button */}
          {onClearUI && (
            <button
              onClick={() => {
                soundFX.playConfirm();
                onClearUI();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-300 hover:bg-rose-900/80 hover:border-rose-400 transition text-[10px] font-bold tracking-wider uppercase active:scale-95 shadow-sm shadow-rose-950/60 shrink-0"
              title="Clear UI & Terminal Stream (पूरी स्क्रीन और चैट साफ करें)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>CLEAR UI</span>
            </button>
          )}

          {/* Voice Feedback (Speech Mode) Toggle & Indicator */}
          {onToggleVoiceFeedback && (
            <button
              onClick={onToggleVoiceFeedback}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition text-[10px] font-bold tracking-wider uppercase active:scale-95 ${
                voiceFeedbackEnabled
                  ? isSpeaking
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/30 animate-pulse'
                    : 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 hover:bg-cyan-900/60'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-500 hover:text-slate-300 hover:border-slate-600'
              }`}
              title={
                voiceFeedbackEnabled
                  ? isSpeaking
                    ? 'DEVIL is actively speaking! Tap to Mute Voice Feedback'
                    : 'Voice Feedback is ON (DEVIL speaks aloud). Tap to Mute'
                  : 'Voice Feedback is OFF (Silent Text-Only Mode). Tap to Enable Speech Output'
              }
            >
              {voiceFeedbackEnabled ? (
                <>
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-cyan-300 animate-bounce' : 'text-cyan-400'}`} />
                  {isSpeaking && (
                    <div className="flex items-end gap-0.5 h-3 px-0.5">
                      <span className="w-0.5 bg-cyan-400 h-2 animate-[pulse_0.4s_ease-in-out_infinite]" />
                      <span className="w-0.5 bg-cyan-400 h-3 animate-[pulse_0.3s_ease-in-out_infinite_0.1s]" />
                      <span className="w-0.5 bg-cyan-400 h-1.5 animate-[pulse_0.5s_ease-in-out_infinite_0.2s]" />
                    </div>
                  )}
                  <span className="hidden xs:inline">VOICE</span>
                  <span className={isSpeaking ? 'text-cyan-200' : 'text-cyan-400'}>
                    {isSpeaking ? 'TALK' : 'ON'}
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden xs:inline">VOICE</span>
                  <span className="text-slate-500">OFF</span>
                </>
              )}
            </button>
          )}

          {/* DEVIL Man Voice Matrix Settings Button */}
          {onOpenVoiceSettings && (
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenVoiceSettings();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 hover:bg-red-900/60 transition shadow-sm text-[10px] font-bold tracking-wider uppercase active:scale-95"
              title="Open DEVIL Man Voice Matrix (पुरुष आवाज़ ट्यूनर व सेटिंग्स)"
            >
              <Mic className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden xs:inline">MAN VOICE</span>
            </button>
          )}

          {/* All-Time Voice Toggle Button */}
          {onToggleAlwaysOnVoice && (
            <button
              onClick={() => {
                soundFX.playClick();
                onToggleAlwaysOnVoice();
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition text-[10px] font-bold tracking-wider uppercase active:scale-95 ${
                isAlwaysOnVoice
                  ? 'bg-red-950/80 border-red-500 text-red-300 shadow-sm shadow-red-500/40 animate-pulse'
                  : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={isAlwaysOnVoice ? 'DEVIL All-Time Voice Assistant is ACTIVE (Click to toggle)' : 'Turn On All-Time DEVIL Voice Assistant'}
            >
              <Mic className={`w-3.5 h-3.5 ${isAlwaysOnVoice ? 'text-red-400' : 'text-slate-500'}`} />
              <span className="hidden xs:inline">ALL-TIME</span>
              <span className={isAlwaysOnVoice ? 'text-red-400' : 'text-slate-500'}>{isAlwaysOnVoice ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* All Mobile Manager Button */}
          {onOpenMobileManager && (
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenMobileManager();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 transition shadow-sm shadow-red-900/40"
              title="Open DEVIL All Mobile Manager (Device Care, Battery, RAM, Storage)"
            >
              <Gauge className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] uppercase tracking-wider font-bold">MANAGER</span>
            </button>
          )}

          {/* Screen Vision Inspector Button */}
          {onOpenScreenVision && (
            <button
              onClick={() => {
                soundFX.playScanPing();
                onOpenScreenVision();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-950/60 border border-pink-500/40 text-pink-300 hover:bg-pink-900/60 transition shadow-sm shadow-pink-950/40"
              title="DEVIL Screen Vision (See My Screen, Instagram ID, Wi-Fi Passwords)"
            >
              <Monitor className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[10px] uppercase tracking-wider font-bold">SEE SCREEN</span>
            </button>
          )}

          {/* ALL CLEAR Screen & Stream Button */}
          {onClearUI && (
            <button
              onClick={() => {
                soundFX.playConfirm();
                onClearUI();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/85 border border-red-500/70 text-red-300 hover:bg-red-900/90 transition shadow-[0_0_10px_rgba(239,68,68,0.4)] shrink-0 active:scale-95"
              title="ALL CLEAR (पूरी स्क्रीन व टर्मिनल स्ट्रीम तुरंत साफ़ करें)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold">ALL CLEAR</span>
            </button>
          )}

          {/* New UI Clear Black Screen 3D Quantum Launcher */}
          {onOpenQuantumCore && (
            <button
              onClick={() => {
                soundFX.playPowerUp();
                onOpenQuantumCore();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black border border-cyan-400/80 text-cyan-300 hover:bg-cyan-950/80 hover:border-cyan-300 transition shadow-[0_0_12px_rgba(6,182,212,0.4)] shrink-0 active:scale-95"
              title="Open New UI Clear Black Screen 3D Quantum"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-200">3D QUANTUM</span>
            </button>
          )}

          {/* J.A.R.V.I.S. Arc Hologram Web Interface Launcher */}
          {onOpenJarvisInterface && (
            <button
              onClick={() => {
                soundFX.playPowerUp();
                onOpenJarvisInterface();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-950/80 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/20 transition shadow-[0_0_8px_rgba(0,240,255,0.3)] shrink-0"
              title="Open J.A.R.V.I.S. Dual-Arc Hologram Web Interface"
            >
              <span className="w-2 h-2 rounded-full bg-[#ffaa00] animate-ping" />
              <span className="text-[10px] uppercase tracking-wider font-bold">JARVIS HUD</span>
            </button>
          )}

          {/* Optical Vision Scanner Button */}
          <button
            onClick={() => {
              soundFX.playScanPing();
              onOpenVision();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition"
            title="Open DEVIL Optical Vision Camera"
          >
            <span className="text-[10px] uppercase tracking-wider font-semibold">HUD VISION</span>
          </button>

          {/* DEVIL Mobile Suite Tools */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenTools();
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 transition"
            title="Open DEVIL Mobile Suite (Notes, Alarms, Telemetry)"
          >
            <Settings2 className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Sci-Fi Sound Effects (Beeps) Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border transition ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                : 'bg-slate-900 border-slate-800 text-slate-600'
            }`}
            title={soundEnabled ? 'Sci-Fi Sound FX (Beeps): ON (Click to Mute)' : 'Sci-Fi Sound FX (Beeps): OFF (Click to Enable)'}
          >
            {soundEnabled ? <Bell className="w-4 h-4 text-cyan-400" /> : <BellOff className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

      </div>
    </header>
  );
};
