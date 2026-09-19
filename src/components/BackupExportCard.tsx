import React, { useState, useRef } from 'react';
import { Reminder, StarkNote } from '../types';
import { soundFX } from '../lib/audio';
import {
  exportRemindersToJSON,
  exportRemindersToCSV,
  exportNotesToJSON,
  exportNotesToCSV,
  exportUnifiedVaultBackup,
  downloadJSON,
} from '../lib/exportUtils';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Archive,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  HardDrive,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

interface BackupExportCardProps {
  reminders: Reminder[];
  notes: StarkNote[];
  onImportReminders?: (reminders: Reminder[]) => void;
  onImportNotes?: (notes: StarkNote[]) => void;
}

export const BackupExportCard: React.FC<BackupExportCardProps> = ({
  reminders,
  notes,
  onImportReminders,
  onImportNotes,
}) => {
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Approximate data footprint
  const dataSizeKB = useMemoDataSize(reminders, notes);

  function useMemoDataSize(rem: Reminder[], not: StarkNote[]) {
    const raw = JSON.stringify({ rem, not });
    return (raw.length / 1024).toFixed(1);
  }

  const handleCopyJSONPreview = () => {
    const preview = {
      backupDate: new Date().toISOString(),
      remindersCount: reminders.length,
      notesCount: notes.length,
      reminders,
      notes,
    };
    navigator.clipboard.writeText(JSON.stringify(preview, null, 2));
    setCopiedPreview(true);
    soundFX.playConfirm();
    setTimeout(() => setCopiedPreview(false), 2500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);

        let importedRemindersCount = 0;
        let importedNotesCount = 0;

        if (Array.isArray(parsed.reminders)) {
          if (onImportReminders) {
            onImportReminders(parsed.reminders);
          } else {
            localStorage.setItem('devil_reminders', JSON.stringify(parsed.reminders));
          }
          importedRemindersCount = parsed.reminders.length;
        }

        if (Array.isArray(parsed.notes)) {
          if (onImportNotes) {
            onImportNotes(parsed.notes);
          } else {
            localStorage.setItem('devil_notes', JSON.stringify(parsed.notes));
          }
          importedNotesCount = parsed.notes.length;
        }

        soundFX.playPowerUp();
        setImportStatus(
          `Successfully restored ${importedRemindersCount} reminders and ${importedNotesCount} notes from backup!`
        );
        setTimeout(() => setImportStatus(null), 4000);
      } catch (err) {
        soundFX.playClick();
        setImportStatus('Failed to parse backup JSON file. Ensure valid Stark format.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header Banner */}
      <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-cyan-300 uppercase tracking-wider">
            STARK DATA BACKUP & EXPORT VAULT
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span>Local Vault: ~{dataSizeKB} KB</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-bold mb-1">
            <Clock className="w-3 h-3" />
            <span>REMINDERS</span>
          </div>
          <div className="text-lg font-bold text-slate-100">{reminders.length}</div>
          <div className="text-[10px] text-slate-400">
            {reminders.filter((r) => !r.completed).length} active • {reminders.filter((r) => r.completed).length} done
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold mb-1">
            <FileText className="w-3 h-3" />
            <span>STARK NOTES</span>
          </div>
          <div className="text-lg font-bold text-slate-100">{notes.length}</div>
          <div className="text-[10px] text-slate-400">
            {notes.filter((n) => n.isPinned).length} pinned to HUD
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold mb-1">
            <ShieldCheck className="w-3 h-3" />
            <span>OFFLINE BACKUP</span>
          </div>
          <div className="text-xs text-slate-300 font-bold">Encrypted & Local</div>
          <div className="text-[10px] text-slate-400">Zero cloud dependencies</div>
        </div>
      </div>

      {/* Unified Full Vault Backup */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-950 to-blue-950/30 border border-cyan-500/40 space-y-2.5 shadow-lg shadow-cyan-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-cyan-300 text-xs">
              Complete Stark Intelligence Vault Backup
            </span>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50">
            RECOMMENDED
          </span>
        </div>

        <p className="text-slate-300 text-[11px] leading-relaxed">
          एक ही क्लिक में अपने सभी रिमाइंडर्स, नोट्स, कैटेगरीज और टाइमस्टैम्प्स को एक सुरक्षित{' '}
          <strong className="text-cyan-300">.JSON</strong> आर्काइव में डाउनलोड करें। इसे किसी भी समय दोबारा रीस्टोर किया जा सकता है।
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => {
              soundFX.playConfirm();
              exportUnifiedVaultBackup(reminders, notes);
            }}
            className="flex-1 min-w-[180px] py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center justify-center gap-2 shadow-md shadow-cyan-950/50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Full Vault Backup (.JSON)</span>
          </button>

          <button
            onClick={handleCopyJSONPreview}
            className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1.5"
            title="Copy formatted JSON to clipboard"
          >
            {copiedPreview ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPreview ? 'Copied to Clipboard!' : 'Copy Preview'}</span>
          </button>
        </div>
      </div>

      {/* Individual Export Grid: Reminders vs Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Reminders Export Card */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reminders Backup</span>
            </div>
            <span className="text-[10px] text-slate-400">({reminders.length} items)</span>
          </div>

          <p className="text-slate-400 text-[10px]">
            Export tasks, times, completed flags and priority markers.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundFX.playConfirm();
                exportRemindersToJSON(reminders);
              }}
              disabled={reminders.length === 0}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-semibold transition flex items-center justify-center gap-1 text-[11px] disabled:opacity-40"
              title="Download reminders as formatted JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON File</span>
            </button>

            <button
              onClick={() => {
                soundFX.playConfirm();
                exportRemindersToCSV(reminders);
              }}
              disabled={reminders.length === 0}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-semibold transition flex items-center justify-center gap-1 text-[11px] disabled:opacity-40"
              title="Download reminders as spreadsheet-ready CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV (Excel)</span>
            </button>
          </div>
        </div>

        {/* Notes Export Card */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Stark Notes Backup</span>
            </div>
            <span className="text-[10px] text-slate-400">({notes.length} items)</span>
          </div>

          <p className="text-slate-400 text-[10px]">
            Export classified intel, code snippets, memos and tasks.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundFX.playConfirm();
                exportNotesToJSON(notes);
              }}
              disabled={notes.length === 0}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-amber-950/70 border border-amber-500/40 text-amber-300 font-semibold transition flex items-center justify-center gap-1 text-[11px] disabled:opacity-40"
              title="Download notes as structured JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>JSON File</span>
            </button>

            <button
              onClick={() => {
                soundFX.playConfirm();
                exportNotesToCSV(notes);
              }}
              disabled={notes.length === 0}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-semibold transition flex items-center justify-center gap-1 text-[11px] disabled:opacity-40"
              title="Download notes as spreadsheet-ready CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV (Excel)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Restore from JSON Backup */}
      <div className="p-3 bg-slate-950 rounded-xl border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Restore / Import Data from Backup</span>
          </div>
          <span className="text-[10px] text-slate-500">JSON Format</span>
        </div>

        <p className="text-slate-400 text-[10px]">
          Select a previously saved <code className="text-cyan-300">.json</code> backup file to restore reminders and intelligence notes into your device.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          onChange={handleFileImport}
          className="hidden"
          id="devil-backup-file-input"
        />

        <button
          onClick={() => {
            soundFX.playClick();
            fileInputRef.current?.click();
          }}
          className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/20 text-slate-200 transition flex items-center justify-center gap-2"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Select Backup File to Restore</span>
        </button>

        {importStatus && (
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 flex items-center gap-2 text-[11px] animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
};
