import React, { useState, useEffect } from 'react';
import {
  soundFX,
  getMaleVoiceConfig,
  setMaleVoiceConfig,
  getAvailableSystemVoices,
  testManVoice,
  findBestIndianMaleVoice,
  MALE_VOICE_PRESETS,
  MaleVoiceConfig,
  SystemVoiceItem,
} from '../lib/audio';
import { Mic, Volume2, Play, Square, Check, RefreshCw, Sliders, ShieldCheck, Sparkles } from 'lucide-react';

interface VoiceManagerCardProps {
  onClose?: () => void;
  compact?: boolean;
}

export const VoiceManagerCard: React.FC<VoiceManagerCardProps> = ({ onClose, compact = false }) => {
  const [config, setConfig] = useState<MaleVoiceConfig>(getMaleVoiceConfig());
  const [systemVoices, setSystemVoices] = useState<SystemVoiceItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activePhrase, setActivePhrase] = useState('नमस्ते बॉस! DEVIL की भारी भारतीय पुरुष आवाज़ सक्रिय है। आदेश दीजिए!');

  // Refresh voices on mount and when browser loads them
  const loadVoices = () => {
    const list = getAvailableSystemVoices();
    setSystemVoices(list);
  };

  useEffect(() => {
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleSelectPreset = (presetKey: MaleVoiceConfig['preset']) => {
    soundFX.playClick();
    const preset = MALE_VOICE_PRESETS[presetKey];
    let voiceURI = config.voiceURI;
    if (presetKey === 'indian_man') {
      const bestIndian = findBestIndianMaleVoice();
      if (bestIndian) voiceURI = bestIndian.voiceURI;
    }

    const newConfig: MaleVoiceConfig = {
      ...config,
      preset: presetKey,
      pitch: preset.pitch,
      rate: preset.rate,
      voiceURI,
    };
    setConfig(newConfig);
    setMaleVoiceConfig(newConfig);
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const newConfig = { ...config, pitch: val };
    setConfig(newConfig);
    setMaleVoiceConfig(newConfig);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const newConfig = { ...config, rate: val };
    setConfig(newConfig);
    setMaleVoiceConfig(newConfig);
  };

  const handleVoiceURIChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newConfig = { ...config, voiceURI: val || undefined };
    setConfig(newConfig);
    setMaleVoiceConfig(newConfig);
  };

  const handlePlayTest = (customText?: string) => {
    const textToSpeak = customText || activePhrase;
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    soundFX.playConfirm();
    setIsPlaying(true);
    testManVoice(textToSpeak, () => {
      setIsPlaying(false);
    });
  };

  const handleSave = () => {
    setMaleVoiceConfig(config);
    soundFX.playConfirm();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const testPhrases = [
    'नमस्ते बॉस! DEVIL की भारी भारतीय पुरुष आवाज़ सक्रिय है। आदेश दीजिए!',
    'बॉस! सभी सिस्टम ऑनलाइन हैं। क्या कार्य शुरू करें?',
    'DEVIL Supreme AI Core is at your command, Boss!',
    'बॉस, आपकी लोकेशन, वाई-फ़ाई और स्क्रीन विज़न पूरी तरह तैयार है।',
  ];

  return (
    <div className="w-full bg-slate-950/95 border border-red-500/40 rounded-xl p-3.5 sm:p-4 text-xs font-mono shadow-2xl shadow-red-950/40 my-2 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-900/50 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-950 border border-red-500/60 flex items-center justify-center text-red-400 shadow-sm shadow-red-500/30">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-wider text-red-400 uppercase text-xs">
                DEVIL MAN VOICE MATRIX
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 border border-red-600/40 text-red-300 font-semibold">
                पुरुष स्वर
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              गहरा, भारी एवं कमांडिंग पुरुष स्वर (Deep Masculine Voice)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" />
            <span>MALE ACTIVE</span>
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="mb-3.5">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center justify-between">
          <span>Select Male Voice Preset (स्वर प्रीसेट):</span>
          <Sparkles className="w-3 h-3 text-red-400" />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(MALE_VOICE_PRESETS).map(([key, preset]) => {
            const isSelected = config.preset === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectPreset(key as any)}
                className={`text-left p-2 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-red-950/80 border-red-500 text-red-200 shadow-md shadow-red-900/30 ring-1 ring-red-500/50'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px]">{preset.label}</span>
                  {isSelected && <Check className="w-3 h-3 text-red-400" />}
                </div>
                <div className="text-[9px] text-slate-400 font-sans mt-0.5 truncate">
                  {preset.hindiLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Fine-Tuning Sliders */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 mb-3 space-y-2.5">
        <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold">
          <span className="flex items-center gap-1 text-red-400">
            <Sliders className="w-3 h-3" />
            <span>Voice Frequency & Pitch (आवाज़ की गहराई / बास):</span>
          </span>
          <span className="font-mono text-red-300 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800/40">
            {config.pitch.toFixed(2)}x {config.pitch <= 0.70 ? '(Deep Male)' : '(Standard)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-400 w-12">गहरी (Deep)</span>
          <input
            type="range"
            min="0.50"
            max="1.10"
            step="0.02"
            value={config.pitch}
            onChange={handlePitchChange}
            className="flex-1 accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[9px] text-slate-400 w-10 text-right">तीखी</span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold pt-1 border-t border-slate-800/60">
          <span className="text-slate-300">Speech Rate (बोलने की गति):</span>
          <span className="font-mono text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">
            {config.rate.toFixed(2)}x
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-400 w-12">धीमी</span>
          <input
            type="range"
            min="0.75"
            max="1.30"
            step="0.05"
            value={config.rate}
            onChange={handleRateChange}
            className="flex-1 accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[9px] text-slate-400 w-10 text-right">तेज़</span>
        </div>
      </div>

      {/* System Voices Selection (if available) */}
      {systemVoices.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            <span>Hardware/OS Voice Engine:</span>
            <button
              onClick={loadVoices}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
              title="Refresh installed voices"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Refresh
            </button>
          </div>
          <select
            value={config.voiceURI || ''}
            onChange={handleVoiceURIChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="">Auto Deep Male Filter (Recommended - केवल पुरुष स्वर लॉक)</option>
            {systemVoices
              .filter((v) => v.isMale)
              .map((v, idx) => (
                <option key={`sys_male_voice_opt_${idx}_${v.voiceURI || v.name}`} value={v.voiceURI}>
                  ♂ [MALE ONLY] {v.name} ({v.lang})
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Quick Test Phrases */}
      <div className="mb-3">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
          Quick Test Sample (टेस्ट वाक्य):
        </div>
        <div className="flex flex-col gap-1">
          {testPhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActivePhrase(phrase);
                handlePlayTest(phrase);
              }}
              className="text-left text-[10px] font-sans px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-red-500/60 hover:text-red-300 transition flex items-center justify-between"
            >
              <span className="truncate">{phrase}</span>
              <Volume2 className="w-3 h-3 text-red-400 shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={() => handlePlayTest()}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border font-bold text-xs uppercase tracking-wider transition ${
            isPlaying
              ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
              : 'bg-red-900/60 border-red-500/60 text-red-200 hover:bg-red-800/60 shadow-lg shadow-red-950/60'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Speaking Male Voice... (Stop)</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test Man Voice (आवाज़ सुनें)</span>
            </>
          )}
        </button>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 hover:text-emerald-300 transition text-xs font-semibold"
        >
          {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Check className="w-3.5 h-3.5" />}
          <span>{savedSuccess ? 'Saved!' : 'Save Voice'}</span>
        </button>
      </div>
    </div>
  );
};
