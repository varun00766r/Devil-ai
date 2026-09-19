import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Clock,
  User,
  Shield,
  Bot,
  Building2,
  AlertTriangle,
  Play,
  XCircle,
  Sparkles,
  Volume2,
  Info,
  ShieldAlert,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { soundFX } from '../lib/audio';
import { FakeCallConfig } from '../types';

export interface FakeCallLauncherProps {
  onScheduleCall: (config: FakeCallConfig) => void;
  scheduledCall: { config: FakeCallConfig; triggerTime: number } | null;
  onCancelScheduledCall: () => void;
}

const PRESET_CALLERS: Omit<FakeCallConfig, 'id' | 'delaySeconds'>[] = [
  {
    callerName: 'Private Number',
    callerNumber: 'Restricted Caller ID',
    callerTag: 'Unknown Circle • Private Line',
    avatarIcon: 'user',
    scriptId: 'escape',
    scriptText:
      'Hello, sorry to disturb you, but we have an emergency situation at the office. Please excuse yourself and attend to this immediately.',
  },
  {
    callerName: 'Office Boss / Manager',
    callerNumber: '+91 98110 54321',
    callerTag: 'Corporate HQ • Urgent Escalation',
    avatarIcon: 'building',
    scriptId: 'boss',
    scriptText:
      'Hello, are you free to talk? We have a critical issue with the production deployment. I need you on the bridge right now.',
  },
  {
    callerName: 'Police Control (112)',
    callerNumber: '112',
    callerTag: 'Delhi Police ERSS • Official Line',
    avatarIcon: 'shield',
    scriptId: 'police',
    scriptText:
      'नमस्ते, दिल्ली पुलिस कंट्रोल रूम से कॉल है। आपके संदर्भ क्रमांक 8829 के सत्यापन के लिए तत्काल बात करें।',
  },
  {
    callerName: 'Mom (माँ)',
    callerNumber: '+91 98765 43210',
    callerTag: 'Home • Family Emergency',
    avatarIcon: 'user',
    scriptId: 'family',
    scriptText:
      'बेटा, कहाँ हो तुम? घर जल्दी आओ, बहुत ज़रूरी काम है। प्लीज़ तुरंत निकलो!',
  },
  {
    callerName: 'DEVIL AI Core',
    callerNumber: '+00 777 666 1337',
    callerTag: 'Quantum Defense Matrix • Priority 1',
    avatarIcon: 'bot',
    scriptId: 'devil',
    scriptText:
      'Boss, Devil AI security protocol triggered. Unusual perimeter anomaly detected. Advise immediate departure from your current location.',
  },
  {
    callerName: 'City Hospital Emergency',
    callerNumber: '+91 11 2658 8500',
    callerTag: 'Trauma Care Unit • Verification',
    avatarIcon: 'alert',
    scriptId: 'medical',
    scriptText:
      'Hello, calling from City Hospital administrative desk. Please confirm your presence for immediate patient handover.',
  },
];

const VOICE_SCRIPTS = [
  {
    id: 'escape',
    label: 'Meeting Escape (मीटिंग से निकलना)',
    text: 'Hello, sorry to disturb you, but we have an emergency situation at the office. Please excuse yourself and attend to this immediately.',
  },
  {
    id: 'boss',
    label: 'Boss Work Escalation (बॉस का अर्जेंट काम)',
    text: 'Hello, are you free to talk? We have a critical issue with the production deployment. I need you on the bridge right now.',
  },
  {
    id: 'family',
    label: 'Family Urgent (घर से जरूरी कॉल)',
    text: 'बेटा, कहाँ हो तुम? घर जल्दी आओ, बहुत ज़रूरी काम है। प्लीज़ तुरंत निकलो!',
  },
  {
    id: 'police',
    label: 'Official Police Verification (पुलिस सत्यापन)',
    text: 'नमस्ते, दिल्ली पुलिस कंट्रोल रूम से कॉल है। आपके संदर्भ क्रमांक 8829 के सत्यापन के लिए तत्काल बात करें।',
  },
  {
    id: 'devil',
    label: 'DEVIL Tactical Evacuation (एआई कमांड)',
    text: 'Boss, Devil AI security protocol triggered. Unusual perimeter anomaly detected. Advise immediate departure from your current location.',
  },
  {
    id: 'silent',
    label: 'Silent (No Voice Speech - सिर्फ रिंग)',
    text: '',
  },
];

