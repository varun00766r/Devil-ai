import React from 'react';
import { Newspaper, Cpu, TrendingUp, CloudSun, Sparkles, Trophy, Compass, Search, Coins, Globe, Trash2, RotateCcw, Pin, PhoneCall, Download, Radio, MapPin } from 'lucide-react';
import { Persona } from '../types';
import { soundFX } from '../lib/audio';

interface QuickSearchChipsProps {
  onSelectQuery: (query: string) => void;
  disabled?: boolean;
  currentPersona?: Persona;
}

interface ChipItem {
  id: string;
  label: string;
  query: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge?: string;
  badgePulse?: boolean;
}

const SEARCH_CHIPS: ChipItem[] = [
  {
    id: 'chip-ui-clearing',
    label: 'UI Clearing (साफ स्क्रीन)',
    query: 'ui clearing and ui clearly',
    icon: Trash2,
    accentColor: 'border-rose-500 text-rose-300 hover:border-rose-400 hover:bg-rose-950/80 active:bg-rose-900/90 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    badge: 'CLEAR UI',
  },
  {
    id: 'chip-number-location',
    label: 'Number Live Location',
    query: 'mobile number live location',
    icon: Radio,
    accentColor: 'border-red-500 text-red-300 hover:border-red-400 hover:bg-red-950/80 active:bg-red-900/90 shadow-[0_0_12px_rgba(239,68,68,0.35)]',
    badge: 'LIVE RADAR',
    badgePulse: true,
  },
  {
    id: 'chip-apk-download',
    label: 'APK Download',
    query: 'apk download',
    icon: Download,
    accentColor: 'border-red-500 text-red-300 hover:border-red-400 hover:bg-red-950/80 active:bg-red-900/90 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
    badge: 'MOBILE APP',
    badgePulse: true,
  },
  {
    id: 'chip-fake-call',
    label: 'Fake Number Calling',
    query: 'fake number calling',
    icon: PhoneCall,
    accentColor: 'border-red-500 text-red-300 hover:border-red-400 hover:bg-red-950/80 active:bg-red-900/90 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
    badge: 'ESCAPE CALL',
    badgePulse: true,
  },
  {
    id: 'chip-pinned-widgets',
    label: 'Pinned Widgets',
    query: 'show pinned widgets',
    icon: Pin,
    accentColor: 'border-amber-400 text-amber-300 hover:border-amber-300 hover:bg-amber-950/80 active:bg-amber-900/90 shadow-[0_0_8px_rgba(245,158,11,0.25)]',
    badge: 'ARC HUD',
    badgePulse: true,
  },
  {
    id: 'chip-all-clear-quantum',
    label: 'ALL CLEAR 3D QUANTUM',
    query: 'new ui clear black screen 3d quantum all clear',
    icon: RotateCcw,
    accentColor: 'border-cyan-400 text-cyan-300 hover:border-cyan-300 hover:bg-cyan-950/80 active:bg-cyan-900/90 shadow-[0_0_10px_rgba(6,182,212,0.3)]',
    badge: 'CLEAR BLACK',
    badgePulse: true,
  },
  {
    id: 'chip-clear-ui',
    label: 'ALL CLEAR',
    query: 'all clear',
    icon: Trash2,
    accentColor: 'border-rose-500 text-rose-300 hover:border-rose-400 hover:bg-rose-950/70 active:bg-rose-900/80',
    badge: 'ALL CLEAR',
  },
  {
    id: 'chip-init-jarvis',
    label: 'INITIALIZE JARVIS',
    query: 'initialize jarvis',
    icon: Sparkles,
    accentColor: 'border-[#00f0ff] text-[#00f0ff] hover:border-[#00f0ff] hover:bg-cyan-950/60 active:bg-cyan-900/70',
    badge: 'JARVIS HUD',
    badgePulse: true,
  },
  {
    id: 'chip-all-india-data',
    label: 'All India Data',
    query: 'All india ka data and fast reply and background on',
    icon: Globe,
    accentColor: 'border-cyan-500/50 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/50 active:bg-cyan-900/60',
    badge: 'ALL STATES',
    badgePulse: true,
  },
  {
    id: 'chip-all-india-news',
    label: 'All India News',
    query: 'New news all India',
    icon: Newspaper,
    accentColor: 'border-red-500/50 text-red-300 hover:border-red-400 hover:bg-red-950/50 active:bg-red-900/60',
    badge: 'LIVE 24x7',
    badgePulse: true,
  },
  {
    id: 'chip-news',
    label: 'World News',
    query: 'What are the top breaking world and global news headlines today?',
    icon: Newspaper,
    accentColor: 'border-orange-500/40 text-orange-300 hover:border-orange-400 hover:bg-orange-950/40 active:bg-orange-900/50',
    badge: 'INTL',
  },
  {
    id: 'chip-tech',
    label: 'Tech Trends',
    query: 'What are the top breaking technology trends, innovations, and AI developments today?',
    icon: Cpu,
    accentColor: 'border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40 active:bg-cyan-900/50',
    badge: 'HOT',
  },
  {
    id: 'chip-stocks',
    label: 'Stock Market',
    query: 'What is the current status and latest update on the stock market today (Sensex, Nifty, Global markets)?',
    icon: TrendingUp,
    accentColor: 'border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-950/40 active:bg-emerald-900/50',
    badge: 'FIN',
  },
  {
    id: 'chip-crypto',
    label: 'Crypto Trends',
    query: 'What are the latest cryptocurrency market prices and top trends for Bitcoin and Ethereum today?',
    icon: Coins,
    accentColor: 'border-yellow-500/40 text-yellow-300 hover:border-yellow-400 hover:bg-yellow-950/40 active:bg-yellow-900/50',
    badge: 'NEW',
  },
  {
    id: 'chip-weather',
    label: 'Weather Today',
    query: 'What is the current weather forecast and temperature today?',
    icon: CloudSun,
    accentColor: 'border-sky-500/40 text-sky-300 hover:border-sky-400 hover:bg-sky-950/40 active:bg-sky-900/50',
  },
  {
    id: 'chip-ai',
    label: 'AI & Science',
    query: 'What are the latest scientific discoveries and artificial intelligence breakthroughs?',
    icon: Sparkles,
    accentColor: 'border-purple-500/40 text-purple-300 hover:border-purple-400 hover:bg-purple-950/40 active:bg-purple-900/50',
  },
  {
    id: 'chip-sports',
    label: 'Sports Updates',
    query: 'What are the latest sports scores, cricket, and athletic tournament results today?',
    icon: Trophy,
    accentColor: 'border-blue-500/40 text-blue-300 hover:border-blue-400 hover:bg-blue-950/40 active:bg-blue-900/50',
  },
  {
    id: 'chip-gwalior',
    label: 'Gwalior News',
    query: 'ग्वालियर (Gwalior, Madhya Pradesh) की आज की प्रमुख खबरें और अपडेट्स क्या हैं?',
    icon: Compass,
    accentColor: 'border-orange-500/40 text-orange-300 hover:border-orange-400 hover:bg-orange-950/40 active:bg-orange-900/50',
  },
];

