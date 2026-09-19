import React, { useState, useEffect } from 'react';
import { Reminder, StarkNote } from '../types';
import { soundFX } from '../lib/audio';
import { getCurrentGPSLocation, GPSLocation } from '../lib/location';
import { LocationRadarCard } from './LocationRadarCard';
import { ContactDialerCard } from './ContactDialerCard';
import { WiFiManagerCard } from './WiFiManagerCard';
import { MobileManagerCard } from './MobileManagerCard';
import { VoiceManagerCard } from './VoiceManagerCard';
import { PWAInstallButton } from './PWAInstallButton';
import { AllIndiaNewsCard } from './AllIndiaNewsCard';
import { AllIndiaDataCard } from './AllIndiaDataCard';
import { BackupExportCard } from './BackupExportCard';
import { FeedbackCard } from './FeedbackCard';
import { HackingDetailsCard } from './HackingDetailsCard';
import { FakeCallLauncherCard } from './FakeCallLauncherCard';
import { ApkDownloadCard } from './ApkDownloadCard';
import { MobileNumberLocationCard } from './MobileNumberLocationCard';
import { FakeCallConfig } from '../types';
import {
  exportRemindersToJSON,
  exportRemindersToCSV,
  exportNotesToJSON,
  exportNotesToCSV,
} from '../lib/exportUtils';
import {
  X,
  Clock,
  FileText,
  Cpu,
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  Activity,
  Download,
  Smartphone,
  ExternalLink,
  Check,
  MapPin,
  RefreshCw,
  PhoneCall,
  Wifi,
  HardDrive,
  ShieldCheck,
  Gauge,
  Mic,
  Newspaper,
  Globe,
  Pin,
  Archive,
  MessageSquare,
  ShieldAlert,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';

export type ToolsModalTab =
  | 'india'
  | 'news'
  | 'manager'
  | 'fakecall'
  | 'reminders'
  | 'notes'
  | 'backup'
  | 'feedback'
  | 'hacking'
  | 'contacts'
  | 'wifi'
  | 'diagnostics'
  | 'location'
  | 'mobilenumber'
  | 'apk'
  | 'voice';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: Reminder[];
  onAddReminder: (title: string, time: string) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onTogglePinReminder?: (id: string) => void;
  onImportReminders?: (reminders: Reminder[]) => void;
  notes: StarkNote[];
  onAddNote: (title: string, content: string, category: 'code' | 'intel' | 'task' | 'general') => void;
  onDeleteNote: (id: string) => void;
  onTogglePinNote?: (id: string) => void;
  onImportNotes?: (notes: StarkNote[]) => void;
  defaultTab?: ToolsModalTab;
  onScheduleFakeCall?: (config: FakeCallConfig) => void;
  scheduledFakeCall?: { config: FakeCallConfig; triggerTime: number } | null;
  onCancelScheduledFakeCall?: () => void;
}

