import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../lib/audio';
import { Play, Pause, RotateCcw, Flag, Clock, Timer, Sparkles, X } from 'lucide-react';

interface LapItem {
  id: number;
  time: number;
  split: number;
}

interface StopwatchCardProps {
  autoStart?: boolean;
  onClose?: () => void;
}

export const StopwatchCard: React.FC<StopwatchCardProps> = ({ autoStart = true, onClose }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const [laps, setLaps] = useState<LapItem[]>([]);
  const startTimeRef = useRef<number>(Date.now() - elapsedTime);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedTime;

      const updateTimer = () => {
        setElapsedTime(Date.now() - startTimeRef.current);
        requestRef.current = requestAnimationFrame(updateTimer);
      };

      requestRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning]);

  const handleToggle = () => {
    soundFX.playClick();
    if (isRunning) {
      setIsRunning(false);
    } else {
      setIsRunning(true);
      soundFX.playPowerUp();
    }
  };

  const handleReset = () => {
    soundFX.playClick();
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isRunning && elapsedTime === 0) return;
    soundFX.playConfirm();
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const split = elapsedTime - lastLapTime;
    const newLap: LapItem = {
      id: laps.length + 1,
      time: elapsedTime,
      split: split > 0 ? split : elapsedTime,
    };
    setLaps((prev) => [newLap, ...prev]);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      min: pad(minutes),
      sec: pad(seconds),
      ms: pad(milliseconds),
    };
  };

  const formatted = formatTime(elapsedTime);

  return (
    <div className="w-full my-2 bg-slate-950/95 border border-red-500/50 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs relative">
      {/* Background glow effects */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-950 border-b border-red-500/30">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-red-950 border border-red-500/40 text-red-400">
            <Timer className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-300 text-xs tracking-wider uppercase">DEVIL PRECISION STOPWATCH</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isRunning ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
              {isRunning ? 'RUNNING' : 'PAUSED'}
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Big Digital Timer Display */}
      <div className="p-5 text-center bg-slate-900/60 border-b border-slate-800/80 relative">
        <div className="flex items-baseline justify-center gap-1 sm:gap-2">
          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-5xl font-black font-mono text-slate-100 tracking-wider drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]">
              {formatted.min}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-sans mt-1">MIN</span>
          </div>

          <span className="text-3xl sm:text-5xl font-black text-red-500 animate-pulse pb-4">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-5xl font-black font-mono text-slate-100 tracking-wider drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]">
              {formatted.sec}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-sans mt-1">SEC</span>
          </div>

          <span className="text-2xl sm:text-4xl font-black text-red-500/70 pb-4">.</span>

          {/* Milliseconds */}
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-4xl font-bold font-mono text-red-400 tracking-wider drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              {formatted.ms}
            </span>
            <span className="text-[9px] text-red-400/80 uppercase tracking-widest font-sans mt-1">MS</span>
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center justify-center gap-2.5 mt-5">
          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={elapsedTime === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition border ${
              elapsedTime > 0
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Main Play / Pause Button */}
          <button
            onClick={handleToggle}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition shadow-lg ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-amber-600/30'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START</span>
              </>
            )}
          </button>

          {/* Lap Button */}
          <button
            onClick={handleLap}
            disabled={elapsedTime === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition border ${
              elapsedTime > 0
                ? 'bg-cyan-950/60 hover:bg-cyan-900/60 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lap</span>
          </button>
        </div>
      </div>

      {/* Lap Times List */}
      {laps.length > 0 && (
        <div className="p-3 bg-slate-950 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-bold px-2 flex justify-between">
            <span>Lap No.</span>
            <span>Split</span>
            <span>Total Time</span>
          </div>
          {laps.map((lap) => {
            const splitFmt = formatTime(lap.split);
            const totalFmt = formatTime(lap.time);
            return (
              <div
                key={lap.id}
                className="px-2 py-1 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]"
              >
                <span className="text-cyan-400 font-bold">Lap {lap.id.toString().padStart(2, '0')}</span>
                <span className="text-slate-400">+{splitFmt.min}:{splitFmt.sec}.{splitFmt.ms}</span>
                <span className="text-slate-200 font-bold">{totalFmt.min}:{totalFmt.sec}.{totalFmt.ms}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
