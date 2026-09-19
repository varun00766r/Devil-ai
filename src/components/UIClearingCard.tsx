import React from 'react';
import { Sparkles, Trash2, Eye, EyeOff, CheckCircle2, ShieldCheck, RefreshCw, Cpu, Monitor } from 'lucide-react';
import { soundFX } from '../lib/audio';

interface UIClearingCardProps {
  isClearView?: boolean;
  onToggleClearView?: () => void;
  onClearTerminal?: () => void;
  onOpenQuantumCore?: () => void;
}

export const UIClearingCard: React.FC<UIClearingCardProps> = ({
  isClearView = false,
  onToggleClearView,
  onClearTerminal,
  onOpenQuantumCore,
}) => {
  return (
    <div className="mt-3 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-md text-slate-100 shadow-xl font-mono">
      {/* Header telemetry badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-300 tracking-wider uppercase">
            DEVIL UI CLEARING & CLARITY ENGINE
          </span>
        </div>
        <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
          ALL CLEAR STATUS
        </span>
      </div>

      {/* Clarity telemetry summary */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal Stream</span>
          </div>
          <p className="font-semibold text-slate-200">Pruned & Zero Lag</p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Screen Clarity</span>
          </div>
          <p className="font-semibold text-cyan-300">
            {isClearView ? 'Clear View (Clean HUD)' : 'Cockpit Full HUD'}
          </p>
        </div>
      </div>

      {/* Description text */}
      <p className="text-xs text-slate-300 leading-relaxed mb-3">
        बॉस! आपकी स्क्रीन और चैट हिस्ट्री को पूरी तरह से साफ कर दिया गया है। नीचे दिए गए विकल्पों से आप <strong>Clear View Mode</strong> (बिना किसी एक्स्ट्रा बटन्स के साफ स्क्रीन) सक्रिय कर सकते हैं या क्वांटम कोर ब्लैक स्क्रीन खोल सकते हैं।
      </p>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {onToggleClearView && (
          <button
            onClick={() => {
              soundFX.playClick();
              onToggleClearView();
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition border ${
              isClearView
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-cyan-500/60 hover:text-cyan-300'
            }`}
          >
            {isClearView ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isClearView ? 'Cockpit View' : 'Clear View (साफ स्क्रीन)'}</span>
          </button>
        )}

        {onClearTerminal && (
          <button
            onClick={() => {
              soundFX.playConfirm();
              onClearTerminal();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/70 border border-rose-500/50 hover:border-rose-400 text-rose-300 hover:text-rose-200 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Terminal</span>
          </button>
        )}

        {onOpenQuantumCore && (
          <button
            onClick={() => {
              soundFX.playPowerUp();
              onOpenQuantumCore();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-950/70 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 text-xs font-semibold transition"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D Quantum Black</span>
          </button>
        )}
      </div>
    </div>
  );
};