export const ToolsModal: React.FC<ToolsModalProps> = ({
  isOpen,
  onClose,
  reminders,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onTogglePinReminder,
  onImportReminders,
  notes,
  onAddNote,
  onDeleteNote,
  onTogglePinNote,
  onImportNotes,
  defaultTab = 'reminders',
  onScheduleFakeCall,
  scheduledFakeCall,
  onCancelScheduledFakeCall,
}) => {
  const [activeTab, setActiveTab] = useState<ToolsModalTab>(defaultTab);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // GPS Location state
  const [modalLocation, setModalLocation] = useState<GPSLocation | null>(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const fetchModalLocation = async () => {
    setIsLoadingLoc(true);
    setLocError(null);
    try {
      const loc = await getCurrentGPSLocation();
      setModalLocation(loc);
    } catch (err: any) {
      setLocError(err.message || 'Failed to get location permission.');
    } finally {
      setIsLoadingLoc(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'location' && !modalLocation && !isLoadingLoc) {
      fetchModalLocation();
    }
  }, [activeTab]);

  // Reminder form state
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'code' | 'intel' | 'task' | 'general'>('intel');

  if (!isOpen) return null;

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;
    soundFX.playConfirm();
    onAddReminder(reminderTitle, reminderTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setReminderTitle('');
    setReminderTime('');
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    soundFX.playConfirm();
    onAddNote(noteTitle, noteContent, noteCategory);
    setNoteTitle('');
    setNoteContent('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-3 font-mono">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-3 border-b border-cyan-900/60 bg-slate-950 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>STARK MOBILE SUITE & UTILITIES</span>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('india');
            }}
            className={`flex-1 min-w-[125px] py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'india'
                ? 'border-cyan-500 text-cyan-300 font-bold bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>All India Data</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('news');
            }}
            className={`flex-1 min-w-[120px] py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'news'
                ? 'border-red-500 text-red-300 font-bold bg-red-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-red-400" />
            <span>All India News</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('manager');
            }}
            className={`flex-1 min-w-[110px] py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'manager'
                ? 'border-red-500 text-red-300 font-bold bg-red-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-red-400" />
            <span>Mobile Manager</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('reminders');
            }}
            className={`flex-1 min-w-[100px] py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'reminders'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Reminders ({reminders.length})</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('notes');
            }}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'notes'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Stark Notes ({notes.length})</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('backup');
            }}
            className={`flex-1 min-w-[130px] py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'backup'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-cyan-400" />
            <span>Backup & Export</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('feedback');
            }}
            className={`flex-1 min-w-[115px] py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'feedback'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Feedback Hub</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('hacking');
            }}
            className={`flex-1 min-w-[135px] py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'hacking'
                ? 'border-red-500 text-red-300 font-bold bg-red-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>Cyber Hacking</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('fakecall');
            }}
            className={`flex-1 min-w-[130px] py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'fakecall'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/40 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Fake Call (फेक)</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('contacts');
            }}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'contacts'
                ? 'border-red-500 text-red-300 font-bold bg-red-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-400" />
            <span>Contacts</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('wifi');
            }}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'wifi'
                ? 'border-red-500 text-red-300 font-bold bg-red-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-red-400" />
            <span>Wi-Fi</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('diagnostics');
            }}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'diagnostics'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Diagnostics</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('location');
            }}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'location'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>GPS Radar</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('mobilenumber');
            }}
            className={`flex-1 min-w-[140px] py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'mobilenumber'
                ? 'border-red-500 text-red-300 font-bold bg-red-950/40 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-400" />
            <span>Number Location</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('apk');
            }}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'apk'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Install APK</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveTab('voice');
            }}
            className={`flex-1 min-w-[110px] py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'voice'
                ? 'border-red-500 text-red-300 font-bold bg-red-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-red-400" />
            <span>Man Voice</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB -2: ALL INDIA DATA MATRIX */}
          {activeTab === 'india' && (
            <div className="space-y-4">
              <AllIndiaDataCard />
            </div>
          )}

          {/* TAB -1: ALL INDIA NEWS RADAR */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              <AllIndiaNewsCard />
            </div>
          )}

          {/* TAB 0: ALL MOBILE MANAGER */}
          {activeTab === 'manager' && (
            <div className="space-y-4">
              <MobileManagerCard compact={false} />
            </div>
          )}

          {/* TAB 1: REMINDERS & ALARMS */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              {/* Offline Readiness Status Strip */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold">OFFLINE READY</span>
                </div>
                <span className="text-slate-400 text-[10px]">Persisted locally in device memory</span>
              </div>

              <form onSubmit={handleCreateReminder} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  <span>Set New DEVIL Alert</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Stark Tower Briefing or Review Code..."
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Quick Export Strip for Reminders */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export Reminders ({reminders.length}):</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playConfirm();
                      exportRemindersToJSON(reminders);
                    }}
                    disabled={reminders.length === 0}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold transition flex items-center gap-1 text-[10px] disabled:opacity-40"
                    title="Export reminders as JSON backup"
                  >
                    <FileJson className="w-3 h-3 text-cyan-400" />
                    <span>JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playConfirm();
                      exportRemindersToCSV(reminders);
                    }}
                    disabled={reminders.length === 0}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold transition flex items-center gap-1 text-[10px] disabled:opacity-40"
                    title="Export reminders as CSV spreadsheet"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setActiveTab('backup');
                    }}
                    className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-400 text-[10px] transition font-semibold"
                    title="Open Full Data Backup Vault"
                  >
                    Vault →
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {reminders.length === 0 ? (
                  <p className="text-center text-slate-500 py-6">No active reminders registered in Stark matrix.</p>
                ) : (
                  reminders.map((r, idx) => (
                    <div
                      key={`${r.id}_${idx}`}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                        r.completed ? 'bg-slate-950/50 border-slate-800 opacity-60' : 'bg-slate-950 border-cyan-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            soundFX.playClick();
                            onToggleReminder(r.id);
                          }}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <CheckCircle2 className={`w-4 h-4 ${r.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                        </button>
                        <div>
                          <p className={`font-semibold ${r.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {r.title}
                          </p>
                          <span className="text-[10px] text-cyan-400">{r.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onTogglePinReminder && (
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              onTogglePinReminder(r.id);
                            }}
                            className={`p-1.5 rounded-lg border transition ${
                              r.isPinned
                                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900'
                            }`}
                            title={r.isPinned ? 'Unpin from Arc Reactor HUD' : 'Pin to Arc Reactor HUD'}
                          >
                            <Pin className={`w-3.5 h-3.5 rotate-45 ${r.isPinned ? 'text-cyan-400 fill-cyan-400/20' : ''}`} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            soundFX.playClick();
                            onDeleteReminder(r.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STARK NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Offline Readiness Status Strip */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold">OFFLINE INTEL BANK</span>
                </div>
                <span className="text-slate-400 text-[10px]">Encrypted & stored locally for offline viewing</span>
              </div>

              <form onSubmit={handleCreateNote} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Add Intelligence Note</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <select
                    value={noteCategory}
                    onChange={(e: any) => setNoteCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300"
                  >
                    <option value="intel">INTEL</option>
                    <option value="code">CODE</option>
                    <option value="task">TASK</option>
                    <option value="general">GENERAL</option>
                  </select>
                </div>
                <textarea
                  placeholder="Note content / code snippet / tactical intel..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
                >
                  Save Note to Stark Memory
                </button>
              </form>

              {/* Quick Export Strip for Notes */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export Notes ({notes.length}):</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playConfirm();
                      exportNotesToJSON(notes);
                    }}
                    disabled={notes.length === 0}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold transition flex items-center gap-1 text-[10px] disabled:opacity-40"
                    title="Export notes as JSON backup"
                  >
                    <FileJson className="w-3 h-3 text-amber-400" />
                    <span>JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playConfirm();
                      exportNotesToCSV(notes);
                    }}
                    disabled={notes.length === 0}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold transition flex items-center gap-1 text-[10px] disabled:opacity-40"
                    title="Export notes as CSV spreadsheet"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setActiveTab('backup');
                    }}
                    className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/30 text-amber-400 text-[10px] transition font-semibold"
                    title="Open Full Data Backup Vault"
                  >
                    Vault →
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {notes.length === 0 ? (
                  <p className="text-center text-slate-500 py-6">No saved notes in Stark memory bank.</p>
                ) : (
                  notes.map((n, idx) => (
                    <div key={`${n.id}_${idx}`} className="p-3 rounded-xl bg-slate-950 border border-cyan-900/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-300">{n.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                            {n.category}
                          </span>
                          {onTogglePinNote && (
                            <button
                              onClick={() => {
                                soundFX.playClick();
                                onTogglePinNote(n.id);
                              }}
                              className={`p-1 rounded-md border transition ${
                                n.isPinned
                                  ? 'bg-amber-950 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900'
                              }`}
                              title={n.isPinned ? 'Unpin from Arc Reactor HUD' : 'Pin to Arc Reactor HUD'}
                            >
                              <Pin className={`w-3.5 h-3.5 rotate-45 ${n.isPinned ? 'text-amber-400 fill-amber-400/20' : ''}`} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              onDeleteNote(n.id);
                            }}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs whitespace-pre-wrap">{n.content}</p>
                      <div className="text-[9px] text-slate-500 text-right">{n.createdAt}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: BACKUP & EXPORT VAULT */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <BackupExportCard
                reminders={reminders}
                notes={notes}
                onImportReminders={onImportReminders}
                onImportNotes={onImportNotes}
              />
            </div>
          )}

          {/* TAB: USER FEEDBACK & TELEMETRY */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <FeedbackCard />
            </div>
          )}

          {/* TAB: CYBER HACKING & PENTEST MATRIX */}
          {activeTab === 'hacking' && (
            <div className="space-y-4">
              <HackingDetailsCard />
            </div>
          )}

          {/* TAB: FAKE CALL SIMULATOR */}
          {activeTab === 'fakecall' && onScheduleFakeCall && (
            <div className="space-y-4">
              <FakeCallLauncherCard
                onScheduleCall={onScheduleFakeCall}
                scheduledCall={scheduledFakeCall || null}
                onCancelScheduledCall={onCancelScheduledFakeCall || (() => {})}
              />
            </div>
          )}

          {/* TAB 3: CONTACTS & DIALER */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <ContactDialerCard onOpenFakeCall={() => setActiveTab('fakecall')} />
            </div>
          )}

          {/* TAB 4: WI-FI MANAGER */}
          {activeTab === 'wifi' && (
            <div className="space-y-4">
              <WiFiManagerCard />
            </div>
          )}

          {/* TAB 4: SYSTEM DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/60 space-y-3">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    SYSTEM TELEMETRY METRICS
                  </span>
                  <span className="text-[10px] text-emerald-400">STATUS: OPTIMAL</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">NEURAL CORE TEMP</div>
                    <div className="text-lg font-bold text-amber-400">42.8 °C</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">MEMORY ALLOCATION</div>
                    <div className="text-lg font-bold text-cyan-400">2.4 / 16 GB</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">QUANTUM ENCRYPTION</div>
                    <div className="text-lg font-bold text-emerald-400">AES-256-GCM</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">ACTIVE NEURAL THREADS</div>
                    <div className="text-lg font-bold text-purple-400">128 SYNAPSES</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-400 text-[11px]">
                <div className="text-cyan-400 font-bold mb-1">DEVIL SYSTEM INFO:</div>
                <p>• Model Core: Gemini 3.6 Flash Neural Matrix</p>
                <p>• Speech Engine: Gemini 3.1 Flash TTS & WebSpeech API</p>
                <p>• Vision Engine: Multimodal Optical Tactical Scanner</p>
                <p>• Grounding: Real-time Google Search Integration</p>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE LOCATION GPS RADAR */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase text-xs">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>J.A.R.V.I.S. Orbital GPS Telemetry</span>
                </span>
                <button
                  onClick={fetchModalLocation}
                  disabled={isLoadingLoc}
                  className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition flex items-center gap-1 font-mono text-[11px]"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingLoc ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>Refresh GPS Fix</span>
                </button>
              </div>

              {isLoadingLoc && (
                <div className="p-6 bg-slate-950 rounded-xl border border-cyan-500/30 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
                  <p className="text-cyan-300 font-mono text-xs">Acquiring Orbital Satellite GPS Lock...</p>
                </div>
              )}

              {locError && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs">
                  <p className="font-bold">GPS Error:</p>
                  <p className="mt-1">{locError}</p>
                  <button
                    onClick={fetchModalLocation}
                    className="mt-2 px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded text-slate-100 transition text-[11px]"
                  >
                    Grant Permission & Retry
                  </button>
                </div>
              )}

              {modalLocation && !isLoadingLoc && (
                <LocationRadarCard location={modalLocation} onRefresh={fetchModalLocation} isRefreshing={isLoadingLoc} />
              )}
            </div>
          )}

          {/* TAB: MOBILE NUMBER LIVE LOCATION & OPERATOR RADAR */}
          {activeTab === 'mobilenumber' && (
            <div className="space-y-4">
              <MobileNumberLocationCard />
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <ApkDownloadCard />
            </div>
          )}

          {/* TAB 8: DEVIL MAN VOICE MATRIX */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <VoiceManagerCard />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