export const FakeCallLauncherCard: React.FC<FakeCallLauncherProps> = ({
  onScheduleCall,
  scheduledCall,
  onCancelScheduledCall,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customName, setCustomName] = useState('Private Number');
  const [customNumber, setCustomNumber] = useState('+91 98765 43210');
  const [customTag, setCustomTag] = useState('New Delhi Circle');
  const [selectedIcon, setSelectedIcon] = useState<'phone' | 'shield' | 'user' | 'bot' | 'building' | 'alert'>('user');
  const [delaySeconds, setDelaySeconds] = useState<number>(1);
  const [selectedScriptId, setSelectedScriptId] = useState<string>('escape');
  const [customScriptText, setCustomScriptText] = useState('');
  const [showCustomDetails, setShowCustomDetails] = useState(false);
  const [showIntel, setShowIntel] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Countdown timer for scheduled call
  useEffect(() => {
    if (!scheduledCall) {
      setRemainingTime(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((scheduledCall.triggerTime - now) / 1000));
      setRemainingTime(diff);
      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [scheduledCall]);

  const handleApplyPreset = (index: number) => {
    soundFX.playClick();
    setSelectedPresetIndex(index);
    const p = PRESET_CALLERS[index];
    setCustomName(p.callerName);
    setCustomNumber(p.callerNumber);
    setCustomTag(p.callerTag);
    setSelectedIcon(p.avatarIcon || 'user');
    setSelectedScriptId(p.scriptId);
    setCustomScriptText(p.scriptText || '');
  };

  const handleLaunchOrSchedule = (delay: number) => {
    soundFX.playConfirm();
    setDelaySeconds(delay);

    let scriptText = customScriptText;
    if (selectedScriptId !== 'custom') {
      const found = VOICE_SCRIPTS.find((s) => s.id === selectedScriptId);
      scriptText = found ? found.text : '';
    }

    const config: FakeCallConfig = {
      id: Date.now().toString(),
      callerName: customName.trim() || 'Private Number',
      callerNumber: customNumber.trim() || 'Unknown',
      callerTag: customTag.trim() || 'Secure Line',
      avatarIcon: selectedIcon,
      scriptId: selectedScriptId,
      scriptText,
      delaySeconds: delay,
    };

    onScheduleCall(config);
  };

  return (
    <div className="p-4 bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl space-y-4 font-sans text-slate-200">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-950/80">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 shadow-inner">
            <PhoneCall className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="tracking-wide uppercase font-mono text-xs">DEVIL Tactical Simulator</div>
            <div className="text-sm font-bold text-white">Fake Number Incoming Call (फेक कॉल)</div>
          </div>
        </div>

        <span className="text-[11px] bg-red-950/90 text-red-300 border border-red-800/60 px-2.5 py-1 rounded-full font-mono font-semibold">
          Anti-Awkward Shield
        </span>
      </div>

      {/* ACTIVE SCHEDULED CALL ALERT (If timer running) */}
      {scheduledCall && remainingTime !== null && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/90 border border-red-500/60 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-red-400 animate-spin" />
            <div>
              <div className="text-xs font-bold text-white">
                Fake Call Scheduled: ringing in <span className="text-red-400 font-mono text-sm">{remainingTime}s</span>
              </div>
              <div className="text-[11px] text-slate-300">
                From: <span className="font-semibold text-cyan-300">{scheduledCall.config.callerName}</span> ({scheduledCall.config.callerNumber})
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onCancelScheduledCall();
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {/* Preset Callers Carousel */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Fake Caller Preset (कॉलर चुनें):</span>
          </span>
          <span className="text-[10px] text-slate-500 font-normal">1-tap instant switch</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_CALLERS.map((preset, idx) => {
            const isSelected = selectedPresetIndex === idx;
            return (
              <button
                key={preset.callerName}
                type="button"
                onClick={() => handleApplyPreset(idx)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold truncate text-white">{preset.callerName}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </div>
                <div className="text-[10px] font-mono text-cyan-400/90 truncate">{preset.callerNumber}</div>
                <div className="text-[9px] text-slate-500 truncate mt-0.5">{preset.callerTag}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Caller Toggle / Editor */}
      <div className="border border-slate-800/80 rounded-xl p-3 bg-slate-900/60 space-y-3">
        <div
          onClick={() => setShowCustomDetails(!showCustomDetails)}
          className="flex items-center justify-between cursor-pointer select-none text-xs font-semibold text-slate-300 hover:text-white"
        >
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Customize Caller ID & Number (नाम/नंबर बदलें)</span>
          </div>
          {showCustomDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>

        {showCustomDetails && (
          <div className="pt-2 border-t border-slate-800 space-y-3 animate-in fade-in text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Caller Name (दिखने वाला नाम):</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Inspector Sharma, Boss, Landlord..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Fake Number (दिखने वाला नंबर):</label>
                <input
                  type="text"
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210 or Unknown"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Telecom Circle / Tag:</label>
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="e.g. Delhi NCR • Secure Line"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Avatar Icon Type:</label>
                <div className="flex gap-1.5">
                  {(['user', 'building', 'shield', 'bot', 'alert'] as const).map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center transition capitalize text-[10px] ${
                        selectedIcon === icon
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice Script Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>In-Call Voice Speech (कॉल उठाने पर क्या बोलेगा?):</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {VOICE_SCRIPTS.map((script) => (
            <button
              key={script.id}
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSelectedScriptId(script.id);
                setCustomScriptText(script.text);
              }}
              className={`p-2 rounded-xl border text-left transition flex items-start justify-between text-xs ${
                selectedScriptId === script.id
                  ? 'bg-emerald-950/70 border-emerald-400 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <div className="font-semibold text-[11px] text-slate-200">{script.label}</div>
                {script.text && <div className="text-[10px] text-slate-400 line-clamp-1 italic mt-0.5">"{script.text}"</div>}
              </div>
              {selectedScriptId === script.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1 mt-0.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Launch Delay Buttons */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Timer & Launch Fake Call (कॉल कब आए?):</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Sound + Ringtone + Speech</span>
        </label>

        <div className="grid grid-cols-5 gap-1.5">
          <button
            onClick={() => handleLaunchOrSchedule(1)}
            className="py-2.5 px-1 rounded-xl bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg flex flex-col items-center justify-center transition active:scale-95"
            title="Ring instantly in 1 second"
          >
            <Play className="w-4 h-4 fill-white mb-0.5" />
            <span className="text-[10px]">Now (अभी)</span>
          </button>

          <button
            onClick={() => handleLaunchOrSchedule(5)}
            className="py-2.5 px-1 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 font-semibold text-xs flex flex-col items-center justify-center transition active:scale-95"
          >
            <span className="font-mono text-sm font-bold">5s</span>
            <span className="text-[9px] text-slate-400">Seconds</span>
          </button>

          <button
            onClick={() => handleLaunchOrSchedule(15)}
            className="py-2.5 px-1 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex flex-col items-center justify-center transition active:scale-95 shadow-sm"
          >
            <span className="font-mono text-sm font-bold text-emerald-300">15s</span>
            <span className="text-[9px] text-emerald-400">Escape</span>
          </button>

          <button
            onClick={() => handleLaunchOrSchedule(30)}
            className="py-2.5 px-1 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 font-semibold text-xs flex flex-col items-center justify-center transition active:scale-95"
          >
            <span className="font-mono text-sm font-bold">30s</span>
            <span className="text-[9px] text-slate-400">Seconds</span>
          </button>

          <button
            onClick={() => handleLaunchOrSchedule(60)}
            className="py-2.5 px-1 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 font-semibold text-xs flex flex-col items-center justify-center transition active:scale-95"
          >
            <span className="font-mono text-sm font-bold">1m</span>
            <span className="text-[9px] text-slate-400">Minute</span>
          </button>
        </div>
      </div>

      {/* Cyber Security & Legal Info Accordion */}
      <div className="border border-red-950/80 rounded-xl p-3 bg-red-950/20 text-xs space-y-2">
        <div
          onClick={() => setShowIntel(!showIntel)}
          className="flex items-center justify-between cursor-pointer select-none text-red-300 font-bold"
        >
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Cyber Security & Fake Caller ID Intel (साइबर सुरक्षा और कानून)</span>
          </div>
          {showIntel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {showIntel && (
          <div className="pt-2 border-t border-red-900/40 text-[11px] text-slate-300 space-y-2 leading-relaxed animate-in fade-in">
            <p>
              🛡️ <strong>DEVIL Privacy Shield:</strong> यह टूल केवल एक स्थानीय सिम्युलेटर (Local Device Simulator) है जो आपको अनचाही मीटिंग्स, पार्टियों या असहज परिस्थितियों से बिना किसी विवाद के बाहर निकलने (Meeting Escape) में मदद करता है।
            </p>
            <p>
              ⚠️ <strong>Caller ID Spoofing Awarenss:</strong> असली दुनिया में साइबर ठग VoIP (Voice over IP) और SIP प्रोटोकॉल में कॉलर आईडी स्पूफ करके खुद को पुलिस या CBI अधिकारी बताकर "Digital Arrest" और पार्सल फ्रॉड करते हैं।
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>भारत सरकार के दूरसंचार विभाग (DoT) और TRAI के अनुसार कॉलर आईडी स्पूफिंग गैरकानूनी है।</li>
              <li>IT Act धारा 66D के तहत प्रतिरूपण (Impersonation) द्वारा धोखाधड़ी पर 3 वर्ष तक की जेल हो सकती है।</li>
              <li>किसी भी संदिग्ध कॉल की शिकायत तुरंत <strong>1930</strong> साइबर हेल्पलाइन या <strong>cybercrime.gov.in</strong> पर दर्ज करें।</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
