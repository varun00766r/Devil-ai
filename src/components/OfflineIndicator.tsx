import React from 'react';
import { useOnlineStatus } from '../lib/useOnlineStatus';
import { WifiOff, FileText, CheckCircle } from 'lucide-react';

interface OfflineIndicatorProps {
  onOpenNotesAndReminders?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onOpenNotesAndReminders }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-40 max-w-xl mx-auto">
      <div className="p-2.5 rounded-xl bg-slate-900/95 border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-md flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>OFFLINE MODE ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              Stored notes & reminders are fully available offline
            </p>
          </div>
        </div>

        {onOpenNotesAndReminders && (
          <button
            onClick={onOpenNotesAndReminders}
            className="shrink-0 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-[11px] font-semibold transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Notes</span>
          </button>
        )}
      </div>
    </div>
  );
};
