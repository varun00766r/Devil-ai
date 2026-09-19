import React, { useState, useEffect } from 'react';
import { Clock, Globe, Calendar, Zap, ShieldCheck } from 'lucide-react';
import { soundFX } from '../lib/audio';

export const LiveClockCard: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());
  const [use24Hour, setUse24Hour] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatISTTime = (d: Date) => {
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !use24Hour,
    });
  };

  const formatUTCTime = (d: Date) => {
    return d.toLocaleTimeString('en-GB', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !use24Hour,
    });
  };

  const formatISTDate = (d: Date) => {
    return d.toLocaleDateString('hi-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatEnglishDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="my-2 p-4 bg-slate-950 border border-red-500/60 rounded-xl shadow-2xl space-y-3 font-mono relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-red-950/80">
        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
          <Clock className="w-4 h-4 text-red-500 animate-spin" style={{ animationDuration: '8s' }} />
          <span>DEVIL Live HUD Time Matrix</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundFX.playClick();
              setUse24Hour(!use24Hour);
            }}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-red-300 border border-red-800/60 px-2 py-0.5 rounded-md font-sans transition"
          >
            {use24Hour ? '24H Format' : '12H Format'}
          </button>
          <span className="flex items-center gap-1 text-[10px] bg-red-950 text-red-400 border border-red-800/60 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            LIVE
          </span>
        </div>
      </div>

      {/* Primary Big Digital Clock (IST - India / Gwalior) */}
      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-red-900/50 text-center relative">
        <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1 mb-1">
          <Globe className="w-3 h-3 text-red-400" />
          <span>Indian Standard Time (IST) • Gwalior / India</span>
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-200 to-red-500 tracking-wider py-1 font-mono drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]">
          {formatISTTime(time)}
        </div>

        <div className="mt-1 flex items-center justify-center gap-2 text-xs text-red-200/90 font-sans font-medium">
          <Calendar className="w-3.5 h-3.5 text-red-400" />
          <span>{formatISTDate(time)}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{formatEnglishDate(time)}</span>
        </div>
      </div>

      {/* Secondary Timezone Bar (UTC / GMT) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-center justify-between">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>UTC / GMT</span>
          </div>
          <div className="font-bold text-slate-200 font-mono text-[11px]">
            {formatUTCTime(time)}
          </div>
        </div>

        <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-center justify-between">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Clock Sync</span>
          </div>
          <div className="font-bold text-emerald-400 font-mono text-[11px]">
            100% Accurate
          </div>
        </div>
      </div>
    </div>
  );
};
