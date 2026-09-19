import React, { useState } from 'react';
import { usePWAInstall } from '../lib/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Shield } from 'lucide-react';
import { soundFX } from '../lib/audio';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running standalone, suppress
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={async () => {
          soundFX.playConfirm();
          await install();
        }}
        className={`flex items-center justify-center gap-1.5 rounded-lg font-mono font-bold transition-all shadow-lg ${
          compact
            ? 'px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-400/60 text-cyan-300 text-[10px]'
            : 'w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-slate-950 font-bold text-xs'
        }`}
        title="Install DEVIL AI as a Standalone App"
      >
        <Download className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>{compact ? 'INSTALL' : 'INSTALL DEVIL AI (OFFLINE READY)'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            soundFX.playClick();
            setShowIOSGuide(true);
          }}
          className={`flex items-center justify-center gap-1.5 rounded-lg font-mono transition-all ${
            compact
              ? 'px-2 py-1 bg-slate-900 border border-cyan-500/40 text-cyan-300 text-[10px]'
              : 'w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs'
          }`}
          title="Install on iOS Home Screen"
        >
          <Smartphone className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>{compact ? 'iOS APP' : 'INSTALL ON iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-cyan-500/60 p-5 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Shield className="w-4 h-4" />
                  <span>INSTALL ON iPHONE / iPAD</span>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">
                    1
                  </span>
                  <p className="text-slate-300">
                    Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">
                    2
                  </span>
                  <p className="text-slate-300">
                    Scroll down and select <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">
                    3
                  </span>
                  <p className="text-slate-300">
                    Tap <strong>Add</strong>. The DEVIL AI icon will now appear on your home screen with offline access to notes and reminders!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 py-2.5 text-xs font-bold text-cyan-300 transition"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
