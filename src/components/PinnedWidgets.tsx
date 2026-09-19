import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Reminder, StarkNote, Persona } from '../types';
import { soundFX } from '../lib/audio';
import {
  evaluateReminderUrgency,
  sortRemindersByUrgency,
  getUrgentTimePreset,
} from '../lib/urgency';
import {
  Pin,
  PinOff,
  Clock,
  FileText,
  CheckCircle2,
  Circle,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
  ListTodo,
  AlertTriangle,
  Flame,
  Timer,
  BellRing,
  RotateCcw,
  CheckSquare,
  Square,
  CheckCheck,
  X,
} from 'lucide-react';

interface PinnedWidgetsProps {
  reminders: Reminder[];
  notes: StarkNote[];
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onBatchDeleteReminders?: (ids: string[]) => void;
  onTogglePinReminder: (id: string) => void;
  onTogglePinNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onAddReminder: (title: string, time: string, isPinned?: boolean) => void;
  onAddNote: (
    title: string,
    content: string,
    category: 'code' | 'intel' | 'task' | 'general',
    isPinned?: boolean
  ) => void;
  onOpenTools: (tab: 'reminders' | 'notes') => void;
  persona?: Persona;
}

export const PinnedWidgets: React.FC<PinnedWidgetsProps> = ({
  reminders,
  notes,
  onToggleReminder,
  onDeleteReminder,
  onBatchDeleteReminders,
  onTogglePinReminder,
  onTogglePinNote,
  onDeleteNote,
  onAddReminder,
  onAddNote,
  onOpenTools,
  persona = 'devil',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filter, setFilter] = useState<'all' | 'reminders' | 'notes'>('all');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'reminder' | 'note'>('reminder');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDetail, setQuickDetail] = useState('');
  const [quickCategory, setQuickCategory] = useState<'intel' | 'code' | 'task' | 'general'>('intel');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [quickUrgentPriority, setQuickUrgentPriority] = useState(false);

  // Batch Delete Completed Tasks State
  const [isBatchDeleteMode, setIsBatchDeleteMode] = useState(false);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  // Auto-Pinning Urgent Feature State
  const [autoPinUrgent, setAutoPinUrgent] = useState<boolean>(() => {
    return localStorage.getItem('devil_auto_pin_urgent') !== 'false';
  });

  // Current time state ticker (ticks every 15s to update remaining minutes & overdue status)
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Holographic HUD Glow-Pulse Animation State
  const [pulseState, setPulseState] = useState<{
    active: boolean;
    reason: 'added' | 'completed' | 'toggled' | null;
    label: string | null;
  }>({ active: false, reason: null, label: null });
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger holographic container glow-pulse animation
  const triggerGlowPulse = (reason: 'added' | 'completed' | 'toggled', label?: string) => {
    if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    // Briefly clear and set in next frame to cleanly restart CSS keyframe animation
    setPulseState({ active: false, reason: null, label: null });
    requestAnimationFrame(() => {
      setPulseState({ active: true, reason, label: label || null });
      pulseTimeoutRef.current = setTimeout(() => {
        setPulseState({ active: false, reason: null, label: null });
      }, 1800);
    });
  };

  // Track items auto-pinned during this runtime to avoid duplicate speech/alerts
  const autoPinnedIdsRef = useRef<Set<string>>(new Set());

  // Auto-pinning detector: inspects uncompleted reminders; if urgent by time, pins it and triggers HUD pulse
  useEffect(() => {
    if (!autoPinUrgent) return;

    const urgentUnpinned = reminders.filter(
      (r) =>
        !r.completed &&
        !r.isPinned &&
        !autoPinnedIdsRef.current.has(r.id) &&
        evaluateReminderUrgency(r, currentTime).isUrgent
    );

    if (urgentUnpinned.length > 0) {
      urgentUnpinned.forEach((r) => {
        autoPinnedIdsRef.current.add(r.id);
        onTogglePinReminder(r.id);
      });

      soundFX.playPowerUp();
      const first = urgentUnpinned[0];
      const urgency = evaluateReminderUrgency(first, currentTime);
      triggerGlowPulse(
        'added',
        `⚡ AUTO-PINNED: ${first.title.slice(0, 14).toUpperCase()} (${urgency.badgeText || 'URGENT'})`
      );
    }
  }, [reminders, currentTime, autoPinUrgent, onTogglePinReminder]);

  // Reminders considered pinned: explicitly pinned OR auto-pinned urgent tasks
  const effectivePinnedReminders = useMemo(() => {
    return reminders.filter(
      (r) =>
        r.isPinned ||
        (autoPinUrgent && !r.completed && evaluateReminderUrgency(r, currentTime).isUrgent)
    );
  }, [reminders, autoPinUrgent, currentTime]);

  // Sort pinned reminders so that Urgent uncompleted tasks are strictly bumped to the top
  const sortedPinnedReminders = useMemo(() => {
    return sortRemindersByUrgency(effectivePinnedReminders, currentTime);
  }, [effectivePinnedReminders, currentTime]);

  const urgentPinnedReminders = useMemo(() => {
    return sortedPinnedReminders.filter(
      (r) => !r.completed && evaluateReminderUrgency(r, currentTime).isUrgent
    );
  }, [sortedPinnedReminders, currentTime]);

  const standardPinnedReminders = useMemo(() => {
    return sortedPinnedReminders.filter(
      (r) => r.completed || !evaluateReminderUrgency(r, currentTime).isUrgent
    );
  }, [sortedPinnedReminders, currentTime]);

  const pinnedNotes = useMemo(() => notes.filter((n) => n.isPinned), [notes]);
  const totalPinned = sortedPinnedReminders.length + pinnedNotes.length;

  const unpinnedReminders = reminders.filter((r) => !r.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);

  // Completed reminders tracking for batch delete operations
  const completedReminders = useMemo(() => {
    return reminders.filter((r) => r.completed);
  }, [reminders]);

  const completedPinnedReminders = useMemo(() => {
    return sortedPinnedReminders.filter((r) => r.completed);
  }, [sortedPinnedReminders]);

  const handleToggleBatchMode = () => {
    soundFX.playClick();
    if (!isBatchDeleteMode) {
      const defaultIds = completedPinnedReminders.length > 0
        ? completedPinnedReminders.map((r) => r.id)
        : completedReminders.map((r) => r.id);
      setSelectedBatchIds(defaultIds);
      setShowBatchConfirm(false);
      setIsBatchDeleteMode(true);
      if (isCollapsed) setIsCollapsed(false);
    } else {
      setIsBatchDeleteMode(false);
      setSelectedBatchIds([]);
      setShowBatchConfirm(false);
    }
  };

  const handleToggleSelectBatchItem = (id: string) => {
    soundFX.playClick();
    setSelectedBatchIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllCompleted = () => {
    soundFX.playClick();
    const allCompletedIds = completedReminders.map((r) => r.id);
    if (selectedBatchIds.length === allCompletedIds.length) {
      setSelectedBatchIds([]);
    } else {
      setSelectedBatchIds(allCompletedIds);
    }
  };

  const handleExecuteBatchDelete = () => {
    if (selectedBatchIds.length === 0) return;
    soundFX.playPowerUp();
    const count = selectedBatchIds.length;

    if (onBatchDeleteReminders) {
      onBatchDeleteReminders(selectedBatchIds);
    } else {
      selectedBatchIds.forEach((id) => onDeleteReminder(id));
    }

    triggerGlowPulse('completed', `BATCH DELETED: ${count} TASKS REMOVED`);
    setIsBatchDeleteMode(false);
    setSelectedBatchIds([]);
    setShowBatchConfirm(false);
  };

  // Persona based theme accents
  const getAccentColors = () => {
    switch (persona) {
      case 'devil':
        return {
          glowRgb: '239, 68, 68',
          border: 'border-red-500/40',
          hoverBorder: 'hover:border-red-500/70',
          bgHeader: 'bg-red-950/30',
          textAccent: 'text-red-400',
          badgeBg: 'bg-red-950 text-red-300 border-red-500/50',
          glow: 'shadow-[0_0_12px_rgba(239,68,68,0.15)]',
          btnPrimary: 'bg-red-600 hover:bg-red-500 text-white',
          pulseBadge: 'bg-red-950/90 text-red-300 border-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
        };
      case 'jarvis':
        return {
          glowRgb: '245, 158, 11',
          border: 'border-amber-500/40',
          hoverBorder: 'hover:border-amber-500/70',
          bgHeader: 'bg-amber-950/30',
          textAccent: 'text-amber-400',
          badgeBg: 'bg-amber-950 text-amber-300 border-amber-500/50',
          glow: 'shadow-[0_0_12px_rgba(245,158,11,0.15)]',
          btnPrimary: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
          pulseBadge: 'bg-amber-950/90 text-amber-300 border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
        };
      case 'friday':
        return {
          glowRgb: '244, 63, 94',
          border: 'border-rose-500/40',
          hoverBorder: 'hover:border-rose-500/70',
          bgHeader: 'bg-rose-950/30',
          textAccent: 'text-rose-400',
          badgeBg: 'bg-rose-950 text-rose-300 border-rose-500/50',
          glow: 'shadow-[0_0_12px_rgba(244,63,94,0.15)]',
          btnPrimary: 'bg-rose-600 hover:bg-rose-500 text-white',
          pulseBadge: 'bg-rose-950/90 text-rose-300 border-rose-500/70 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
        };
      case 'edith':
        return {
          glowRgb: '16, 185, 129',
          border: 'border-emerald-500/40',
          hoverBorder: 'hover:border-emerald-500/70',
          bgHeader: 'bg-emerald-950/30',
          textAccent: 'text-emerald-400',
          badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
          glow: 'shadow-[0_0_12px_rgba(16,185,129,0.15)]',
          btnPrimary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
          pulseBadge: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
        };
      default:
        return {
          glowRgb: '6, 182, 212',
          border: 'border-cyan-500/40',
          hoverBorder: 'hover:border-cyan-500/70',
          bgHeader: 'bg-cyan-950/30',
          textAccent: 'text-cyan-400',
          badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
          glow: 'shadow-[0_0_12px_rgba(6,182,212,0.15)]',
          btnPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
          pulseBadge: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/70 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
        };
    }
  };

  const theme = getAccentColors();

  // Watch for external additions or completions across the app (voice intents, Tools modal, etc.)
  const prevRemindersRef = useRef(reminders);
  const prevNotesRef = useRef(notes);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevRemindersRef.current = reminders;
      prevNotesRef.current = notes;
      return;
    }

    const prevReminders = prevRemindersRef.current;
    const prevNotes = prevNotesRef.current;

    // Check if new reminder or note was added
    const reminderAdded = reminders.length > prevReminders.length;
    const noteAdded = notes.length > prevNotes.length;

    // Check if a reminder was marked completed
    let reminderCompleted = false;
    for (const curr of reminders) {
      const prev = prevReminders.find((r) => r.id === curr.id);
      if (prev && !prev.completed && curr.completed) {
        reminderCompleted = true;
        break;
      }
    }

    // Check if items were newly pinned
    const reminderPinned = reminders.filter((r) => r.isPinned).length > prevReminders.filter((r) => r.isPinned).length;
    const notePinned = notes.filter((n) => n.isPinned).length > prevNotes.filter((n) => n.isPinned).length;

    if (reminderCompleted) {
      triggerGlowPulse('completed', 'TASK COMPLETED');
    } else if (reminderAdded) {
      triggerGlowPulse('added', 'REMINDER ADDED');
    } else if (noteAdded) {
      triggerGlowPulse('added', 'NOTE ADDED');
    } else if (reminderPinned || notePinned) {
      triggerGlowPulse('added', 'WIDGET PINNED');
    }

    prevRemindersRef.current = reminders;
    prevNotesRef.current = notes;
  }, [reminders, notes]);

  const handleCopyNote = (id: string, text: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    soundFX.playConfirm();
    if (quickAddType === 'reminder') {
      let time = quickDetail.trim() || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let title = quickTitle.trim();
      if (quickUrgentPriority && !title.toUpperCase().includes('URGENT')) {
        title = `[URGENT] ${title}`;
      }
      onAddReminder(title, time, true);
      const isUrgentNow = evaluateReminderUrgency({ id: 'temp', title, time, completed: false }, currentTime).isUrgent;
      triggerGlowPulse('added', isUrgentNow ? '⚡ URGENT TASK PINNED' : 'REMINDER PINNED');
    } else {
      onAddNote(quickTitle.trim(), quickDetail.trim() || 'Tactical memo', quickCategory, true);
      triggerGlowPulse('added', 'NOTE PINNED');
    }

    setQuickTitle('');
    setQuickDetail('');
    setQuickUrgentPriority(false);
    setIsQuickAddOpen(false);
  };

  // Render an individual reminder card with urgent priority visual indicator if applicable
  const renderReminderCard = (reminder: Reminder, forceUrgentStyle?: boolean) => {
    const urgency = evaluateReminderUrgency(reminder, currentTime);
    const isUrgent = (forceUrgentStyle || urgency.isUrgent) && !reminder.completed;
    const isSelectedForBatch = selectedBatchIds.includes(reminder.id);

    return (
      <div
        key={reminder.id}
        onClick={
          isBatchDeleteMode && reminder.completed
            ? () => handleToggleSelectBatchItem(reminder.id)
            : undefined
        }
        className={`p-2.5 rounded-xl border transition-all duration-300 font-mono text-xs flex flex-col justify-between ${
          reminder.completed
            ? isBatchDeleteMode && isSelectedForBatch
              ? 'bg-rose-950/40 border-rose-500/80 ring-1 ring-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)] cursor-pointer'
              : isBatchDeleteMode
              ? 'bg-slate-950/60 border-slate-700/60 cursor-pointer hover:border-slate-500'
              : 'bg-slate-950/40 border-white/5 opacity-60'
            : isUrgent
            ? 'bg-gradient-to-br from-amber-950/45 via-slate-950/95 to-amber-950/20 border-amber-500/80 shadow-[0_0_16px_rgba(245,158,11,0.22)] ring-1 ring-amber-500/50 hover:border-amber-400'
            : 'bg-slate-950/80 border-cyan-500/30 shadow-sm shadow-cyan-950/40 hover:border-cyan-500/60'
        }`}
      >
        {/* Urgent Top Priority Banner & Beacon Dot */}
        {isUrgent && (
          <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-amber-500/25">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[9px] font-mono font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1 truncate">
                <Zap className="w-2.5 h-2.5 fill-amber-400 shrink-0" />
                AUTO-PINNED PRIORITY
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider flex items-center gap-1 shrink-0 ${
                urgency.isOverdue
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.35)]'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.35)]'
              } animate-pulse`}
            >
              {urgency.isOverdue ? <AlertTriangle className="w-2.5 h-2.5" /> : <Timer className="w-2.5 h-2.5" />}
              <span>{urgency.badgeText}</span>
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            {/* Toggle Reminder or Batch Select Checkbox */}
            {isBatchDeleteMode && reminder.completed ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSelectBatchItem(reminder.id);
                }}
                className="min-h-[32px] min-w-[32px] flex items-center justify-center p-1 text-rose-400 transition shrink-0"
                title={isSelectedForBatch ? 'Deselect task' : 'Select task for batch delete'}
              >
                {isSelectedForBatch ? (
                  <CheckSquare className="w-4 h-4 text-rose-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!reminder.completed) {
                    soundFX.playConfirm();
                    triggerGlowPulse('completed', isUrgent ? 'URGENT TASK RESOLVED' : 'TASK COMPLETED');
                  } else {
                    soundFX.playClick();
                    triggerGlowPulse('toggled', 'TASK REACTIVATED');
                  }
                  onToggleReminder(reminder.id);
                }}
                className={`min-h-[32px] min-w-[32px] flex items-center justify-center transition shrink-0 ${
                  isUrgent ? 'text-amber-400 hover:text-amber-300' : 'text-cyan-400 hover:text-cyan-300'
                }`}
                title={reminder.completed ? 'Mark as active' : 'Mark as completed'}
                aria-label={`Mark reminder ${reminder.title} as ${reminder.completed ? 'active' : 'completed'}`}
              >
                {reminder.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isUrgent ? (
                  <Circle className="w-4 h-4 text-amber-400 hover:scale-110 transition animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4 text-cyan-400 hover:scale-110 transition" />
                )}
              </button>
            )}

            <div className="min-w-0">
              <p
                className={`text-xs font-semibold leading-tight break-words ${
                  reminder.completed
                    ? 'line-through text-slate-500'
                    : isUrgent
                    ? 'text-amber-100 font-bold drop-shadow-sm'
                    : 'text-slate-100'
                }`}
              >
                {reminder.title}
              </p>

              <div
                className={`flex items-center gap-1.5 mt-1 text-[10px] ${
                  isUrgent ? 'text-amber-300 font-medium' : 'text-cyan-400/90'
                }`}
              >
                {isUrgent ? (
                  <Timer className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
                ) : (
                  <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                )}
                <span>{reminder.time}</span>
                <span className={isUrgent ? 'text-amber-500/70' : 'text-slate-500'}>•</span>
                <span
                  className={`text-[9px] uppercase tracking-wider ${
                    isUrgent
                      ? urgency.isOverdue
                        ? 'text-rose-400 font-bold'
                        : 'text-amber-300 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {reminder.completed ? 'Done' : isUrgent ? urgency.countdownText || 'Urgent' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions: Unpin & Delete */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                soundFX.playClick();
                onTogglePinReminder(reminder.id);
              }}
              className={`min-h-[32px] min-w-[32px] p-1 transition flex items-center justify-center rounded-lg hover:bg-white/5 ${
                isUrgent ? 'text-amber-400 hover:text-amber-300' : 'text-cyan-400 hover:text-amber-400'
              }`}
              title="Unpin from dashboard"
              aria-label="Unpin reminder"
            >
              <PinOff className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                onDeleteReminder(reminder.id);
              }}
              className="min-h-[32px] min-w-[32px] p-1 text-slate-500 hover:text-rose-400 transition flex items-center justify-center rounded-lg hover:bg-white/5"
              title="Delete reminder"
              aria-label="Delete reminder"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="pinned-widgets-hud"
      aria-label="Pinned Widgets Dashboard Area"
      style={{ '--hud-glow-rgb': theme.glowRgb } as React.CSSProperties}
      className={`relative mb-3 rounded-2xl bg-black/60 border ${
        pulseState.active
          ? 'animate-hud-glow-pulse border-cyan-400 ring-1 ring-white/30'
          : `${theme.border} transition-all duration-300 ${theme.glow}`
      } backdrop-blur-xl overflow-hidden`}
    >
      {/* Holographic Laser Sweep & Glow Pulse Effect */}
      {pulseState.active && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-30">
          {/* Laser beam sweep */}
          <div
            className="absolute inset-y-0 w-2/5 animate-hud-scanline blur-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(${theme.glowRgb}, 0.5), transparent)`,
            }}
          />
          {/* Ambient Holographic Radial Flash */}
          <div
            className="absolute inset-0 animate-pulse pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 20%, rgba(${theme.glowRgb}, 0.22), transparent 75%)`,
            }}
          />
        </div>
      )}

      {/* Top Header Bar */}
      <div className={`px-3 py-2.5 ${theme.bgHeader} border-b ${theme.border} flex items-center justify-between gap-2 select-none`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-black/60 border border-white/10 shrink-0">
            <Pin className={`w-3.5 h-3.5 ${theme.textAccent} rotate-45`} />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-200">
                PINNED WIDGETS
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${theme.badgeBg}`}>
                {totalPinned}
              </span>
              {urgentPinnedReminders.length > 0 && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/80 text-[9px] font-mono font-bold animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.35)]"
                  title={`${urgentPinnedReminders.length} urgent task(s) auto-bumped to top`}
                >
                  <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>{urgentPinnedReminders.length} URGENT</span>
                </span>
              )}
              {pulseState.active && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold tracking-wider animate-pulse ${theme.pulseBadge}`}
                >
                  <Sparkles className="w-2.5 h-2.5 animate-spin" />
                  <span>{pulseState.label || 'HUD MATRIX ACTIVE'}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Auto-Pin switch, Filter tabs, Quick Add, Collapse */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Auto-Pin Urgent Toggle Button */}
          <button
            onClick={() => {
              const next = !autoPinUrgent;
              setAutoPinUrgent(next);
              localStorage.setItem('devil_auto_pin_urgent', String(next));
              soundFX.playClick();
              triggerGlowPulse('toggled', next ? 'AUTO-PIN: ACTIVE' : 'AUTO-PIN: DISABLED');
            }}
            className={`min-h-[32px] px-2 py-1 rounded-lg border text-[10px] font-mono flex items-center gap-1 transition active:scale-95 ${
              autoPinUrgent
                ? 'bg-amber-950/50 text-amber-300 border-amber-500/50 hover:bg-amber-900/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'bg-black/40 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
            title={
              autoPinUrgent
                ? 'Auto-Pin Protocol: Enabled (Time-critical tasks are auto-pinned and bumped to top)'
                : 'Auto-Pin Protocol: Disabled (Click to activate auto-pinning for urgent tasks)'
            }
          >
            <Zap className={`w-3 h-3 ${autoPinUrgent ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden md:inline font-bold">{autoPinUrgent ? 'Auto-Pin: ON' : 'Auto-Pin: OFF'}</span>
          </button>

          {!isCollapsed && totalPinned > 0 && (
            <div className="hidden sm:flex items-center gap-1 mr-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setFilter('all');
                }}
                className={`px-2 py-0.5 rounded ${filter === 'all' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All ({totalPinned})
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setFilter('reminders');
                }}
                className={`px-2 py-0.5 rounded ${filter === 'reminders' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Reminders ({sortedPinnedReminders.length})
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setFilter('notes');
                }}
                className={`px-2 py-0.5 rounded ${filter === 'notes' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Notes ({pinnedNotes.length})
              </button>
            </div>
          )}

          {/* Batch Delete Completed Tasks Button */}
          {completedReminders.length > 0 && (
            <button
              onClick={handleToggleBatchMode}
              className={`min-h-[32px] px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 transition active:scale-95 ${
                isBatchDeleteMode
                  ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-pulse'
                  : 'bg-rose-950/70 text-rose-300 border-rose-500/50 hover:bg-rose-900/80 hover:text-white'
              }`}
              title={`Batch Delete: Select multiple completed tasks (${completedReminders.length}) and remove with a single confirmation`}
            >
              <Trash2 className="w-3 h-3 text-rose-300" />
              <span className="hidden xs:inline">Batch Delete</span>
              <span className="px-1 py-0.2 rounded bg-black/40 text-[9px] text-rose-200 border border-rose-400/30">
                {completedReminders.length}
              </span>
            </button>
          )}

          {/* Quick Pin Button */}
          <button
            onClick={() => {
              soundFX.playClick();
              setIsQuickAddOpen(!isQuickAddOpen);
              if (isCollapsed) setIsCollapsed(false);
            }}
            className={`min-h-[32px] px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 flex items-center gap-1 text-[11px] font-mono transition active:scale-95`}
            title="Pin a new reminder or note"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline text-[10px] uppercase font-bold">Pin</span>
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => {
              soundFX.playClick();
              setIsCollapsed(!isCollapsed);
            }}
            className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-slate-400 hover:text-slate-200 flex items-center justify-center transition"
            title={isCollapsed ? 'Expand Pinned Widgets' : 'Collapse Pinned Widgets'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Add Popover Drawer */}
      {isQuickAddOpen && !isCollapsed && (
        <div className="p-3 bg-slate-950/95 border-b border-white/10 animate-fadeIn">
          <form onSubmit={handleQuickAddSubmit} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={`text-[11px] font-mono font-bold uppercase ${theme.textAccent} flex items-center gap-1`}>
                <Sparkles className="w-3.5 h-3.5" />
                Pin Widget Directly to Dashboard
              </span>
              <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setQuickAddType('reminder');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                    quickAddType === 'reminder' ? `${theme.btnPrimary} font-bold` : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Reminder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setQuickAddType('note');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                    quickAddType === 'note' ? `${theme.btnPrimary} font-bold` : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Intel Note
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={quickAddType === 'reminder' ? 'Reminder task e.g. Call Tony Stark...' : 'Note title e.g. Reactor Calibration...'}
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="flex-1 bg-slate-900/90 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                autoFocus
              />

              {quickAddType === 'reminder' ? (
                <input
                  type="text"
                  placeholder="Time (e.g. 18:30)"
                  value={quickDetail}
                  onChange={(e) => setQuickDetail(e.target.value)}
                  className="w-28 sm:w-36 bg-slate-900/90 border border-white/15 rounded-xl px-2.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              ) : (
                <select
                  value={quickCategory}
                  onChange={(e: any) => setQuickCategory(e.target.value)}
                  className="bg-slate-900/90 border border-white/15 rounded-xl px-2 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value="intel">INTEL</option>
                  <option value="code">CODE</option>
                  <option value="task">TASK</option>
                  <option value="general">GENERAL</option>
                </select>
              )}
            </div>

            {quickAddType === 'reminder' && (
              <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] font-mono pt-0.5">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-slate-400">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 15 * 60000);
                      setQuickDetail(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                      setQuickUrgentPriority(true);
                      soundFX.playClick();
                    }}
                    className="px-2 py-0.5 rounded bg-amber-950/70 hover:bg-amber-900 border border-amber-500/60 text-amber-300 font-bold flex items-center gap-1 transition"
                  >
                    <Zap className="w-2.5 h-2.5 fill-amber-400" />
                    +15m (Urgent)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 30 * 60000);
                      setQuickDetail(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                      setQuickUrgentPriority(true);
                      soundFX.playClick();
                    }}
                    className="px-2 py-0.5 rounded bg-amber-950/70 hover:bg-amber-900 border border-amber-500/60 text-amber-300 font-bold flex items-center gap-1 transition"
                  >
                    <Zap className="w-2.5 h-2.5 fill-amber-400" />
                    +30m (Urgent)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 60 * 60000);
                      setQuickDetail(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                      soundFX.playClick();
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    +1h
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickDetail('Immediate');
                      setQuickUrgentPriority(true);
                      soundFX.playClick();
                    }}
                    className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-300 font-bold flex items-center gap-1 transition"
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Immediate
                  </button>
                </div>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-amber-400 select-none">
                  <input
                    type="checkbox"
                    checked={quickUrgentPriority}
                    onChange={(e) => setQuickUrgentPriority(e.target.checked)}
                    className="rounded bg-slate-900 border-white/20 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                  />
                  <span className="font-bold flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-amber-400" />
                    High Priority / Urgent
                  </span>
                </label>
              </div>
            )}

            {quickAddType === 'note' && (
              <textarea
                placeholder="Note content, key details, numbers or secret codes..."
                value={quickDetail}
                onChange={(e) => setQuickDetail(e.target.value)}
                rows={2}
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono resize-none"
              />
            )}

            <div className="flex items-center justify-between pt-1">
              {/* Pin from unpinned items option if any exist */}
              {(unpinnedReminders.length > 0 || unpinnedNotes.length > 0) ? (
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                  <span>Or pin from Suite: </span>
                  {unpinnedReminders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playConfirm();
                        onTogglePinReminder(unpinnedReminders[0].id);
                      }}
                      className="text-cyan-400 hover:underline mr-1"
                    >
                      +{unpinnedReminders[0].title.slice(0, 12)}...
                    </button>
                  )}
                  {unpinnedNotes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playConfirm();
                        onTogglePinNote(unpinnedNotes[0].id);
                      }}
                      className="text-amber-400 hover:underline"
                    >
                      +{unpinnedNotes[0].title.slice(0, 12)}...
                    </button>
                  )}
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!quickTitle.trim()}
                  className={`px-4 py-1.5 rounded-lg ${theme.btnPrimary} text-xs font-mono font-bold transition disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5`}
                >
                  <Pin className="w-3.5 h-3.5 rotate-45" />
                  <span>Pin to HUD</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main Pinned Cards Body */}
      {!isCollapsed && (
        <div className="p-2.5 sm:p-3 space-y-2">
          {/* Empty State when zero items pinned */}
          {totalPinned === 0 ? (
            <div className="py-4 px-3 rounded-xl bg-slate-950/40 border border-dashed border-white/10 text-center flex flex-col items-center justify-center gap-2 font-mono">
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                <Pin className="w-4 h-4 rotate-45 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-300">No widgets pinned to Arc Reactor HUD</p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
                  Pin critical reminders or tactical intel notes for instant 1-tap access on your mobile screen.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setQuickAddType('reminder');
                    setIsQuickAddOpen(true);
                  }}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg ${theme.badgeBg} text-[11px] font-mono font-bold flex items-center gap-1.5 transition active:scale-95`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>+ Pin Reminder</span>
                </button>
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setQuickAddType('note');
                    setIsQuickAddOpen(true);
                  }}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 text-[11px] font-mono font-bold flex items-center gap-1.5 transition active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Pin Intel Note</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Mobile Filter Pill Bar (visible on small mobile screens) */}
              <div className="flex sm:hidden items-center justify-between text-[10px] font-mono pb-1 border-b border-white/5">
                <span className="text-slate-400">Filter View:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setFilter('all');
                    }}
                    className={`px-2 py-0.5 rounded ${filter === 'all' ? 'bg-white/20 text-white font-bold' : 'text-slate-400'}`}
                  >
                    All ({totalPinned})
                  </button>
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setFilter('reminders');
                    }}
                    className={`px-2 py-0.5 rounded ${filter === 'reminders' ? 'bg-white/20 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Reminders ({sortedPinnedReminders.length})
                  </button>
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setFilter('notes');
                    }}
                    className={`px-2 py-0.5 rounded ${filter === 'notes' ? 'bg-white/20 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Notes ({pinnedNotes.length})
                  </button>
                </div>
              </div>

              {/* Batch Deletion Control Bar */}
              {isBatchDeleteMode && (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-950/90 via-slate-900/95 to-rose-950/80 border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.25)] flex items-center justify-between gap-2 flex-wrap text-xs font-mono animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllCompleted}
                      className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800/80 border border-rose-500/50 text-rose-200 text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-rose-400" />
                      <span>
                        {selectedBatchIds.length === completedReminders.length
                          ? 'Deselect All'
                          : `Select All (${completedReminders.length})`}
                      </span>
                    </button>
                    <span className="text-[11px] text-rose-300 font-semibold">
                      {selectedBatchIds.length} Selected
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!showBatchConfirm ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedBatchIds.length === 0) return;
                          soundFX.playClick();
                          setShowBatchConfirm(true);
                        }}
                        disabled={selectedBatchIds.length === 0}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete ({selectedBatchIds.length}) Completed</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 animate-fadeIn">
                        <button
                          type="button"
                          onClick={handleExecuteBatchDelete}
                          className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition shadow-lg shadow-rose-500/50 animate-pulse"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Batch Delete ({selectedBatchIds.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBatchConfirm(false)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setIsBatchDeleteMode(false);
                        setShowBatchConfirm(false);
                      }}
                      className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition"
                      title="Close Batch Delete Mode"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Grid or List of Pinned Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Urgent Protocol Queue (Auto-pinned & Bumped to top) */}
                {(filter === 'all' || filter === 'reminders') && urgentPinnedReminders.length > 0 && (
                  <div className="col-span-1 sm:col-span-2 space-y-1.5 mb-1">
                    <div className="flex items-center justify-between px-1 py-0.5 text-[10px] font-mono border-b border-amber-500/20">
                      <span className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider">
                        <Zap className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
                        Urgent Protocol Queue ({urgentPinnedReminders.length})
                      </span>
                      <span className="text-[9px] text-amber-400/80 font-mono hidden xs:inline">
                        Auto-Bumped Priority
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {urgentPinnedReminders.map((reminder) => renderReminderCard(reminder, true))}
                    </div>
                  </div>
                )}

                {/* Standard Pinned Reminders */}
                {(filter === 'all' || filter === 'reminders') &&
                  standardPinnedReminders.map((reminder) => renderReminderCard(reminder, false))}

                {/* Pinned Notes */}
                {(filter === 'all' || filter === 'notes') &&
                  pinnedNotes.map((note) => {
                    const isExpanded = expandedNoteId === note.id;
                    const isLong = note.content && note.content.length > 90;

                    return (
                      <div
                        key={note.id}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-200 font-mono text-xs flex flex-col justify-between shadow-sm shadow-amber-950/40"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="font-bold text-slate-100 truncate text-xs">{note.title}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-semibold">
                                {note.category}
                              </span>

                              {/* Copy Note Text */}
                              <button
                                onClick={() => handleCopyNote(note.id, `${note.title}\n\n${note.content}`)}
                                className="min-h-[28px] min-w-[28px] p-1 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5 flex items-center justify-center"
                                title="Copy note text"
                                aria-label="Copy note content"
                              >
                                {copiedId === note.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>

                              {/* Unpin Note */}
                              <button
                                onClick={() => {
                                  soundFX.playClick();
                                  onTogglePinNote(note.id);
                                }}
                                className="min-h-[28px] min-w-[28px] p-1 text-amber-400 hover:text-cyan-400 transition rounded-lg hover:bg-white/5 flex items-center justify-center"
                                title="Unpin from dashboard"
                                aria-label="Unpin note"
                              >
                                <PinOff className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Note Body with clamp / expand */}
                          <div className="text-[11px] text-slate-300 leading-relaxed break-words whitespace-pre-wrap pl-5 border-l-2 border-amber-500/30 my-1">
                            {isLong && !isExpanded ? `${note.content.slice(0, 90)}...` : note.content}
                          </div>

                          {isLong && (
                            <button
                              onClick={() => {
                                soundFX.playClick();
                                setExpandedNoteId(isExpanded ? null : note.id);
                              }}
                              className="text-[10px] text-amber-400 hover:underline pl-5 mt-0.5 block"
                            >
                              {isExpanded ? 'Show less' : 'Read full note'}
                            </button>
                          )}
                        </div>

                        {/* Footer metadata */}
                        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 mt-1 border-t border-white/5">
                          <span>{note.createdAt}</span>
                          <button
                            onClick={() => {
                              soundFX.playClick();
                              onDeleteNote(note.id);
                            }}
                            className="text-slate-500 hover:text-rose-400 transition"
                            title="Delete note"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Quick Tools Link */}
              <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Stark HUD Quick Access</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      onOpenTools('reminders');
                    }}
                    className="hover:text-cyan-300 transition flex items-center gap-0.5"
                  >
                    <span>All Reminders</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      onOpenTools('notes');
                    }}
                    className="hover:text-amber-300 transition flex items-center gap-0.5"
                  >
                    <span>All Notes</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
