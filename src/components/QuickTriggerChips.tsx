import React from 'react';
import { soundFX } from '../lib/audio';
import { useBatteryStatus } from '../lib/useBatteryStatus';
import {
  BatteryCharging,
  BatteryWarning,
  Battery,
  Timer,
  FileText,
  Zap,
  MapPin,
  Clock,
  Flashlight,
  ListTodo,
  Sparkles,
  Wifi,
  Radio,
  Monitor,
  Globe,
  Trash2,
  ScanFace,
  Smartphone,
} from 'lucide-react';

export interface QuickTriggerChipsProps {
  onCheckBattery: () => void;
  onStartStopwatch: () => void;
  onRecordQuickMemo: () => void;
  onBoostPhone?: () => void;
  onMobileSupport?: () => void;
  onLiveLocation?: () => void;
  onLiveClock?: () => void;
  onSetReminder?: () => void;
  onOpenWiFi?: () => void;
  onSeeScreen?: () => void;
  onFaceScan?: () => void;
  onToggleAllTimeLive?: () => void;
  isAllTimeLive?: boolean;
  onAllIndiaData?: () => void;
  onClearUI?: () => void;
}

export const QuickTriggerChips: React.FC<QuickTriggerChipsProps> = ({
  onCheckBattery,
  onStartStopwatch,
  onRecordQuickMemo,
  onBoostPhone,
  onMobileSupport,
  onLiveLocation,
  onLiveClock,
  onSetReminder,
  onOpenWiFi,
  onSeeScreen,
  onFaceScan,
  onToggleAllTimeLive,
  isAllTimeLive = false,
  onAllIndiaData,
  onClearUI,
}) => {
  const { batteryLevel, isCharging, isLowBattery } = useBatteryStatus();

  const chips = [
    {
      id: 'clear-ui',
      label: 'Clear UI',
      icon: Trash2,
      color: 'text-rose-300 bg-rose-950/80 border-rose-500/60 hover:bg-rose-900/80 hover:border-rose-400',
      glow: 'shadow-rose-950/60',
      action: onClearUI,
      badge: 'RESET',
    },
    {
      id: 'all-india-data',
      label: 'All-India Data',
      icon: Globe,
      color: 'text-cyan-300 bg-cyan-950/80 border-cyan-500/60 hover:bg-cyan-900/80 hover:border-cyan-400',
      glow: 'shadow-cyan-950/60',
      action: onAllIndiaData,
      badge: '36 STATES/UT',
    },
    {
      id: 'all-time-live',
      label: isAllTimeLive ? 'Background Live (ON)' : 'Background Mode',
      icon: Radio,
      color: isAllTimeLive
        ? 'text-emerald-300 bg-emerald-950/90 border-emerald-500/70 hover:bg-emerald-900/90 hover:border-emerald-400'
        : 'text-rose-400 bg-rose-950/40 border-rose-500/40 hover:bg-rose-900/50 hover:border-rose-400',
      glow: isAllTimeLive ? 'shadow-emerald-950/70 animate-pulse' : 'shadow-rose-950/40',
      action: onToggleAllTimeLive,
      badge: isAllTimeLive ? '24x7 ON' : 'WAKE LOCK',
    },
    {
      id: 'see-screen',
      label: 'See My Screen',
      icon: Monitor,
      color: 'text-pink-300 bg-pink-950/70 border-pink-500/50 hover:bg-pink-900/70 hover:border-pink-400',
      glow: 'shadow-pink-950/50',
      action: onSeeScreen,
      badge: 'HUD',
    },
    {
      id: 'face-scan',
      label: 'Face se Details (नाम, पता)',
      icon: ScanFace,
      color: 'text-emerald-300 bg-emerald-950/80 border-emerald-500/60 hover:bg-emerald-900/80 hover:border-emerald-400',
      glow: 'shadow-emerald-950/60',
      action: onFaceScan,
      badge: 'INTEL',
    },
    {
      id: 'battery',
      label: isLowBattery ? `Battery Low (${batteryLevel}%)` : `Check Battery (${batteryLevel}%)`,
      icon: isLowBattery ? BatteryWarning : isCharging ? BatteryCharging : Battery,
      color: isLowBattery
        ? 'text-red-300 bg-red-950/80 border-red-500/70 hover:bg-red-900/80 hover:border-red-400 animate-pulse'
        : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40 hover:bg-emerald-900/60 hover:border-emerald-400',
      glow: isLowBattery ? 'shadow-red-950/70' : 'shadow-emerald-950/50',
      action: onCheckBattery,
      badge: isLowBattery ? 'RED THEME' : isCharging ? '⚡' : undefined,
    },
    {
      id: 'stopwatch',
      label: 'Start Stopwatch',
      icon: Timer,
      color: 'text-red-400 bg-red-950/60 border-red-500/50 hover:bg-red-900/60 hover:border-red-400',
      glow: 'shadow-red-950/50',
      action: onStartStopwatch,
    },
    {
      id: 'memo',
      label: 'Record Quick Memo',
      icon: FileText,
      color: 'text-amber-400 bg-amber-950/60 border-amber-500/40 hover:bg-amber-900/60 hover:border-amber-400',
      glow: 'shadow-amber-950/50',
      action: onRecordQuickMemo,
    },
    {
      id: 'mobile-support',
      label: 'Mere Mobile Ka Support',
      icon: Smartphone,
      color: 'text-red-300 bg-red-950/80 border-red-500/70 hover:bg-red-900/80 hover:border-red-400',
      glow: 'shadow-red-950/60',
      action: onMobileSupport || onBoostPhone,
      badge: 'PHONE CARE',
    },
    {
      id: 'boost',
      label: 'Boost Phone',
      icon: Zap,
      color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40 hover:bg-cyan-900/60 hover:border-cyan-400',
      glow: 'shadow-cyan-950/50',
      action: onBoostPhone,
    },
    {
      id: 'clock',
      label: 'Live Clock',
      icon: Clock,
      color: 'text-rose-400 bg-rose-950/60 border-rose-500/40 hover:bg-rose-900/60 hover:border-rose-400',
      glow: 'shadow-rose-950/50',
      action: onLiveClock,
    },
    {
      id: 'location',
      label: 'My Location',
      icon: MapPin,
      color: 'text-teal-400 bg-teal-950/60 border-teal-500/40 hover:bg-teal-900/60 hover:border-teal-400',
      glow: 'shadow-teal-950/50',
      action: onLiveLocation,
    },
    {
      id: 'reminder',
      label: 'Set Reminder',
      icon: ListTodo,
      color: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/40 hover:bg-indigo-900/60 hover:border-indigo-400',
      glow: 'shadow-indigo-950/50',
      action: onSetReminder,
    },
    {
      id: 'wifi',
      label: 'Wi-Fi Password',
      icon: Wifi,
      color: 'text-sky-400 bg-sky-950/60 border-sky-500/40 hover:bg-sky-900/60 hover:border-sky-400',
      glow: 'shadow-sky-950/50',
      action: onOpenWiFi,
    },
  ];

  return (
    <div className="w-full px-2 py-1.5 overflow-hidden">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1">
        {chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              onClick={() => {
                soundFX.playClick();
                chip.action?.();
              }}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-sans font-semibold transition active:scale-95 shadow-sm backdrop-blur-md ${chip.color} ${chip.glow}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{chip.label}</span>
              {chip.badge && (
                <span className="text-[10px] leading-none animate-pulse">{chip.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