export const QuickSearchChips: React.FC<QuickSearchChipsProps> = ({
  onSelectQuery,
  disabled = false,
  currentPersona = 'devil',
}) => {
  const handleClick = (query: string) => {
    if (disabled) return;
    soundFX.playClick();
    onSelectQuery(query);
  };

  const isDevil = currentPersona === 'devil';

  return (
    <div id="quick-search-container" className="mb-2.5 w-full">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase text-slate-400">
          <Search className={`w-3 h-3 ${isDevil ? 'text-red-400' : 'text-cyan-400'} animate-pulse`} />
          <span className="font-semibold text-slate-300">Quick Search</span>
        </div>
        <span className="text-[9px] font-mono text-slate-500 tracking-tight">1-Tap Live Grounded Search</span>
      </div>

      <div
        id="quick-search-chips-row"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 touch-pan-x select-none"
      >
        {SEARCH_CHIPS.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              id={chip.id}
              onClick={() => handleClick(chip.query)}
              disabled={disabled}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border text-xs font-medium shrink-0 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${chip.accentColor}`}
              title={chip.query}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap font-medium">{chip.label}</span>
              {chip.badge && (
                <span
                  className={`text-[8px] font-mono px-1 py-0.5 rounded bg-white/10 text-slate-200 uppercase tracking-tighter ${
                    chip.badgePulse ? 'animate-pulse text-red-300 font-bold' : ''
                  }`}
                >
                  {chip.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
