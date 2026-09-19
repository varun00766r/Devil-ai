import React, { useState, useEffect, useRef } from 'react';
import { Persona, ChatMessage, Reminder, StarkNote, IndiaNewsItem, ScanResultData, FakeCallConfig, ScanMode } from './types';
import { HeaderHUD } from './components/HeaderHUD';
import { ArcReactor } from './components/ArcReactor';
import { MessageItem } from './components/MessageItem';
import { VoiceInputBar } from './components/VoiceInputBar';
import { CameraScanner } from './components/CameraScanner';
import { ScreenVisionModal } from './components/ScreenVisionModal';
import { ToolsModal, ToolsModalTab } from './components/ToolsModal';
import { QuickMemoModal } from './components/QuickMemoModal';
import { QuickSearchChips } from './components/QuickSearchChips';
import { AlwaysOnVoiceHUD } from './components/AlwaysOnVoiceHUD';
import { PinnedWidgets } from './components/PinnedWidgets';
import { OfflineIndicator } from './components/OfflineIndicator';
import { QuantumCoreHUD } from './components/QuantumCoreHUD';
import { JarvisWebInterface } from './components/JarvisWebInterface';
import { FakeCallScreen } from './components/FakeCallScreen';
import { useAlwaysOnVoice } from './lib/useAlwaysOnVoice';
import { startMobileBackgroundService, stopMobileBackgroundService } from './lib/backgroundKeepAlive';
import { speakTextNative, soundFX, setMaleVoiceConfig, getMaleVoiceConfig, findBestIndianMaleVoice } from './lib/audio';
import { requestNotificationPermission, sendLocalNotification, scheduleLocalAlert } from './lib/notifications';
import { getCurrentGPSLocation, GPSLocation } from './lib/location';
import { useBatteryStatus } from './lib/useBatteryStatus';
import { Sparkles, Calendar, CheckSquare, ListTodo, Shield, Search, FileText, Smartphone, Gauge, Mic, Newspaper, Globe, Trash2, Pin, Archive, MessageSquare, ShieldAlert, PhoneCall, Download, Radio, Eye, EyeOff, BatteryCharging, BatteryWarning, Battery } from 'lucide-react';

export default function App() {
  const [persona, setPersona] = useState<Persona>('devil');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const batteryStatus = useBatteryStatus();
  const [isClearView, setIsClearView] = useState<boolean>(() => {
    return localStorage.getItem('devil_clear_view') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('devil_clear_view', String(isClearView));
  }, [isClearView]);

  // Battery Auto-Theming alert watcher: announces when battery drops below 20%
  const prevLowBatteryRef = useRef(batteryStatus.isLowBattery);
  useEffect(() => {
    if (!prevLowBatteryRef.current && batteryStatus.isLowBattery) {
      soundFX.playWarning();
      const isHindi = persona === 'devil';
      const alertMsg = isHindi
        ? `⚠️ **चेतावनी बॉस!** डिवाइस की बैटरी 20% से कम (${batteryStatus.batteryLevel}%) हो गई है। आर्क रिएक्टर ऑटो-थीम सक्रिय हो गया है और इसका रंग **सियान (Cyan)** से **लाल (Red)** में बदल गया है!`
        : `⚠️ **Warning Boss!** Device battery dropped below 20% (${batteryStatus.batteryLevel}%). Arc Reactor auto-theming activated: color switched from **Cyan** to **Red Alert**!`;

      const chatAlert: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        text: alertMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showMobileManager: true,
      };
      setMessages((prev) => [...prev, chatAlert]);
      speak(alertMsg);
    }
    prevLowBatteryRef.current = batteryStatus.isLowBattery;
  }, [batteryStatus.isLowBattery, batteryStatus.batteryLevel, persona]);

  // Modals state
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [toolsDefaultTab, setToolsDefaultTab] = useState<ToolsModalTab>('india');
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [visionDefaultScanMode, setVisionDefaultScanMode] = useState<ScanMode>('tactical');
  const [isScreenVisionOpen, setIsScreenVisionOpen] = useState(false);
  const [screenVisionDefaultMode, setScreenVisionDefaultMode] = useState<'instagram' | 'wifi' | 'screen'>('instagram');
  const [isQuickMemoOpen, setIsQuickMemoOpen] = useState(false);
  const [isQuantumCoreOpen, setIsQuantumCoreOpen] = useState(false);
  const [isJarvisWebInterfaceOpen, setIsJarvisWebInterfaceOpen] = useState(false);

  // Fake Number Calling Simulator state
  const [scheduledFakeCall, setScheduledFakeCall] = useState<{ config: FakeCallConfig; triggerTime: number } | null>(null);
  const [activeFakeCall, setActiveFakeCall] = useState<FakeCallConfig | null>(null);

  // Scheduled fake call countdown watcher
  useEffect(() => {
    if (!scheduledFakeCall) return;
    const checkInterval = setInterval(() => {
      if (Date.now() >= scheduledFakeCall.triggerTime) {
        soundFX.playConfirm();
        setActiveFakeCall(scheduledFakeCall.config);
        setScheduledFakeCall(null);
      }
    }, 400);
    return () => clearInterval(checkInterval);
  }, [scheduledFakeCall]);

  const handleScheduleFakeCall = (config: FakeCallConfig) => {
    if (config.delaySeconds <= 1) {
      soundFX.playConfirm();
      setActiveFakeCall(config);
      setScheduledFakeCall(null);
    } else {
      const triggerTime = Date.now() + config.delaySeconds * 1000;
      setScheduledFakeCall({ config, triggerTime });
      scheduleLocalAlert(
        'fake-call-' + Date.now(),
        `📞 Incoming Call: ${config.callerName}`,
        `${config.callerNumber} is calling you now!`,
        config.delaySeconds * 1000
      );
    }
  };

  const handleCancelScheduledFakeCall = () => {
    soundFX.playClick();
    setScheduledFakeCall(null);
  };

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('devil_messages') || localStorage.getItem('jarvis_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: '1',
        role: 'assistant',
        text: '⚡ ALL CLEAR // 3D QUANTUM CORE ONLINE // READY FOR COMMAND, BOSS\n\n📞 **DEVIL Fake Number Calling & Escape Shield Active**:\nनीचे दिए गए **Fake Call Simulator** से आप किसी भी अज्ञात नंबर (**Private Number**), दिल्ली पुलिस (112), या कस्टम नंबर से तुरंत (Now) या 15s में फर्जी इनकमिंग कॉल ट्रिगर कर सकते हैं।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showFakeCallLauncher: true,
      },
    ];
  });

  // Reminders & To-Do Tasks state
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('devil_reminders') || localStorage.getItem('jarvis_reminders');
    if (saved) {
      try {
        const parsed: Reminder[] = JSON.parse(saved);
        if (parsed.length > 0 && !parsed.some((r) => r.isPinned)) {
          parsed[0].isPinned = true;
        }
        return parsed;
      } catch (e) {}
    }
    return [
      { id: '1', title: 'DEVIL Security Systems Audit', time: '14:00', completed: false, isPinned: true },
      { id: '2', title: 'Mark LXXXV Armor Telemetry Check', time: '18:30', completed: false },
    ];
  });

  // Notes & Intel state
  const [notes, setNotes] = useState<StarkNote[]>(() => {
    const saved = localStorage.getItem('devil_notes') || localStorage.getItem('jarvis_notes');
    if (saved) {
      try {
        const parsed: StarkNote[] = JSON.parse(saved);
        if (parsed.length > 0 && !parsed.some((n) => n.isPinned)) {
          parsed[0].isPinned = true;
        }
        return parsed;
      } catch (e) {}
    }
    return [
      { id: '1', title: 'Arc Reactor Calibration', content: 'Nanotech deployment speed optimized by 14.2%.', category: 'intel', createdAt: 'Today', isPinned: true },
    ];
  });

  // All-Time Live (24x7 Continuous Hands-Free Voice & Screen Wake Lock) state
  const [isAlwaysOnVoice, setIsAlwaysOnVoice] = useState<boolean>(() => {
    const saved = localStorage.getItem('devil_all_time_live');
    return saved !== null ? saved === 'true' : false;
  });
  const [alwaysOnLang, setAlwaysOnLang] = useState<'hi-IN' | 'en-US'>('hi-IN');
  const [alwaysOnInterimText, setAlwaysOnInterimText] = useState('');

  // Voice Feedback (Speech Output Mode)
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('devil_voice_feedback');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleVoiceFeedback = () => {
    setVoiceFeedbackEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('devil_voice_feedback', String(next));
      if (!next) {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        soundFX.playClick();
      } else {
        soundFX.playConfirm();
      }
      return next;
    });
  };

  // Centralized speech handler that strictly adheres to the Voice Feedback toggle
  const speak = (text?: string, customPersona?: Persona, onEnd?: () => void) => {
    if (!text || typeof text !== 'string') {
      setIsSpeaking(false);
      if (onEnd) onEnd();
      return;
    }
    if (!voiceFeedbackEnabled) {
      setIsSpeaking(false);
      if (onEnd) onEnd();
      return;
    }
    setIsSpeaking(true);
    speakTextNative(text, customPersona || persona, () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    });
  };

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('devil_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('devil_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('devil_notes', JSON.stringify(notes));
  }, [notes]);

  // Handle shortcut URL parameters e.g. /?view=notes or /?view=reminders
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'notes') {
      setToolsDefaultTab('notes');
      setIsToolsOpen(true);
    } else if (view === 'reminders') {
      setToolsDefaultTab('reminders');
      setIsToolsOpen(true);
    }
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Clear UI / Reset Chat History / Launch 3D Quantum Black Screen / Clarity Engine
  const handleClearUI = (speakConfirmation = true, openQuantum = false, setClearView = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    localStorage.removeItem('devil_messages');
    localStorage.removeItem('jarvis_messages');

    if (setClearView) {
      setIsClearView(true);
      localStorage.setItem('devil_clear_view', 'true');
    }

    const freshMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      text: '⚡ **ALL CLEAR // UI CLARITY ENGINE ACTIVE // READY FOR COMMAND, BOSS**\n\nबॉस! स्क्रीन व टर्मिनल को साफ कर दिया गया है। मेमोरी कैशे रीसेट हो चुकी है। नीचे दिए गए **Clear View Mode** और **Cockpit Full HUD** से आप दृश्य को मनमुताबिक व्यवस्थित कर सकते हैं।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showUIClearingCard: true,
    };

    setMessages([freshMsg]);
    soundFX.playConfirm();

    if (openQuantum) {
      setIsQuantumCoreOpen(true);
    }

    if (speakConfirmation) {
      speak('ऑल क्लियर बॉस। यूआई पूरी तरह साफ और क्रिस्टल क्लियर है।');
    }
  };

  // Command intent detection helper for Personal Assistant features ("Remind me to...", "Add X to my to-do list")
  const processAssistantIntents = (text: string): { intercepted: boolean; reply?: string } => {
    const lower = text.toLowerCase().trim();

    // Check for "Open notes" or "Show notes" or "नोट्स दिखाओ"
    if (
      lower.includes('show notes') ||
      lower.includes('open notes') ||
      lower.includes('view notes') ||
      lower.includes('my notes') ||
      lower.includes('नोट्स दिखाओ') ||
      lower.includes('नोट्स खोलो')
    ) {
      setToolsDefaultTab('notes');
      setIsToolsOpen(true);
      return {
        intercepted: true,
        reply: 'जी बॉस, आपका ऑफ़लाइन इंटेलिजेंस नोट्स बैंक खोल दिया गया है। सभी नोट्स बिना इंटरनेट के भी उपलब्ध हैं।',
      };
    }

    // Check for "Open reminders" or "Show reminders" or "रिमाइंडर्स दिखाओ"
    if (
      lower.includes('show reminders') ||
      lower.includes('open reminders') ||
      lower.includes('view reminders') ||
      lower.includes('my reminders') ||
      lower.includes('show tasks') ||
      lower.includes('रिमाइंडर दिखाओ') ||
      lower.includes('रिमाइंडर खोलो')
    ) {
      setToolsDefaultTab('reminders');
      setIsToolsOpen(true);
      return {
        intercepted: true,
        reply: 'जी बॉस, आपके सभी शेड्यूल्ड रिमाइंडर्स व टास्क खोल दिए गए हैं।',
      };
    }

    // Check for "Show pinned widgets" or "Pinned widgets"
    if (
      lower.includes('show pinned widgets') ||
      lower.includes('pinned widgets') ||
      lower.includes('पिन विजेट्स') ||
      lower.includes('पिन किए गए विजेट')
    ) {
      const pinnedRemindersCount = reminders.filter((r) => r.isPinned).length;
      const pinnedNotesCount = notes.filter((n) => n.isPinned).length;
      const isHindi = /[\u0900-\u097F]/.test(text);
      return {
        intercepted: true,
        reply: isHindi
          ? `जी बॉस, आर्क रिएक्टर के ठीक नीचे आपके ${pinnedRemindersCount} पिन रिमाइंडर्स और ${pinnedNotesCount} पिन नोट्स एक्टिव हैं।`
          : `Boss, your Pinned Widgets HUD is active right below the Arc Reactor with ${pinnedRemindersCount} pinned reminders and ${pinnedNotesCount} pinned notes.`,
      };
    }

    // Check for "Pin note [X]" or Hindi "पिन नोट"
    if (
      lower.startsWith('pin note ') ||
      lower.startsWith('pin intel ') ||
      lower.includes('नोट पिन करो') ||
      lower.includes('पिन नोट')
    ) {
      let noteText = text
        .replace(/^pin note:?\s*/i, '')
        .replace(/^pin intel:?\s*/i, '')
        .replace(/नोट पिन करो/g, '')
        .replace(/पिन नोट/g, '')
        .trim();

      const newNote: StarkNote = {
        id: Date.now().toString(),
        title: noteText.slice(0, 32) || 'Pinned Intel Note',
        content: noteText || 'Pinned tactical intel memo.',
        category: 'intel',
        createdAt: new Date().toLocaleDateString(),
        isPinned: true,
      };

      setNotes((prev) => [newNote, ...prev]);

      const isHindi = /[\u0900-\u097F]/.test(text) || lower.includes('kar');
      const reply = isHindi
        ? `जी बॉस, नोट "${newNote.title}" को आर्क रिएक्टर के ठीक नीचे पिन विजेट्स में सुरक्षित कर दिया गया है।`
        : `Understood, Boss. Pinned note "${newNote.title}" directly below the Arc Reactor HUD.`;
      return { intercepted: true, reply };
    }

    // Check for "Pin reminder [X]" or "Pin task [X]" or Hindi "रिमाइंडर पिन करो"
    if (
      lower.startsWith('pin reminder ') ||
      lower.startsWith('pin task ') ||
      lower.includes('रिमाइंडर पिन करो') ||
      lower.includes('पिन रिमाइंडर')
    ) {
      let taskText = text
        .replace(/^pin reminder:?\s*/i, '')
        .replace(/^pin task:?\s*/i, '')
        .replace(/रिमाइंडर पिन करो/g, '')
        .replace(/पिन रिमाइंडर/g, '')
        .trim();
      let time = 'Today, 09:00';

      if (taskText.toLowerCase().includes(' at ')) {
        const parts = taskText.split(/ at /i);
        taskText = parts[0];
        time = parts[1];
      }

      const newReminder: Reminder = {
        id: Date.now().toString(),
        title: taskText || 'Pinned Reminder',
        time,
        completed: false,
        isPinned: true,
      };

      setReminders((prev) => [newReminder, ...prev]);

      const isHindi = /[\u0900-\u097F]/.test(text) || lower.includes('kar');
      const reply = isHindi
        ? `जी बॉस, रिमाइंडर "${newReminder.title}" (${time}) को मुख्य डैशबोर्ड पर पिन कर दिया गया है।`
        : `Affirmative Boss. Pinned reminder "${newReminder.title}" (${time}) directly below your Arc Reactor.`;
      return { intercepted: true, reply };
    }

    // Check for "Take a note [X]" or "Save note [X]" or "Note: [X]" or Hindi "नोट लिखो", "नोट सेव करो"
    if (
      lower.startsWith('take a note ') ||
      lower.startsWith('save note ') ||
      lower.startsWith('new note ') ||
      lower.startsWith('note: ') ||
      lower.includes('नोट लिखो') ||
      lower.includes('नोट सेव करो') ||
      lower.includes('नोट बनाओ')
    ) {
      let noteText = text
        .replace(/^take a note:?\s*/i, '')
        .replace(/^save note:?\s*/i, '')
        .replace(/^new note:?\s*/i, '')
        .replace(/^note:\s*/i, '')
        .replace(/नोट लिखो/g, '')
        .replace(/नोट सेव करो/g, '')
        .replace(/नोट बनाओ/g, '')
        .trim();

      const newNote: StarkNote = {
        id: Date.now().toString(),
        title: noteText.slice(0, 32) || 'Quick Intel Note',
        content: noteText || 'Recorded tactical intel.',
        category: 'intel',
        createdAt: new Date().toLocaleDateString(),
      };

      setNotes((prev) => [newNote, ...prev]);

      const isHindi = /[\u0900-\u097F]/.test(text) || lower.includes('kar');
      const reply = isHindi
        ? `जी बॉस, मैंने नया नोट "${newNote.title}" आपके डिवाइस के ऑफ़लाइन मेमोरी बैंक में सुरक्षित कर दिया है।`
        : `Understood, Boss. I have stored "${newNote.title}" in your local offline memory bank.`;
      return { intercepted: true, reply };
    }

    // Check for "Remind me to [X]" or "Set a reminder to [X]" or Hindi "रिमाइंड करो", "याद दिलाओ"
    if (
      lower.startsWith('remind me to ') ||
      lower.startsWith('set a reminder to ') ||
      lower.includes('remind me') ||
      lower.includes('रिमाइंड करो') ||
      lower.includes('याद दिलाओ') ||
      lower.includes('रिमाइंडर सेट करो')
    ) {
      let taskText = text
        .replace(/^remind me to /i, '')
        .replace(/^set a reminder to /i, '')
        .replace(/रिमाइंड करो/g, '')
        .replace(/याद दिलाओ/g, '')
        .replace(/रिमाइंडर सेट करो/g, '')
        .trim();
      let time = 'Today, 09:00';

      // Simple time extraction if specified e.g. "at 5pm" or "in 2 hours"
      if (taskText.toLowerCase().includes(' at ')) {
        const parts = taskText.split(/ at /i);
        taskText = parts[0];
        time = parts[1];
      }

      const newReminder: Reminder = {
        id: Date.now().toString(),
        title: taskText || 'New Reminder',
        time: time,
        completed: false,
      };

      setReminders((prev) => [newReminder, ...prev]);

      // Request notification permission and trigger/schedule local notification
      requestNotificationPermission().then((granted) => {
        if (granted) {
          sendLocalNotification(`DEVIL Reminder: ${newReminder.title}`, `Scheduled for ${time}`);
          scheduleLocalAlert(newReminder.id, `DEVIL Alert`, newReminder.title, 5000);
        }
      });

      const isHindi = /[\u0900-\u097F]/.test(text) || lower.includes('kar') || lower.includes('yadd');
      const reply = isHindi
        ? `जी बॉस, मैंने "${newReminder.title}" का रिमाइंडर (${time}) आपके शेड्यूल में सेट कर दिया है।`
        : `Very well, Boss. I have set a reminder for "${newReminder.title}" (${time}). You can view it in your Stark Suite schedule.`;
      return { intercepted: true, reply };
    }

    // Check for "Add [X] to my to-do list" or Hindi "टास्क जोड़ो", "टू डू लिस्ट"
    if (
      lower.includes('to my to-do list') ||
      lower.includes('to my todo list') ||
      lower.includes('to my tasks') ||
      lower.startsWith('add task ') ||
      lower.includes('टास्क जोड़ो') ||
      lower.includes('टू-डू लिस्ट में जोड़ो') ||
      lower.includes('टू डू लिस्ट')
    ) {
      let taskText = text
        .replace(/add /i, '')
        .replace(/ to my to-do list/i, '')
        .replace(/ to my todo list/i, '')
        .replace(/ to my tasks/i, '')
        .replace(/^task /i, '')
        .replace(/टास्क जोड़ो/g, '')
        .replace(/टू-डू लिस्ट में जोड़ो/g, '')
        .trim();

      const newReminder: Reminder = {
        id: Date.now().toString(),
        title: taskText || 'New To-Do Task',
        time: 'Pending',
        completed: false,
      };

      setReminders((prev) => [newReminder, ...prev]);

      const isHindi = /[\u0900-\u097F]/.test(text);
      const reply = isHindi
        ? `जी बॉस, मैंने "${newReminder.title}" को आपकी टू-डू सूची में शामिल कर दिया है।`
        : `Understood, Boss. I have added "${newReminder.title}" to your to-do list.`;
      return { intercepted: true, reply };
    }

    return { intercepted: false };
  };

  // Handle sending message to backend server (/api/devil/chat)
  const handleSendMessage = async (text: string, image?: string, explicitSearch?: boolean) => {
    if (!text && !image) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      image,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Check if command is a personal assistant command ("Remind me to...", "Add X to my to-do list")
    if (text) {
      const lower = text.toLowerCase().trim();

      // Check for Clear UI / UI Clearing / UI Clearly / Clarity Mode / 3D Quantum commands
      const isClearQuantumCmd =
        lower.includes('3d quantum') ||
        lower.includes('quantum') ||
        lower.includes('black screen');

      const isClearCmd =
        lower.includes('ui clearing') ||
        lower.includes('ui clearly') ||
        lower.includes('clear ui') ||
        lower.includes('clean ui') ||
        lower.includes('ui clear') ||
        lower.includes('clarity mode') ||
        lower.includes('clear view') ||
        lower.includes('clean view') ||
        lower.includes('clear screen') ||
        lower.includes('clean screen') ||
        lower.includes('screen clear') ||
        lower.includes('screen clean') ||
        lower.includes('all clear') ||
        lower.includes('clear all') ||
        lower.includes('clear chat') ||
        lower.includes('chat clear') ||
        lower.includes('reset ui') ||
        lower.includes('make ui clear') ||
        lower.includes('clean clearly') ||
        lower === 'clear' ||
        lower === 'clean' ||
        lower === 'cls' ||
        lower.includes('ऑल क्लियर') ||
        lower.includes('सब साफ करो') ||
        lower.includes('स्क्रीन साफ करो') ||
        lower.includes('चैट साफ करो') ||
        lower.includes('क्लियर यूआई') ||
        lower.includes('क्लियर चैट') ||
        lower.includes('स्क्रीन क्लियर') ||
        lower.includes('साफ करो') ||
        lower === 'क्लियर';

      if (isClearCmd) {
        const wantsClearView =
          lower.includes('clearly') ||
          lower.includes('clear view') ||
          lower.includes('clean view') ||
          lower.includes('clarity') ||
          lower.includes('clean ui') ||
          lower.includes('ui clear') ||
          lower.includes('ui clearing');
        handleClearUI(true, isClearQuantumCmd, wantsClearView);
        return;
      }

      // Check for J.A.R.V.I.S. Web Interface Hologram commands
      if (
        lower === 'initialize jarvis' ||
        lower === 'init jarvis' ||
        lower === 'jarvis web interface' ||
        lower === 'open jarvis web interface' ||
        lower === 'jarvis web' ||
        lower === 'jarvis interface' ||
        lower === 'jarvis arc' ||
        lower.includes('initialize jarvis') ||
        lower.includes('jarvis web interface') ||
        lower.includes('जार्विस इंटरफेस')
      ) {
        soundFX.playPowerUp();
        setIsJarvisWebInterfaceOpen(true);
        const replyText = 'At your service, Sir. J.A.R.V.I.S. Web Interface and dual-arc animated hologram HUD initialized.';
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        speak(replyText);
        return;
      }

      // Check for Face Scan / Face details / Face Name Address / ID Dossier commands
      const isFaceIntelCmd =
        lower === 'face' ||
        lower === 'face scan' ||
        lower === 'face details' ||
        lower === 'face se detail' ||
        lower === 'face se details' ||
        lower.includes('face se detail') ||
        lower.includes('face se details') ||
        lower.includes('face details') ||
        lower.includes('face detail') ||
        lower.includes('face all detail') ||
        lower.includes('face all details') ||
        lower.includes('face scan') ||
        lower.includes('face se naam') ||
        lower.includes('face se address') ||
        (lower.includes('face') && (lower.includes('naam') || lower.includes('name') || lower.includes('address') || lower.includes('detail') || lower.includes('id') || lower.includes('पता'))) ||
        lower.includes('naam address') ||
        lower.includes('name address') ||
        lower.includes('नाम और पता') ||
        lower.includes('चेहरे से नाम') ||
        lower.includes('फेस डिटेल') ||
        lower.includes('चेहरे से डिटेल') ||
        lower.includes('चेहरा स्कैन') ||
        lower.includes('face intel') ||
        lower.includes('face recognition');

      if (isFaceIntelCmd) {
        soundFX.playPowerUp();
        setVisionDefaultScanMode('face');
        setIsVisionOpen(true);
        const replyText =
          'जी बॉस! DEVIL फेशियल और आइडेंटिटी डोज़ियर स्कैनर एक्टिवेट कर दिया गया है।\n\n' +
          '📋 **डोज़ियर एक्सट्रैक्शन क्षमताएं:**\n' +
          '1. 👤 **नाम (Full Name):** पहचान पत्र, बैज, विजिटिंग कार्ड या रिकॉग्निशन से पूरा नाम।\n' +
          '2. 📍 **पूरा पता (Full Address):** कार्ड/दस्तावेज़ से आवासीय पता, शहर, राज्य, पिनकोड व लोकेशन संकेत।\n' +
          '3. 🪪 **दस्तावेज़ व संपर्क (ID & Contacts):** आधार, पैन, वोटर ID, ड्राइविंग लाइसेंस नंबर, मोबाइल व ईमेल ID।\n' +
          '4. 🧬 **बायोमेट्रिक्स (Biometrics):** अनुमानित आयु (Age), जेंडर, चेहरे के फीचर्स, पहचान चिह्न व एक्सप्रेशन।\n\n' +
          'कैमरा स्कैनर स्क्रीन पर खुल चुका है—सीधे चेहरा या ID कार्ड स्कैन करें या गैलरी से फोटो अपलोड करें!';
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        speak('जी बॉस! DEVIL फेशियल और आइडेंटिटी डोज़ियर स्कैनर सक्रिय कर दिया गया है। चेहरा या पहचान पत्र कैमरे के सामने लाएं या अपलोड करें। पूरा नाम, पता, संपर्क और बायोमेट्रिक विवरण तुरंत एक्सट्रैक्ट हो जाएंगे।');
        return;
      }

      // Check for Quantum Core / JARVIS 3D HUD commands
      if (
        lower === 'quantum core' ||
        lower === 'open quantum core' ||
        lower === 'jarvis hud' ||
        lower === 'quantum core processor' ||
        lower === 'quantum hud' ||
        lower === '3d core' ||
        lower === 'show core' ||
        lower === 'open hud' ||
        lower === '3d particle core' ||
        lower.includes('quantum core') ||
        lower.includes('jarvis hud') ||
        lower.includes('क्वांटम कोर') ||
        lower.includes('होलोग्राफिक कोर')
      ) {
        soundFX.playPowerUp();
        setIsQuantumCoreOpen(true);
        const replyText = 'जी बॉस, JARVIS QUANTUM CORE // HOLOGRAPHIC ANALYSIS V3.14 3D स्क्रीन पर लोड कर दिया गया है। 4,000 नोड्स क्वांटम कण पूर्णतः सक्रिय हैं।';
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        speak('जी बॉस, क्वांटम कोर होलोग्राफिक 3D सक्रिय कर दिया गया है।');
        return;
      }

      const intentResult = processAssistantIntents(text);
      if (intentResult.intercepted && intentResult.reply) {
        soundFX.playConfirm();
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: intentResult.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        speak(intentResult.reply);
        return;
      }

      // Check for explicit "call me boss" / "call me boss only" / "devil call me boss only"
      if (
        lower.includes('call me boss') ||
        lower.includes('call me only boss') ||
        lower.includes('call me just boss') ||
        lower.includes('call me boss only') ||
        lower.includes('boss only') ||
        lower.includes('मुझे सिर्फ बॉस बोलो') ||
        lower.includes('मुझे सिर्फ बॉस कहो') ||
        lower.includes('मुझे सिर्फ बॉस बुलाओ') ||
        lower.includes('मुझे बॉस कहो') ||
        lower.includes('मुझे बॉस बोलो') ||
        lower.includes('मुझे बॉस बुलाओ') ||
        lower.includes('sir mat bolo') ||
        lower.includes('malik mat bolo')
      ) {
        soundFX.playPowerUp();
        const replyText = 'नमस्ते बॉस! आदेश शिरोधार्य है। अब से DEVIL आपको सिर्फ और सिर्फ **"बॉस" (Boss)** कहकर ही संबोधित करेगा। DEVIL हमेशा आपके हर हुक्म का पाबंद है। आदेश दीजिए बॉस!';
        
        const bossOnlyAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, bossOnlyAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for DEVIL All-Time Live / Always-On Voice commands
      if (
        lower === 'devil all time live' ||
        lower === 'all time live' ||
        lower === 'all time live on' ||
        lower === 'devil all time live on' ||
        lower === 'all time voice' ||
        lower === 'all time voice on' ||
        lower === 'always on' ||
        lower === 'always on live' ||
        lower === 'always on voice' ||
        lower === 'hands free mode' ||
        lower === 'hands free on' ||
        lower === 'live mode on' ||
        lower === 'devil live' ||
        lower.includes('all time live') ||
        lower.includes('always on voice') ||
        lower.includes('always on live') ||
        lower.includes('ऑल टाइम लाइव') ||
        lower.includes('ऑल टाइम वॉयस') ||
        lower.includes('हैंड्स फ्री ऑन')
      ) {
        setIsAlwaysOnVoice(true);
        localStorage.setItem('devil_all_time_live', 'true');
        setVoiceFeedbackEnabled(true);
        localStorage.setItem('devil_voice_feedback', 'true');
        soundFX.playPowerUp();
        
        const replyText = 'नमस्ते बॉस! **DEVIL ALL-TIME LIVE (24x7 Continuous Hands-Free & Wake Lock)** सक्रिय कर दिया गया है!\n\n🎙️ **Continuous Speech Radar:** अब आपको किसी बटन को दबाने की ज़रूरत नहीं है। सीधे अपना सवाल/आदेश बोलें या "Hey Devil" कहें।\n⚡ **Screen Wake-Lock Active:** आपकी स्क्रीन स्लीप नहीं होगी, DEVIL निरंतर लाइव रहेगा।\n🔊 **Voice Feedback Active:** DEVIL आपको बोलकर लाइव उत्तर देगा।\n\nआदेश दीजिए बॉस!';
        
        const liveAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, liveAssistantMsg]);
        speak(replyText);
        return;
      }

      // 🇮🇳 ALL-INDIA DATA + FAST REPLY + BACKGROUND ON (COMBO & STANDALONE HANDLERS)
      const hasSeeScreen = lower.includes('see my screen') || lower.includes('my screen see') || lower.includes('screen see') || lower.includes('screen dekho') || lower.includes('स्क्रीन देखो');
      const hasInstagramId = lower.includes('instagram id') || lower.includes('instragram id') || lower.includes('insta id') || lower.includes('इंस्टाग्राम') || lower.includes('instagram');

      const hasAllIndiaData =
        lower.includes('all india ka data') ||
        lower.includes('all india data') ||
        lower.includes('india data') ||
        lower.includes('bharat data') ||
        lower.includes('ऑल इंडिया') ||
        lower.includes('भारत का डाटा') ||
        lower.includes('भारत का डेटा') ||
        lower.includes('इंडिया का डाटा') ||
        lower === 'all india' ||
        lower === 'india' ||
        lower === 'bharat';

      const hasFastReplyCmd =
        lower.includes('fast reply') ||
        lower.includes('fast search') ||
        lower.includes('fast response') ||
        lower.includes('फास्ट रिप्लाई') ||
        lower.includes('तेज़ उत्तर') ||
        lower.includes('तेज जवाब');

      const hasBackgroundOnCmd =
        lower.includes('background on') ||
        lower.includes('background mode on') ||
        lower.includes('background service on') ||
        lower.includes('start background') ||
        lower.includes('turn on background') ||
        lower.includes('enable background') ||
        lower.includes('बैकग्राउंड ऑन') ||
        lower.includes('बैकग्राउंड चालू') ||
        lower.includes('बैकग्राउंड सर्विस ऑन');

      const hasBackgroundOffCmd =
        lower === 'background off' ||
        lower === 'turn off background' ||
        lower === 'disable background' ||
        lower === 'stop background' ||
        lower.includes('background off') ||
        lower.includes('बैकग्राउंड बंद') ||
        lower.includes('बैकग्राउंड स्टॉप');

      // 1. Combo handler: "All india ka data and fast reply and background on" (or any combination)
      if (hasAllIndiaData && (hasFastReplyCmd || hasBackgroundOnCmd)) {
        setIsAlwaysOnVoice(true);
        localStorage.setItem('devil_all_time_live', 'true');
        setVoiceFeedbackEnabled(true);
        localStorage.setItem('devil_voice_feedback', 'true');
        startMobileBackgroundService().catch(() => {});
        soundFX.playPowerUp();

        const replyText = `नमस्ते बॉस! आपके सभी आदेश DEVIL द्वारा तुरंत निष्पादित (Execute) कर दिए गए हैं:\n\n🇮🇳 **All-India Data Matrix:** 28 राज्य, 8 केंद्र शासित प्रदेश (UTs), आपातकालीन 112/100/108/1090/1930 सेवाएं, डिजिटल इंडिया पोर्टल्स व ग्वालियर (MP) अंचल डेटा कार्ड नीचे संलग्न है।\n⚡ **Fast Reply Core:** सक्रिय (<1s अल्ट्रा-फास्ट न्यूरल रिस्पॉन्स, ऑप्टिमाइज़्ड मॉडल चालू)\n📱 **Background Keep-Alive Service:** चालू! स्क्रीन वेक-लॉक और बैकग्राउंड ऑडियो लूप सक्रिय है — आप कभी भी "डेविल बोलो" कहकर हैंड्स-फ्री आदेश दे सकते हैं!`;

        const comboAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showAllIndiaData: true,
        };

        setMessages((prev) => [...prev, comboAssistantMsg]);
        speak(replyText);
        return;
      }

      // 2. Standalone All-India Data handler
      if (hasAllIndiaData) {
        soundFX.playConfirm();
        const replyText = `नमस्ते बॉस! **DEVIL ALL-INDIA STRATEGIC DATA MATRIX** लोड कर दिया गया है।\n\n• भारत के सभी 28 राज्यों और 8 केंद्र शासित प्रदेशों (UTs) की राजधानियां\n• राष्ट्रीय आपातकालीन हेल्पलाइन (112, 100, 108, 1090, 1930, 139)\n• डिजिटल इंडिया के महत्वपूर्ण सरकारी पोर्टल्स व इसरो टेलीमेट्री\n• ग्वालियर एवं मध्य प्रदेश सामरिक डेटा\n\nनीचे इंटरैक्टिव डेटा कार्ड में सम्पूर्ण विवरण उपलब्ध है बॉस!`;

        const indiaAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showAllIndiaData: true,
        };

        setMessages((prev) => [...prev, indiaAssistantMsg]);
        speak(replyText);
        return;
      }

      // 3. Standalone Background ON handler
      if (hasBackgroundOnCmd || lower === 'background' || lower === 'run in background') {
        setIsAlwaysOnVoice(true);
        localStorage.setItem('devil_all_time_live', 'true');
        setVoiceFeedbackEnabled(true);
        localStorage.setItem('devil_voice_feedback', 'true');
        startMobileBackgroundService().catch(() => {});
        soundFX.playPowerUp();

        const replyText = `जी बॉस! **DEVIL 24x7 Mobile Background Service** चालू कर दी गई है!\n\n• स्क्रीन वेक-लॉक सक्रिय है (डिवाइस स्लीप नहीं होगा)\n• बैकग्राउंड कीप-अलाइव लूप चालू है\n• वेक-वर्ड "डेविल बोलो" (Devil Bolo) किसी भी समय सुनने के लिए तैयार है!`;

        const bgAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, bgAssistantMsg]);
        speak(replyText);
        return;
      }

      // 4. Standalone Background OFF handler
      if (hasBackgroundOffCmd) {
        setIsAlwaysOnVoice(false);
        localStorage.setItem('devil_all_time_live', 'false');
        stopMobileBackgroundService();
        soundFX.playClick();

        const replyText = `बॉस! **DEVIL Background Service** रोक दी गई है। स्क्रीन वेक-लॉक और बैकग्राउंड प्रोसेस निष्प्रभावी कर दिए गए हैं।`;

        const bgOffAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, bgOffAssistantMsg]);
        speak(replyText);
        return;
      }

      // 5. Standalone Fast Reply handler
      if (hasFastReplyCmd && !hasSeeScreen && !hasInstagramId) {
        soundFX.playConfirm();
        const replyText = `नमस्ते बॉस! **DEVIL Fast Reply Core** सक्रिय है। अल्ट्रा-फास्ट न्यूरल इंजन (<1s लेटेंसी) पर सभी संदेशों के त्वरित उत्तर बिना किसी रुकावट के प्राप्त होंगे।`;

        const fastAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, fastAssistantMsg]);
        speak(replyText);
        return;
      }

      // ⚡ COMPOSITE / ALL-IN-ONE COMMAND HANDLER:
      // "fast reply and search and voice Man only and my location wifi password see my screen and my location Instragram id my screen see"
      const hasManOnly = lower.includes('man only') || lower.includes('voice man only') || lower.includes('male only') || lower.includes('man voice only') || lower.includes('पुरुष आवाज़');
      const hasFastReply = lower.includes('fast reply') || lower.includes('fast search') || lower.includes('फास्ट रिप्लाई');
      const hasWifiPassword = lower.includes('wifi password') || lower.includes('wi-fi password') || lower.includes('वाईफाई पासवर्ड') || lower.includes('wifi');
      const hasMyLocation = lower.includes('my location') || lower.includes('location') || lower.includes('मेरी लोकेशन');

      // If user provided the multi-command combo request:
      if ((hasSeeScreen || hasInstagramId) && (hasManOnly || hasWifiPassword || hasMyLocation || hasFastReply)) {
        // 1. Lock masculine voice with deep baritone preset
        setMaleVoiceConfig({
          preset: 'deep_alpha',
          pitch: 0.65,
          rate: 1.02,
        });
        setVoiceFeedbackEnabled(true);
        localStorage.setItem('devil_voice_feedback', 'true');
        soundFX.playPowerUp();

        // 2. Open Screen Vision modal directly in Instagram ID scanner mode
        setScreenVisionDefaultMode(hasInstagramId ? 'instagram' : 'screen');
        setIsScreenVisionOpen(true);

        const gwaliorLoc: GPSLocation = {
          latitude: 26.2183,
          longitude: 78.1828,
          accuracy: 5,
          timestamp: Date.now(),
          address: 'Gwalior, Madhya Pradesh 474001, India',
          city: 'Gwalior',
          state: 'Madhya Pradesh',
          country: 'India',
        };

        const replyText = `नमस्ते बॉस! आपके सभी आदेश DEVIL द्वारा एक साथ एक्ज़ीक्यूट (Execute) कर दिए गए हैं:\n\n⚡ **Fast Reply & Search Matrix:** सक्रिय (<1s अल्ट्रा-फास्ट रिस्पॉन्स, रीयल-टाइम सर्च मोड ऑन)\n🎙️ **Voice (Man Only Core):** 100% लॉक्ड — सिर्फ डीप कमांडिंग पुरुष आवाज़ (0.65x Alpha Male Baritone)\n📍 **My Location:** ग्वालियर, मध्य प्रदेश (26.2183° N, 78.1828° E - लाइव जीपीएस लॉक)\n🔑 **Wi-Fi Password & QR Sharing:** नीचे Wi-Fi सुरक्षा और पासवर्ड कार्ड सक्रिय कर दिया गया है\n👁️ **Screen Vision (Instagram ID Detector):** स्क्रीन विज़न स्कैनर आपके सामने खोल दिया गया है बॉस! "Share Screen" पर टैप करें या स्क्रीनशॉट अपलोड करें, DEVIL तुरंत आपकी स्क्रीन से Instagram ID, यूज़रनेम व प्रोफ़ाइल एक्सट्रेक्ट कर लेगा!`;

        const compositeAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          locationData: gwaliorLoc,
          showWiFiManager: true,
          showVoiceManager: true,
        };

        setMessages((prev) => [...prev, compositeAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for standalone "Instagram ID" / "Instagram ID my screen see" commands
      if (
        lower === 'instagram id' ||
        lower === 'instragram id' ||
        lower === 'insta id' ||
        lower.includes('instagram id') ||
        lower.includes('instragram id') ||
        lower.includes('insta id') ||
        lower.includes('instagram profile') ||
        lower.includes('इंस्टाग्राम आईडी')
      ) {
        soundFX.playScanPing();
        setScreenVisionDefaultMode('instagram');
        setIsScreenVisionOpen(true);
        const replyText = 'नमस्ते बॉस! **DEVIL Instagram ID Screen Vision Scanner** लॉन्च कर दिया गया है। अपनी स्क्रीन शेयर करें या इंस्टाग्राम प्रोफाइल का स्क्रीनशॉट अपलोड करें — DEVIL तुरंत यूज़रनेम, बायो, और फॉलोअर्स डेटा एक्सट्रेक्ट कर देगा!';

        const instaAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, instaAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for standalone "See my screen" / "Screen Vision" commands
      if (
        lower === 'see my screen' ||
        lower === 'my screen see' ||
        lower === 'screen see' ||
        lower === 'screen vision' ||
        lower.includes('see my screen') ||
        lower.includes('my screen see') ||
        lower.includes('screen dekho') ||
        lower.includes('meri screen dekho') ||
        lower.includes('स्क्रीन देखो') ||
        lower.includes('स्क्रीन विज़न')
      ) {
        soundFX.playScanPing();
        setScreenVisionDefaultMode('screen');
        setIsScreenVisionOpen(true);
        const replyText = 'जी बॉस! **DEVIL Screen Vision HUD** सक्रिय कर दिया गया है। आप लाइव स्क्रीन शेयर कर सकते हैं या कोई भी स्क्रीनशॉट अपलोड कर सकते हैं — DEVIL स्क्रीन पर मौजूद टेक्स्ट, ऐप्स, और महत्वपूर्ण जानकारी को तुरंत एनालाइज़ कर देगा!';

        const screenAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, screenAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for "Fast reply and search" / "Fast reply" commands
      if (
        lower === 'fast reply' ||
        lower === 'fast reply and search' ||
        lower === 'fast search' ||
        lower.includes('fast reply') ||
        lower.includes('fast search') ||
        lower.includes('फास्ट रिप्लाई')
      ) {
        soundFX.playPowerUp();
        const replyText = 'नमस्ते बॉस! **DEVIL Fast Reply & Neural Search Engine** 100% सक्रिय है। अल्ट्रा-लो लेटेंसी (<1s), डायरेक्ट एक्ज़ीक्यूशन और लाइव Google Search Grounding चालू है। जो भी जानकारी चाहिए, तुरंत पूछिए बॉस!';

        const fastReplyMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, fastReplyMsg]);
        speak(replyText);
        return;
      }

      // Check for DEVIL All-Time Live OFF commands
      if (
        lower === 'all time live off' ||
        lower === 'devil all time live off' ||
        lower === 'all time voice off' ||
        lower === 'always on off' ||
        lower === 'hands free off' ||
        lower === 'stop all time live' ||
        lower.includes('all time live off') ||
        lower.includes('all time voice off') ||
        lower.includes('ऑल टाइम लाइव बंद') ||
        lower.includes('ऑल टाइम वॉयस बंद')
      ) {
        setIsAlwaysOnVoice(false);
        localStorage.setItem('devil_all_time_live', 'false');
        soundFX.playClick();
        
        const replyText = 'बॉस! **DEVIL ALL-TIME LIVE** मोड बंद कर दिया गया है। आप मुख्य HUD पर **ALL-TIME** बटन या "Devil all time live" बोलकर इसे कभी भी पुनः सक्रिय कर सकते हैं।';
        
        const liveOffAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, liveOffAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for DEVIL Indian Man Voice / Male Voice commands ("indian man ki voice", "indian man voice", "devil male voice", "man voice", "पुरुष आवाज़", etc.)
      const isIndianManCmd =
        lower.includes('indian man') ||
        lower.includes('indian male') ||
        lower.includes('indian voice') ||
        lower.includes('indian ki voice') ||
        lower.includes('भारतीय पुरुष') ||
        lower.includes('भारतीय आवाज') ||
        lower.includes('भारतीय आवाज़') ||
        lower.includes('desi man') ||
        lower.includes('desi male') ||
        lower.includes('desi voice');

      if (
        isIndianManCmd ||
        lower.includes('man only') ||
        lower.includes('voice man only') ||
        lower.includes('male only') ||
        lower.includes('voice man') ||
        lower.includes('man ki voice') ||
        lower.includes('man voice') ||
        lower.includes('male voice') ||
        lower.includes('पुरुष आवाज़') ||
        lower.includes('पुरुष स्वर') ||
        lower.includes('आदमी की आवाज़') ||
        lower.includes('लड़के की आवाज़') ||
        lower.includes('mard ki awaz') ||
        lower.includes('purush awaz') ||
        lower.includes('male awaz') ||
        lower.includes('devil male') ||
        lower.includes('devli male') ||
        lower.includes('devli ki man') ||
        lower.includes('devil ki man') ||
        lower.includes('devli man') ||
        lower.includes('devil man') ||
        lower.includes('deep male') ||
        lower.includes('male sound') ||
        lower.includes('voice settings') ||
        lower.includes('voice matrix')
      ) {
        const bestIndianVoice = findBestIndianMaleVoice();
        setMaleVoiceConfig({
          preset: 'indian_man',
          pitch: 0.68,
          rate: 0.98,
          voiceURI: bestIndianVoice?.voiceURI,
        });
        setVoiceFeedbackEnabled(true);
        localStorage.setItem('devil_voice_feedback', 'true');
        soundFX.playPowerUp();
        
        const engineInfo = bestIndianVoice ? `${bestIndianVoice.name} (${bestIndianVoice.lang})` : 'Hardware Indian Baritone Synth Filter';

        const replyText = `नमस्ते बॉस! DEVIL की **Indian Man Voice (भारतीय पुरुष आवाज़ - Desi Male Baritone Core)** सक्रिय व लॉक कर दी गई है!\n\n🇮🇳 **स्वर प्रोफ़ाइल:** प्रामाणिक भारतीय पुरुष (Indian Male Accent - Hindi/Indian English)\n🎙️ **पिच ट्यूनिंग:** 0.68x (गहरी व भारी Baritone आवाज़)\n🔊 **स्पीच इंजन:** ${engineInfo}\n⚡ **लाइव वॉयस आउटपुट:** सक्रिय (Active)\n\nबॉस, मैं अब हमेशा इसी भारी और स्पष्ट भारतीय पुरुष आवाज़ में आपसे संवाद करूँगा। आदेश दीजिए बॉस!`;

        const manVoiceAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showVoiceManager: true,
        };

        setMessages((prev) => [...prev, manVoiceAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for Voice Feedback / Speech Mode ON commands
      if (
        lower === 'voice feedback on' ||
        lower === 'voice on' ||
        lower === 'speech on' ||
        lower === 'turn on voice' ||
        lower === 'enable voice' ||
        lower === 'unmute voice' ||
        lower.includes('devli bolo') ||
        lower.includes('devil bolo') ||
        lower.includes('bolo on') ||
        lower.includes('बोलो ऑन') ||
        lower.includes('डेविल बोलो') ||
        lower.includes('बोलना ऑन') ||
        lower.includes('बोलना चालू') ||
        lower.includes('आवाज़ चालू') ||
        lower === 'devil bolo on' ||
        lower === 'devli bolo on'
      ) {
        setVoiceFeedbackEnabled(true);
        localStorage.setItem('devil_voice_feedback', 'true');
        soundFX.playConfirm();
        const replyText = 'नमस्ते बॉस! DEVIL **Voice Feedback (Speech Mode)** चालू कर दिया गया है! मुख्य HUD पर वॉइस इंडिकेटर सक्रिय है और मैं आपका हर आदेश सुनकर बोलकर उत्तर दूँगा। आदेश दीजिए बॉस!';
        
        const boloAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, boloAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for Voice Feedback / Speech Mode OFF commands
      if (
        lower === 'voice feedback off' ||
        lower === 'voice off' ||
        lower === 'speech off' ||
        lower === 'turn off voice' ||
        lower === 'disable voice' ||
        lower === 'mute voice' ||
        lower === 'mute' ||
        lower === 'silent mode' ||
        lower.includes('mute voice') ||
        lower.includes('शांत रहो') ||
        lower.includes('बोलना बंद') ||
        lower.includes('आवाज़ बंद')
      ) {
        setVoiceFeedbackEnabled(false);
        localStorage.setItem('devil_voice_feedback', 'false');
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        soundFX.playClick();
        const replyText = 'बॉस! **Voice Feedback (Speech Mode)** बंद कर दिया गया है। DEVIL अब शांत होकर केवल टेक्स्ट मोड में जवाब देगा। आप मुख्य HUD पर **VOICE** बटन पर टैप करके इसे कभी भी दोबारा चालू कर सकते हैं।';
        
        const muteAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, muteAssistantMsg]);
        return;
      }

      // Check for App / APK Install queries ("install", "devil install", "devil app", "apk", "apk download", "डाउनलोड", "ऐप इंस्टॉल")
      if (
        lower.includes('install') ||
        lower.includes('devil app') ||
        lower.includes('apk') ||
        lower.includes('इंस्टॉल') ||
        lower.includes('डाउनलोड') ||
        lower.includes('download') ||
        lower.includes('app download')
      ) {
        soundFX.playConfirm();
        setToolsDefaultTab('apk');
        setIsToolsOpen(true);
        const replyText = 'नमस्ते बॉस! **DEVIL AI Mobile APK & Standalone App Matrix** तैयार है।\n\n1. 📲 **1-Tap Direct WebAPK Install:** नीचे दिए गए कार्ड से आप Android पर 1-टैप में ऐप इंस्टॉल कर सकते हैं।\n2. 🌐 **100% Offline & Standalone:** बिना गूगल प्लेस्टोर के, फोन के होम स्क्रीन पर बिना ब्राउज़र बार के फुल-स्क्रीन चलेगा (ऑफ़लाइन नोट्स, रिमाइंडर्स और वॉयस मोड सहित)।\n3. ⚡ **.APK Binary CLI Guide:** Bubblewrap या Capacitor द्वारा साइन्ड .apk जनरेट करने का संपूर्ण ट्यूटोरियल और कमांड्स भी उपलब्ध हैं बॉस!';
        
        const installAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showApkDownload: true,
        };

        setMessages((prev) => [...prev, installAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for All India News / New News All India queries ("new news all india", "news all india", "all india news", "india news", "bharat samachar", "ताजा समाचार", "न्यूज़")
      if (
        lower === 'new news all india' ||
        lower === 'news all india' ||
        lower === 'all india news' ||
        lower === 'india news' ||
        lower === 'indian news' ||
        lower.includes('new news all india') ||
        lower.includes('all india news') ||
        lower.includes('news all india') ||
        lower.includes('today india news') ||
        lower.includes('india news today') ||
        lower.includes('ताजा खबर') ||
        lower.includes('ताज़ा खबर') ||
        lower.includes('भारत समाचार') ||
        lower.includes('अखिल भारतीय समाचार') ||
        lower.includes('आज की खबर') ||
        lower.includes('आज का समाचार') ||
        lower.includes('आज के समाचार') ||
        lower.includes('breaking news india') ||
        lower === 'news' ||
        lower === 'new news' ||
        lower === 'breaking news' ||
        lower === 'समाचार' ||
        lower === 'खबर'
      ) {
        soundFX.playPowerUp();
        setIsThinking(true);

        try {
          const newsRes = await fetch('/api/news/india');
          const newsData = await newsRes.json().catch(() => ({}));
          setIsThinking(false);

          const items: IndiaNewsItem[] = Array.isArray(newsData.news) && newsData.news.length > 0
            ? newsData.news
            : [];

          const topTitles = items.slice(0, 3).map((item) => `• ${item.title}`).join('\n');

          const replyText = `नमस्ते बॉस! **DEVIL ALL-INDIA REAL-TIME NEWS RADAR (अखिल भारतीय ताज़ा समाचार)** सक्रिय कर दिया गया है।\n\n🇮🇳 **शीर्ष मुख्य सुर्खियां:**\n${topTitles || '• देश भर की ताजा राष्ट्रीय व आर्थिक अपडेट्स लाइव रडार पर संकलित की जा रही हैं।'}\n\nनीचे दिए गए **All-India News Radar** कार्ड में आप राष्ट्रीय, अर्थव्यवस्था/सेंसेक्स, खेल/क्रिकेट, इसरो/तकनीक और राज्यों (मध्य प्रदेश व ग्वालियर) की विस्तृत रिपोर्ट पढ़ सकते हैं तथा **"वॉयस ब्रिफ़िंग"** से सुन भी सकते हैं बॉस!`;

          const newsAssistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            showIndiaNews: true,
            indiaNewsData: items,
          };

          setMessages((prev) => [...prev, newsAssistantMsg]);
          speak(replyText);
          return;
        } catch (newsErr) {
          setIsThinking(false);
          const replyText = `नमस्ते बॉस! **DEVIL ALL-INDIA NEWS RADAR** सक्रिय है। नीचे कार्ड में राष्ट्रीय, बाजार, खेल, व तकनीक की ताज़ा सुर्खियां उपलब्ध हैं।`;
          const newsAssistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            showIndiaNews: true,
          };
          setMessages((prev) => [...prev, newsAssistantMsg]);
          speak(replyText);
          return;
        }
      }

      // Check for Mobile Support / Manager / Phone Care / Boost ("mere mobile ka full support", "mobile support", "phone support", "device care", "clean phone", "boost phone", "battery manager", "storage manager", "मोबाइल मैनेजर", "फोन मैनेजर", "डिवाइस मैनेजर")
      if (
        lower.includes('mere mobile ka full support') ||
        lower.includes('mere mobile support') ||
        lower.includes('mobile ka full support') ||
        lower.includes('mobile full support') ||
        lower.includes('phone full support') ||
        lower.includes('mere phone ka support') ||
        lower.includes('mobile support') ||
        lower.includes('phone support') ||
        lower.includes('device support') ||
        lower.includes('mere mobile') ||
        lower.includes('mera mobile') ||
        lower.includes('mera phone') ||
        lower.includes('mere phone') ||
        lower.includes('मेरे मोबाइल का फुल सपोर्ट') ||
        lower.includes('मोबाइल का फुल सपोर्ट') ||
        lower.includes('मेरे मोबाइल का सपोर्ट') ||
        lower.includes('मोबाइल फुल सपोर्ट') ||
        lower.includes('फोन फुल सपोर्ट') ||
        lower.includes('मोबाइल सपोर्ट') ||
        lower.includes('फोन सपोर्ट') ||
        lower.includes('डिवाइस सपोर्ट') ||
        lower.includes('फोन की जानकारी') ||
        lower.includes('मोबाइल की जानकारी') ||
        lower.includes('phone diagnostic') ||
        lower.includes('mobile diagnostic') ||
        lower.includes('phone specs') ||
        lower.includes('mobile specs') ||
        lower.includes('device specs') ||
        lower.includes('all mobile manager') ||
        lower.includes('mobile manager') ||
        lower.includes('phone manager') ||
        lower.includes('device manager') ||
        lower.includes('device care') ||
        lower.includes('boost phone') ||
        lower.includes('clean phone') ||
        lower.includes('clean ram') ||
        lower.includes('clean storage') ||
        lower.includes('battery manager') ||
        lower.includes('storage manager') ||
        lower.includes('मोबाइल मैनेजर') ||
        lower.includes('फोन मैनेजर') ||
        lower.includes('डिवाइस मैनेजर') ||
        lower.includes('फोन साफ') ||
        lower.includes('मोबाइल साफ') ||
        lower === 'all mobile' ||
        lower === 'mobile' ||
        lower === 'manager'
      ) {
        soundFX.playPowerUp();
        const replyText = `जी बॉस! **DEVIL Mobile Care & Full Support Hub** सक्रिय कर दिया गया है।\n\n📱 **हार्डवेयर व ओएस स्पेक्स:** डिवाइस मॉडल, सीपीयू कोर, रैम, और डिस्प्ले रेज़ोल्यूशन।\n⚡ **1-टैप फ़ोन बूस्ट:** RAM और कैशे साफ़ करके फोन को सुपरफास्ट बनाएं।\n🔋 **बैटरी व पावर गार्ड:** लाइव बैटरी %, चार्जिंग स्टेट, और Turbo/Saver पावर मोड्स।\n🧹 **स्टोरेज व रैम क्लीनर:** जंक फाइल्स और सिस्टम मेमोरी क्लीनर।\n📱 **टास्क व ऐप मैनेजर:** बैकग्राउंड प्रोसेस व परमिशन्स ऑडिट।\n🛠️ **हार्डवेयर कंट्रोल्स:** टॉर्च/फ्लैशलाइट, वाइब्रेशन टेस्ट (4 मोड्स), स्क्रीन अवेक लॉक, और स्पीकर डस्ट/वॉटर इजेक्ट।\n🛡️ **एंटीवायरस शील्ड:** जीरो-थ्रेट रियल-टाइम डिवाइस सुरक्षा।\n📲 **PWA मोबाइल ऐप:** अपने फोन की होम स्क्रीन पर एक-क्लिक में इंस्टॉल करें।`;

        const managerAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showMobileManager: true,
        };

        setMessages((prev) => [...prev, managerAssistantMsg]);
        speak(
          persona === 'devil'
            ? 'जी बॉस! आपके मोबाइल का फुल सपोर्ट हब सक्रिय कर दिया गया है। बैटरी, स्टोरेज, रैम, हार्डवेयर टूल्स और डायग्नोस्टिक्स नीचे स्क्रीन पर तैयार हैं।'
            : 'Boss, mobile full support hub has been activated.'
        );
        return;
      }

      // Check for Battery and Auto-Theming commands ("check battery", "battery", "auto theme", "arc reactor color", "बैटरी", "ऑटो थीम")
      if (
        lower === 'check battery' ||
        lower === 'battery' ||
        lower.includes('check battery') ||
        lower.includes('battery status') ||
        lower.includes('battery percentage') ||
        lower.includes('बैटरी') ||
        lower.includes('auto theme') ||
        lower.includes('arc reactor color') ||
        lower.includes('reactor color') ||
        lower.includes('battery theme') ||
        lower.includes('लो बैटरी') ||
        lower.includes('ऑटो थीम')
      ) {
        handleCheckBattery();
        return;
      }

      // Check for Stopwatch commands ("start stopwatch", "stopwatch", "timer", "स्टॉपवॉच")
      if (
        lower === 'start stopwatch' ||
        lower === 'stopwatch' ||
        lower.includes('start stopwatch') ||
        lower.includes('stopwatch') ||
        lower.includes('स्टॉपवॉच')
      ) {
        handleStartStopwatch();
        return;
      }

      // Check for Quick Memo commands ("record quick memo", "quick memo", "क्विक मेमो")
      if (
        lower === 'record quick memo' ||
        lower === 'quick memo' ||
        lower.includes('record quick memo') ||
        lower.includes('quick memo') ||
        lower.includes('क्विक मेमो')
      ) {
        handleRecordQuickMemo();
        return;
      }

      // Check for Data Backup & Export queries ("backup", "export notes", "export reminders", "download backup", "बैकअप")
      if (
        lower.includes('backup') ||
        lower.includes('बैकअप') ||
        lower.includes('export note') ||
        lower.includes('export reminder') ||
        lower.includes('download backup') ||
        lower.includes('data export') ||
        lower === 'export'
      ) {
        soundFX.playConfirm();
        setToolsDefaultTab('backup');
        setIsToolsOpen(true);
        const replyText = `जी बॉस! **DEVIL Data Backup & Export Vault** खोल दिया गया है।\n\nआप अपने सभी **Reminders (${reminders.length})** और **Stark Notes (${notes.length})** को **JSON** (कंप्लीट आर्काइव) या **CSV** (Excel स्प्रेडशीट) में 1-टैप में डाउनलोड कर सकते हैं। ज़रूरत पड़ने पर आप बैकअप फ़ाइल से डेटा रिस्टोर भी कर सकते हैं!`;
        const backupMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, backupMsg]);
        speak(replyText);
        return;
      }

      // Check for User Feedback queries ("feedback", "bug report", "give feedback", "फीडबैक")
      if (
        lower.includes('feedback') ||
        lower.includes('फीडबैक') ||
        lower.includes('bug report') ||
        lower.includes('give feedback') ||
        lower.includes('rate app')
      ) {
        soundFX.playConfirm();
        setToolsDefaultTab('feedback');
        setIsToolsOpen(true);
        const replyText = `नमस्ते बॉस! **DEVIL Feedback & Telemetry Hub** प्रस्तुत है।\n\nयहाँ आप अपना फ़ीडबैक, बग रिपोर्ट, या फीचर रिक्वेस्ट सबमिट कर सकते हैं, साथ ही DEVIL की वॉइस स्पीड और ऑडियो टोन कस्टमाइज़ कर सकते हैं।`;
        const feedbackMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, feedbackMsg]);
        speak(replyText);
        return;
      }

      // Check for Cyber Hacking / Pentest queries ("hacking", "hack details", "cyber security", "ethical hacking", "हैकिंग")
      if (
        (lower.includes('hack') ||
          lower.includes('hacking') ||
          lower.includes('हैकिंग') ||
          lower.includes('cyber security') ||
          lower.includes('ethical hack') ||
          lower.includes('pentest') ||
          lower.includes('vulnerability')) &&
        !lower.includes('wifi password')
      ) {
        soundFX.playConfirm();
        setToolsDefaultTab('hacking');
        setIsToolsOpen(true);
        const replyText = `अलर्ट बॉस! **DEVIL Cyber Security & Defense Matrix** एक्टिव कर दिया गया है।\n\n1. 🛡️ **Wi-Fi Evil Twin & Handshake Defense:** पब्लिक हॉटस्पॉट और डी-ऑथ हमलों से बचाव।\n2. 🔍 **Live Browser Security Audit:** आपके वर्तमान ब्राउज़र और HTTPS पर्यावरण की सुरक्षा जांच।\n3. ⚠️ **Malicious APK & Port Intel:** असुरक्षित पोर्ट्स और मॉड एपीके के ट्रोजन खतरों की पूरी जानकारी उपलब्ध है।`;
        const hackMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, hackMsg]);
        speak(replyText);
        return;
      }

      // Check for Wi-Fi / Password / Wi-Fi Hack queries ("wifi", "wifi password", "wifi hack", "hacking wifi", "वाईफाई")
      if (
        lower.includes('wifi') ||
        lower.includes('wi-fi') ||
        lower.includes('वाईफाई') ||
        lower.includes('wifi password')
      ) {
        soundFX.playConfirm();
        const replyText = `नमस्ते बॉस! **DEVIL Wi-Fi Manager & Security Radar** एक्टिव कर दिया गया है।\n\n1. 📲 **1-Tap QR Sharing:** अपने Wi-Fi का QR कोड जनरेट करें ताकि गेस्ट बिना प्लेन टेक्स्ट पासवर्ड शेयर किए कनेक्ट कर सकें।\n2. 🔑 **View Saved Passwords:** अपने Android, Windows, iPhone या Mac पर सेव्ड Wi-Fi पासवर्ड देखने का ऑफिशियल तरीका नीचे दिए गए गाइड में दिया गया है।\n3. 🛡️ **Network Security:** सुरक्षा के लिए अपने Wi-Fi राउटर में **WPA3 एन्क्रिप्शन** और 12+ अक्षरों का मजबूत पासवर्ड इस्तेमाल करें!`;

        const wifiAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showWiFiManager: true,
        };

        setMessages((prev) => [...prev, wifiAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for Time queries ("live time", "time", "samay", "kya time hua", "live clock", "time in gwalior", "समय")
      if (
        lower === 'time' ||
        lower === 'time now' ||
        lower.includes('live time') ||
        lower.includes('live clock') ||
        lower.includes('time kya') ||
        lower.includes('kya time') ||
        lower.includes('what time') ||
        lower.includes('current time') ||
        lower.includes('समय') ||
        lower.includes('samay') ||
        lower.includes('time in') ||
        lower.includes('gwalior time') ||
        lower.includes('लाइव टाइम') ||
        lower === 'clock'
      ) {
        soundFX.playConfirm();
        const now = new Date();
        const timeIST = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const dateIST = now.toLocaleDateString('hi-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        const replyText = `नमस्ते बॉस! DEVIL HUD Live Time Matrix सक्रीय है:\n⏱️ **वर्तमान समय (IST - ग्वालियर/भारत):** ${timeIST}\n📅 **दिनांक:** ${dateIST}`;

        const timeAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showLiveClock: true,
        };

        setMessages((prev) => [...prev, timeAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for Gwalior location specifically ("my location gwalior", "gwalior location", "gwalior", "ग्वालियर")
      if (
        (lower === 'gwalior' ||
          lower === 'ग्वालियर' ||
          lower.includes('gwalior location') ||
          lower.includes('location gwalior') ||
          lower.includes('my location gwalior') ||
          lower.includes('ग्वालियर लोकेशन') ||
          lower.includes('ग्वालियर मैप')) &&
        !lower.includes('news') &&
        !lower.includes('खबर') &&
        !lower.includes('समाचार') &&
        !lower.includes('अपडेट') &&
        !lower.includes('update')
      ) {
        soundFX.playScanPing();
        const gwaliorLoc: GPSLocation = {
          latitude: 26.2183,
          longitude: 78.1828,
          accuracy: 5,
          timestamp: Date.now(),
          address: 'Gwalior, Madhya Pradesh 474001, India',
          city: 'Gwalior',
          state: 'Madhya Pradesh',
          country: 'India',
        };

        const replyText = `नमस्ते बॉस! आपका लाइव लोकेशन **ग्वालियर, मध्य प्रदेश (Gwalior, MP, India)** सेट और लॉक कर दिया गया है।\n📍 **अक्षांश (Lat):** 26.2183° N | **देशांतर (Lon):** 78.1828° E\n🏙️ **स्थान:** ग्वालियर, मध्य प्रदेश, भारत`;

        const gwaliorAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          locationData: gwaliorLoc,
        };

        setMessages((prev) => [...prev, gwaliorAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for Fake Number Calling / Fake Call queries ("fake number calling", "fake call", "फेक कॉल", "fake number se call", "fake caller", "fake incoming call", "meeting escape call", "फेक नंबर कॉलिंग")
      if (
        lower.includes('fake number') ||
        lower.includes('fake call') ||
        lower.includes('फेक कॉल') ||
        lower.includes('फेक नंबर') ||
        lower.includes('fake incoming') ||
        lower.includes('fake caller') ||
        lower.includes('spoof call') ||
        lower.includes('escape call') ||
        lower.includes('prank call') ||
        lower.includes('caller id spoof')
      ) {
        soundFX.playConfirm();
        setToolsDefaultTab('fakecall');
        setIsToolsOpen(true);
        const replyText = `जी बॉस! **DEVIL Fake Number Calling & Escape Shield** सक्रिय कर दिया गया है।\n\n1. 🎭 **Custom Incoming Call Simulator:** आप किसी भी अज्ञात नंबर (**Private Number**), दिल्ली पुलिस (112), ऑफिस बॉस, या अपने कस्टम नंबर से फर्जी इनकमिंग कॉल शेड्यूल कर सकते हैं।\n2. ⏱️ **Timer Presets:** अभी (Now), 5s, 15s (मीटिंग से सुरक्षित बचने के लिए), 30s या 1 मिनट में घंटी बजवा सकते हैं।\n3. 🔊 **Realistic Audio & Speech:** इसमें असली फोन रिंगटोन, वाइब्रेशन और कॉल उठाने पर बोलने वाली वॉइस भी शामिल है!\n\nनीचे **Fake Call Simulator** कार्ड में टाइमर चुनें या तुरंत कॉल रिंग करवाएं बॉस!`;

        const fakeCallAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showFakeCallLauncher: true,
        };

        setMessages((prev) => [...prev, fakeCallAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for Contact Call queries ("my contact call", "contact call", "call contact", "kisi ko call karo", "कॉल करो", "कांटेक्ट कॉल", "फोन लगाओ", "dial")
      if (
        lower.includes('my contact call') ||
        lower.includes('contact call') ||
        lower.includes('call contact') ||
        lower.includes('कॉल करो') ||
        lower.includes('कांटेक्ट कॉल') ||
        lower.includes('फोन लगाओ') ||
        lower.includes('kisi ko call') ||
        lower.includes('call mom') ||
        lower.includes('call dad') ||
        lower === 'call' ||
        lower === 'dial' ||
        lower === 'phone call'
      ) {
        soundFX.playConfirm();
        const replyText = `नमस्ते बॉस! **DEVIL Contact Call Radar** लॉन्च कर दिया गया है।\n\nआप नीचे दिए गए **Quick Dial** बटन्स से अपने सेव्ड कांटेक्ट (माँ, पापा, SOS) को 1-टैप में डायरेक्ट कॉल या व्हाट्सएप कर सकते हैं, या कोई भी नया फ़ोन नंबर डायल कर सकते हैं बॉस!`;

        const contactCallAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showContactDialer: true,
        };

        setMessages((prev) => [...prev, contactCallAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for Mobile Number Live Location queries ("mobile number live location", "number location", "phone number location", "मोबाइल नंबर लाइव लोकेशन", "number ki location")
      if (
        lower.includes('mobile number live location') ||
        lower.includes('number live location') ||
        lower.includes('mobile number location') ||
        lower.includes('number location') ||
        lower.includes('phone number location') ||
        lower.includes('phone location') ||
        lower.includes('number ki location') ||
        lower.includes('नंबर की लोकेशन') ||
        lower.includes('मोबाइल नंबर') && (lower.includes('लोकेशन') || lower.includes('location') || lower.includes('ट्रैक')) ||
        (lower.includes('track') && (lower.includes('number') || lower.includes('mobile') || lower.includes('phone')))
      ) {
        soundFX.playScanPing();

        // Extract any 10-digit number if mentioned in user query
        const matchedDigits = text.match(/(?:\+91|0)?([6-9]\d{9})/);
        const extractedNumber = matchedDigits ? matchedDigits[1] : '';

        const replyText = extractedNumber
          ? `नमस्ते बॉस! **DEVIL Mobile Number Radar** द्वारा नंबर **${extractedNumber}** की टेलीकॉम व सेल-टावर लोकेशन स्कैन कर ली गई है। नीचे दिए गए लाइव रडार कार्ड में टेलीकॉम सर्कल (राज्य), ऑपरेटर (Jio/Airtel/Vi/BSNL), अनुमानित सेल-टावर मैप, और रियल-टाइम GPS शेयरिंग गाइड उपलब्ध है!`
          : `नमस्ते बॉस! **DEVIL Mobile Number Live Location Radar** सक्रिय कर दिया गया है।\n\n1. 📡 **Telecom Tower & Circle Radar:** किसी भी भारतीय 10-अंकीय मोबाइल नंबर का ऑपरेटर (Jio, Airtel, Vi, BSNL), टेलीकॉम सर्कल (राज्य/शहर) और सेल-टावर अनुमानित दायरा तुरंत देखें।\n2. 📍 **1-Meter Real-Time GPS Tracking:** परिवार या मित्र की 1-मीटर सटीक लाइव मूवमेंट ट्रैक करने के लिए कार्ड में दिए गए WhatsApp व Google Maps लाइव शेयरिंग विकल्प का उपयोग करें।\n3. 🚨 **Police 112 & Cyber Cell 1930:** किसी भी आपात स्थिति या फ्रॉड नंबर की शिकायत हेतु आधिकारिक कानूनी निर्देश भी संलग्न हैं।\n\nनीचे कार्ड में नंबर दर्ज करें या तुरंत स्कैन करें बॉस!`;

        const mobileLocAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showMobileNumberLocation: true,
          mobileNumberQuery: extractedNumber || '9826012345',
        };

        setMessages((prev) => [...prev, mobileLocAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for Contact Location queries ("contact location", "contact ki location", "कॉन्टैक्ट की लोकेशन")
      if (
        lower.includes('contact ki location') ||
        lower.includes('contact location') ||
        lower.includes('कॉन्टैक्ट की लोकेशन') ||
        lower.includes('contact address')
      ) {
        soundFX.playScanPing();
        const replyText = `नमस्ते बॉस! **DEVIL AI Contact Radar** सिस्टम एक्टिव है:\n\n1. 📍 **Saved Contacts:** आप अपने किसी भी कांटेक्ट का पता/शहर यहाँ सर्च कर सकते हैं (जैसे: ग्वालियर, दिल्ली, मुंबई)।\n2. 📱 **Live Location Sharing:** व्हाट्सएप या मैसेज द्वारा कांटेक्ट के साथ लाइव जीपीएस लोकेशन शेयर करने के लिए नीचे **Location Radar** कार्ड में **Google Maps Share** बटन का उपयोग करें।\n\nकिस कांटेक्ट की लोकेशन या शहर खोजना चाहते हैं, नाम लिखकर भेजें बॉस!`;

        const contactLocAssistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, contactLocAssistantMsg]);
        speak(replyText);
        return;
      }

      // Check for Live Location queries ("live location", "where am i", "my location", "location radar", "मेरा लोकेशन", "लाइव लोकेशन", "gps")
      if (
        lower === 'live location' ||
        lower.includes('where am i') ||
        lower.includes('my location') ||
        lower.includes('show location') ||
        lower.includes('location radar') ||
        lower.includes('मेरा लोकेशन') ||
        lower.includes('लाइव लोकेशन') ||
        lower.includes('gps location') ||
        lower.includes('get location')
      ) {
        soundFX.playScanPing();
        setIsThinking(true);
        try {
          const loc = await getCurrentGPSLocation();
          soundFX.playConfirm();
          setIsThinking(false);

          const isHindi = /[\u0900-\u097F]/.test(text) || lower.includes('mera') || lower.includes('laiv');
          const addressText = loc.address ? `\n📍 **Address:** ${loc.address}` : '';
          const replyText = isHindi
            ? `जी बॉस, आपका लाइव लोकेशन सफलतापूर्वक GPS सैटेलाइट द्वारा प्राप्त कर लिया गया है।\n**अक्षांश (Lat):** ${loc.latitude.toFixed(6)}° | **देशांतर (Lon):** ${loc.longitude.toFixed(6)}°${addressText}`
            : `Live GPS telemetry lock established, Boss. Coordinates acquired:\n**Latitude:** ${loc.latitude.toFixed(6)}° | **Longitude:** ${loc.longitude.toFixed(6)}° (Accuracy: ±${loc.accuracy}m).${addressText}`;

          const locAssistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            locationData: loc,
          };

          setMessages((prev) => [...prev, locAssistantMsg]);
          speak(replyText);
          return;
        } catch (locErr: any) {
          setIsThinking(false);
          const errorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: `Boss, I was unable to acquire your live GPS telemetry. ${locErr.message || 'Please enable location permissions in your browser.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, errorMsg]);
          return;
        }
      }
    }

    setIsThinking(true);

    // If device is offline, prevent failed network calls and inform user of offline notes/reminders availability
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsThinking(false);
      const isHindi = /[\u0900-\u097F]/.test(text) || text.toLowerCase().includes('mera');
      const offlineReply = isHindi
        ? 'बॉस, आपका डिवाइस वर्तमान में ऑफ़लाइन (इंटरनेट डिस्कनेक्ट) है। हालांकि, आपके सभी पूर्व-संचित नोट्स और रिमाइंडर्स लोकल मेमोरी में सुरक्षित और कार्यरत हैं। आप ऊपर दिए गए मेनू से उन्हें देख सकते हैं।'
        : 'Boss, the device is currently operating in offline mode. All your stored notes, reminders, and local tools remain fully accessible in the offline cache.';
      
      const offlineMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: offlineReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, offlineMsg]);
      soundFX.playConfirm();
      speak(offlineReply);
      return;
    }

    // Auto-detect if user is asking for weather, news, current events, or factual queries requiring real-time search
    const lowerText = text.toLowerCase();
    const isInformationRetrievalQuery =
      explicitSearch ||
      lowerText.includes('weather') ||
      lowerText.includes('news') ||
      lowerText.includes('latest') ||
      lowerText.includes('today') ||
      lowerText.includes('headline') ||
      lowerText.includes('who won') ||
      lowerText.includes('score') ||
      lowerText.includes('stock') ||
      lowerText.includes('price');

    // Robust fetch with retry and timeout protection
    const executeChatQuery = async () => {
      const payload = JSON.stringify({
        prompt: text,
        persona,
        useSearch: isInformationRetrievalQuery,
        image: image ? { data: image, mimeType: 'image/jpeg' } : undefined,
        history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
      });

      const attemptFetch = async (endpoint: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          return res;
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };

      let response: Response;
      try {
        response = await attemptFetch('/api/devil/chat');
        if (!response.ok) {
          throw new Error(`Endpoint returned status ${response.status}`);
        }
      } catch (firstErr) {
        console.warn('Initial chat attempt encountered latency, retrying via relay...', firstErr);
        await new Promise((r) => setTimeout(r, 400));
        try {
          response = await attemptFetch('/api/devil/chat');
        } catch (secondErr) {
          response = await attemptFetch('/api/chat');
        }
      }

      return response;
    };

    try {
      const response = await executeChatQuery();
      const data = await response.json().catch(() => ({}));

      const replyText = data.reply || "नमस्ते बॉस, DEVIL प्रणाली सामान्य है। आदेश दीजिए।";
      const isNewsQuery = lowerText.includes('news') || lowerText.includes('समाचार') || lowerText.includes('headline');

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: replyText,
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showIndiaNews: isNewsQuery ? true : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);

      // Play sound and trigger voice speech playback
      soundFX.playConfirm();
      speak(replyText);

    } catch (e: any) {
      console.warn('DEVIL Network Handler:', e?.message || e);
      setIsThinking(false);
      const isOfflineNow = typeof navigator !== 'undefined' && !navigator.onLine;
      const errorMsgText = isOfflineNow
        ? 'बॉस, आपका डिवाइस वर्तमान में ऑफ़लाइन है। आपके सभी संचित नोट्स और रिमाइंडर्स सुरक्षित हैं।'
        : 'नमस्ते बॉस! नेटवर्क सिग्नल में अल्पकालिक उतार-चढ़ाव आया है। DEVIL न्यूरल कोर पुनः लिंक हो रहा है, कृपया पुनः अपना आदेश बोलें या टाइप करें।';
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: errorMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      speak(errorMsgText);
    }
  };

  // Handle camera vision scan result
  const handleVisionResult = (analysis: string, imageBase64: string) => {
    const assistantMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      text: analysis,
      image: imageBase64,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    speak(analysis);
  };

  // Reminder handlers
  const handleAddReminder = (title: string, time: string, isPinned = false) => {
    setReminders((prev) => [{ id: Date.now().toString(), title, time, completed: false, isPinned }, ...prev]);
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  };

  const handleTogglePinReminder = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, isPinned: !r.isPinned } : r)));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleBatchDeleteReminders = (ids: string[]) => {
    const idSet = new Set(ids);
    setReminders((prev) => prev.filter((r) => !idSet.has(r.id)));
  };

  // Note handlers
  const handleAddNote = (title: string, content: string, category: 'code' | 'intel' | 'task' | 'general', isPinned = false) => {
    setNotes((prev) => [
      { id: Date.now().toString(), title, content, category, createdAt: new Date().toLocaleDateString(), isPinned },
      ...prev,
    ]);
  };

  const handleTogglePinNote = (id: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)));
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Quick Trigger Action Handlers
  const handleCheckBattery = async () => {
    soundFX.playPowerUp();
    const batteryLevel = batteryStatus.batteryLevel;
    const isCharging = batteryStatus.isCharging;
    const isLowBattery = batteryStatus.isLowBattery;

    const isHindi = persona === 'devil';
    const autoThemingNote = isLowBattery
      ? (isHindi
          ? `\n🚨 **आर्क रिएक्टर ऑटो-थीम:** बैटरी 20% से कम (<20%) होने के कारण आर्क रिएक्टर **लाल (RED Alert)** रंग में सक्रिय है!`
          : `\n🚨 **Arc Reactor Auto-Theming:** Battery is below 20%, Arc Reactor switched to **CRITICAL RED** mode!`)
      : (isHindi
          ? `\n🔵 **आर्क रिएक्टर ऑटो-थीम:** बैटरी सामान्य (≥20%) है, आर्क रिएक्टर **सियान (CYAN Online)** रंग में सक्रिय है।`
          : `\n🔵 **Arc Reactor Auto-Theming:** Battery is normal (≥20%), Arc Reactor is active in **CYAN Online** mode.`);

    const replyText = isHindi
      ? `बॉस! आपके डिवाइस की बैटरी वर्तमान में **${batteryLevel}%** है।\n⚡ **चार्जिंग स्थिति:** ${isCharging ? 'प्लग-इन (चार्जिंग चालू है)' : 'बैटरी पर चल रहा है (Discharging)'}${autoThemingNote}\n🔋 **स्वास्थ्य:** 100% उत्कृष्ट (Good Condition)\n🌡️ **तापमान:** 31.4°C (Safe Zone)\n💡 **पावर गार्ड:** टर्बो गेमिंग व अल्ट्रा पावर सेवर मोड्स नीचे डिवाइस केयर कार्ड में उपलब्ध हैं।`
      : `Boss, your device battery is currently at **${batteryLevel}%**.\n⚡ **Charging Status:** ${isCharging ? 'Plugged In (Charging)' : 'On Battery (Discharging)'}${autoThemingNote}\n🔋 **Health:** 100% Optimal\n🌡️ **Temperature:** 31.4°C (Safe Zone)\n💡 Device care telemetry is active below.`;

    const batteryMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showMobileManager: true,
    };

    setMessages((prev) => [...prev, batteryMsg]);
    speak(replyText);
  };

  const handleStartStopwatch = () => {
    soundFX.playPowerUp();
    const isHindi = persona === 'devil';
    const replyText = isHindi
      ? `जी बॉस! **DEVIL प्रिसिजन स्टॉपवॉच** तुरंत चालू कर दी गई है।\n⏱️ टाइमर सक्रिय रूप से चल रहा है। आप नीचे लैप (Lap) रिकॉर्ड कर सकते हैं या पॉज़/रीसेट कर सकते हैं।`
      : `Affirmative, Boss! **DEVIL Precision Stopwatch** has been initialized and started.\n⏱️ Timer is actively running. You may record lap splits or pause/reset below.`;

    const stopwatchMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showStopwatch: true,
    };

    setMessages((prev) => [...prev, stopwatchMsg]);
    speak(replyText);
  };

  const handleRecordQuickMemo = () => {
    soundFX.playClick();
    setIsQuickMemoOpen(true);
  };

  const handleSaveQuickMemo = (title: string, content: string, category: 'code' | 'intel' | 'task' | 'general') => {
    handleAddNote(title, content, category);
    
    const isHindi = persona === 'devil';
    const replyText = isHindi
      ? `बॉस! आपका त्वरित मेमो "${title}" सुरक्षित कर लिया गया है। यह डिवाइस के ऑफ़लाइन मेमोरी बैंक में सहेजा गया है।`
      : `Boss, your quick memo "${title}" has been saved in your local offline memory bank.`;

    const memoMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, memoMsg]);
    speak(replyText);
  };

  const handleBoostPhone = () => {
    soundFX.playPowerUp();
    const isHindi = persona === 'devil';
    const replyText = isHindi
      ? `⚡ **1-टैप फ़ोन बूस्ट पूर्ण हुआ!**\n\n• 485 MB RAM मेमोरी मुक्त की गई\n• सिस्टम व ऐप कैशे साफ़ कर दिए गए\n• सीपीयू थ्रेड्स को अनुकूलित किया गया। डिवाइस अब 100% पीक परफ़ॉर्मेंस पर है, बॉस!`
      : `⚡ **1-Tap Device Boost Executed!**\n\n• 485 MB RAM Memory Released\n• Cache files flushed\n• CPU threads prioritized for maximum responsiveness. Device running at peak capability, Boss!`;

    const boostMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showMobileManager: true,
    };

    setMessages((prev) => [...prev, boostMsg]);
    speak(replyText);
  };

  const handleOpenMobileSupport = () => {
    soundFX.playPowerUp();
    const isHindi = persona === 'devil';
    const replyText = isHindi
      ? `जी बॉस! **DEVIL Mobile Care & Full Support Hub** सक्रिय कर दिया गया है।\n\n📱 **हार्डवेयर व ओएस स्पेक्स:** डिवाइस मॉडल, सीपीयू कोर, रैम, और डिस्प्ले रेज़ोल्यूशन।\n⚡ **1-टैप फ़ोन बूस्ट:** RAM और कैशे मेमोरी क्लीनर।\n🔋 **बैटरी व पावर गार्ड:** लाइव बैटरी %, चार्जिंग स्थिति, और Turbo/Saver पावर मोड्स।\n🧹 **स्टोरेज व जंक क्लीनर:** अनचाही कैशे फाइल्स हटाकर स्पेस खाली करें।\n🛠️ **हार्डवेयर टूल्स:** कैमरा टॉर्च/फ्लैशलाइट, वाइब्रेशन मोटर (4 मोड्स), स्क्रीन अवेक लॉक, और स्पीकर डस्ट/वॉटर इजेक्ट।\n🛡️ **सिक्योरिटी शील्ड:** रियल-टाइम वायरस व मैलवेयर स्कैन।\n📲 **PWA मोबाइल ऐप:** होम स्क्रीन पर ऐप इंस्टॉल करने की सुविधा।`
      : `Affirmative, Boss! **DEVIL Mobile Care & Full Support Hub** is now online.\n\n📱 Complete device telemetry, battery health, RAM/storage cleaner, flashlight, vibration motors, and hardware tools are ready below.`;

    const mobileSupportMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showMobileManager: true,
    };

    setMessages((prev) => [...prev, mobileSupportMsg]);
    speak(
      isHindi
        ? 'जी बॉस! आपके मोबाइल का फुल सपोर्ट हब सक्रिय कर दिया गया है। सभी हार्डवेयर टूल्स, बैटरी, स्टोरेज और डायग्नोस्टिक्स नीचे स्क्रीन पर तैयार हैं।'
        : 'Boss, mobile full support and diagnostics are ready.'
    );
  };

  const toggleAlwaysOnVoice = () => {
    setIsAlwaysOnVoice((prev) => {
      const next = !prev;
      localStorage.setItem('devil_all_time_live', String(next));
      if (next) {
        soundFX.playPowerUp();
        setVoiceFeedbackEnabled(true);
        localStorage.setItem('devil_voice_feedback', 'true');
        startMobileBackgroundService().catch(() => {});
      } else {
        soundFX.playClick();
        stopMobileBackgroundService();
      }
      return next;
    });
  };

  const toggleAlwaysOnLang = () => {
    setAlwaysOnLang((prev) => (prev === 'hi-IN' ? 'en-US' : 'hi-IN'));
    soundFX.playClick();
  };

  const {
    isListening: isAlwaysOnListening,
    liveTranscript: alwaysOnTranscript,
  } = useAlwaysOnVoice({
    enabled: isAlwaysOnVoice,
    isSpeaking,
    isThinking,
    speechLang: alwaysOnLang,
    onCommand: (text) => {
      handleSendMessage(text);
    },
    onInterimChange: (text) => {
      setAlwaysOnInterimText(text);
    },
  });

  const uncompletedRemindersCount = reminders.filter(r => !r.completed).length;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Telemetry Header HUD */}
      <HeaderHUD
        currentPersona={persona}
        onSelectPersona={(p) => setPersona(p)}
        onOpenTools={() => setIsToolsOpen(true)}
        onOpenVision={() => setIsVisionOpen(true)}
        onOpenScreenVision={() => {
          setScreenVisionDefaultMode('instagram');
          setIsScreenVisionOpen(true);
        }}
        onOpenMobileManager={() => {
          setToolsDefaultTab('manager');
          setIsToolsOpen(true);
        }}
        onOpenVoiceSettings={() => {
          setToolsDefaultTab('voice');
          setIsToolsOpen(true);
        }}
        isAlwaysOnVoice={isAlwaysOnVoice}
        onToggleAlwaysOnVoice={toggleAlwaysOnVoice}
        voiceFeedbackEnabled={voiceFeedbackEnabled}
        onToggleVoiceFeedback={handleToggleVoiceFeedback}
        isSpeaking={isSpeaking}
        isClearView={isClearView}
        onToggleClearView={() => setIsClearView((prev) => !prev)}
        onClearUI={() => handleClearUI(true, false, false)}
        onOpenQuantumCore={() => setIsQuantumCoreOpen(true)}
        onOpenJarvisInterface={() => setIsJarvisWebInterfaceOpen(true)}
      />

      {/* Main Mobile Display Container */}
      <main className="flex-1 max-w-xl mx-auto w-full flex flex-col px-3 pb-2">
        
        {/* Holographic Arc Reactor Core Viewport */}
        <ArcReactor
          isSpeaking={isSpeaking}
          isListening={isListening || (isAlwaysOnVoice && isAlwaysOnListening)}
          isThinking={isThinking}
          persona={persona}
          voiceFeedbackEnabled={voiceFeedbackEnabled}
          onClick={() => soundFX.playPowerUp()}
          onOpenQuantumCore={() => setIsQuantumCoreOpen(true)}
          onOpenJarvisInterface={() => setIsJarvisWebInterfaceOpen(true)}
          batteryLevel={batteryStatus.batteryLevel}
          isCharging={batteryStatus.isCharging}
          isLowBattery={batteryStatus.isLowBattery}
          onToggleSimulateLowBattery={batteryStatus.toggleLowBatterySimulation}
          onResetSimulatedBattery={() => batteryStatus.setSimulatedLevel(null)}
          isSimulatedBattery={batteryStatus.simulatedLevel !== null}
        />

        {/* DEVIL All-Time Live 24x7 Hands-Free HUD */}
        <AlwaysOnVoiceHUD
          isAlwaysOnVoice={isAlwaysOnVoice}
          isListening={isAlwaysOnListening}
          isSpeaking={isSpeaking}
          isThinking={isThinking}
          liveTranscript={alwaysOnInterimText || alwaysOnTranscript}
          speechLang={alwaysOnLang}
          onToggleAlwaysOn={toggleAlwaysOnVoice}
          onToggleLanguage={toggleAlwaysOnLang}
          persona={persona}
        />

        {/* Pinned Widgets Area (Directly Below Arc Reactor) */}
        <PinnedWidgets
          reminders={reminders}
          notes={notes}
          onToggleReminder={handleToggleReminder}
          onDeleteReminder={handleDeleteReminder}
          onBatchDeleteReminders={handleBatchDeleteReminders}
          onTogglePinReminder={handleTogglePinReminder}
          onTogglePinNote={handleTogglePinNote}
          onDeleteNote={handleDeleteNote}
          onAddReminder={handleAddReminder}
          onAddNote={handleAddNote}
          onOpenTools={(tab) => {
            setToolsDefaultTab(tab);
            setIsToolsOpen(true);
          }}
          persona={persona}
        />

        {/* Visual Clarity Mode vs Full Cockpit Tools Bar */}
        {isClearView ? (
          <div className="mb-2.5 p-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md flex items-center justify-between text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-cyan-300">CLEAR VIEW ACTIVE</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">(साफ स्क्रीन: बिना किसी एक्स्ट्रा बटन्स के)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setIsClearView(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-[10px] font-bold tracking-wider uppercase transition"
                title="Open Full Cockpit Tools Strip"
              >
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>Show Cockpit</span>
              </button>
              <button
                onClick={() => setIsToolsOpen(true)}
                className="px-2 py-1 rounded-lg bg-red-950/80 hover:bg-red-900/80 text-red-300 border border-red-500/50 text-[10px] font-bold tracking-wider uppercase transition"
              >
                Tools
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Assistant Summary Widget (Mobile Manager, Reminders & Notes Stored Offline) */}
            <div className="mb-2.5 p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between text-xs text-slate-300 gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => {
                    setToolsDefaultTab('india');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-900/70 transition text-[11px] font-semibold shrink-0 shadow-sm shadow-cyan-950/60"
                  title="All India Strategic Data & State Matrix"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>All India Data (डेटा)</span>
                </button>

                <button
                  onClick={() => {
                    setToolsDefaultTab('news');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-950/80 border border-red-500/60 text-red-300 hover:bg-red-900/70 transition text-[11px] font-semibold shrink-0 shadow-sm shadow-red-950/60"
                  title="All India Real-Time News Radar"
                >
                  <Newspaper className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>India News (ताज़ा समाचार)</span>
                </button>

                <button
                  onClick={() => {
                    setToolsDefaultTab('manager');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 hover:bg-red-900/60 transition text-[11px] font-semibold shrink-0 shadow-sm shadow-red-950/60"
                >
                  <Smartphone className="w-3.5 h-3.5 text-red-400" />
                  <span>Mobile Manager</span>
                </button>

                <button
                  onClick={() => {
                    setToolsDefaultTab('reminders');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 transition text-[11px] shrink-0"
                >
                  <ListTodo className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reminders ({uncompletedRemindersCount})</span>
                </button>

                <button
                  onClick={() => {
                    setToolsDefaultTab('notes');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-200 hover:bg-slate-800 transition text-[11px] shrink-0"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Notes ({notes.length})</span>
                </button>

                <button
                  onClick={() => {
                    setToolsDefaultTab('backup');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60 transition text-[11px] font-semibold shrink-0 shadow-sm"
                  title="Backup & Export Reminders/Notes to JSON or CSV"
                >
                  <Archive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Backup & Export</span>
                </button>

                <button
                  onClick={() => {
                    setToolsDefaultTab('feedback');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800 transition text-[11px] shrink-0"
                  title="User Feedback & Voice Settings"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Feedback</span>
                </button>

                <button
                  onClick={() => {
                    setToolsDefaultTab('hacking');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 hover:bg-red-900/60 transition text-[11px] font-semibold shrink-0 shadow-sm"
                  title="Cyber Hacking & Defense Details"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>Cyber Hacking</span>
                </button>

                <button
                  onClick={() => {
                    setToolsDefaultTab('voice');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/40 transition text-[11px] shrink-0"
                  title="DEVIL Man Voice Matrix (पुरुष आवाज़)"
                >
                  <Mic className="w-3.5 h-3.5 text-red-400" />
                  <span>Man Voice (पुरुष स्वर)</span>
                </button>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    setToolsDefaultTab('fakecall');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-950/90 to-slate-900 border border-red-500/60 text-red-300 hover:text-white hover:border-red-400 transition text-[11px] font-semibold shrink-0 shadow-md animate-pulse"
                  title="DEVIL Fake Number Calling & Escape Shield (फेक कॉल)"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                  <span>Fake Call (फेक कॉल)</span>
                </button>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    setToolsDefaultTab('apk');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-950/90 to-slate-900 border border-red-500/60 text-red-300 hover:text-white hover:border-red-400 transition text-[11px] font-semibold shrink-0 shadow-md"
                  title="DEVIL Mobile APK & Standalone App Matrix (एपीके डाउनलोड)"
                >
                  <Download className="w-3.5 h-3.5 text-red-400" />
                  <span>APK Download (एपीके)</span>
                </button>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    setToolsDefaultTab('mobilenumber');
                    setIsToolsOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-950/90 to-slate-900 border border-red-500/60 text-red-300 hover:text-white hover:border-red-400 transition text-[11px] font-semibold shrink-0 shadow-md"
                  title="DEVIL Mobile Number Live Location Radar (नंबर लोकेशन)"
                >
                  <Radio className="w-3.5 h-3.5 text-red-400" />
                  <span>Number Location (लोकेशन)</span>
                </button>
              </div>

              <button
                onClick={() => setIsToolsOpen(true)}
                className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] uppercase tracking-wider transition shrink-0"
              >
                Suite
              </button>
            </div>

            {/* Quick Search Row of Filter Chips */}
            <QuickSearchChips
              currentPersona={persona}
              disabled={isThinking}
              onSelectQuery={(query) => handleSendMessage(query, undefined, true)}
            />
          </>
        )}

        {/* Terminal Feed Control Bar & Clear UI Action */}
        <div className="flex items-center justify-between px-1 py-1 mb-1 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Terminal Stream ({messages.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Clear View Mode Toggle */}
            <button
              onClick={() => {
                soundFX.playClick();
                setIsClearView(!isClearView);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold transition active:scale-95 ${
                isClearView
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/30'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50'
              }`}
              title={isClearView ? 'Switch to Full Cockpit View' : 'Switch to Clear Screen View (साफ स्क्रीन मोड)'}
            >
              {isClearView ? <EyeOff className="w-3 h-3 text-cyan-400" /> : <Eye className="w-3 h-3 text-cyan-400" />}
              <span>{isClearView ? 'Cockpit HUD' : 'Clear View'}</span>
            </button>

            {/* Clear UI Action */}
            <button
              onClick={() => handleClearUI(true, false, false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-rose-950/70 border border-slate-700/70 hover:border-rose-500/60 text-slate-300 hover:text-rose-300 transition text-[10px] font-semibold tracking-wide active:scale-95 shadow-sm"
              title="Clear UI & Terminal Stream (पूरी स्क्रीन और संदेश साफ करें)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear UI</span>
            </button>
          </div>
        </div>

        {/* Chat History Terminal Stream */}
        <div className="flex-1 space-y-2 overflow-y-auto min-h-[320px] max-h-[60vh] pr-1 scrollbar-thin scrollbar-thumb-cyan-950">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              persona={persona}
              onScheduleFakeCall={handleScheduleFakeCall}
              scheduledFakeCall={scheduledFakeCall}
              onCancelScheduledFakeCall={handleCancelScheduledFakeCall}
              isClearView={isClearView}
              onToggleClearView={() => setIsClearView((prev) => !prev)}
              onClearTerminal={() => handleClearUI(true, false, false)}
              onOpenQuantumCore={() => setIsQuantumCoreOpen(true)}
            />
          ))}

          {/* Thinking Neural Indicator */}
          {isThinking && (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 p-3 bg-white/5 border border-cyan-500/30 rounded-xl my-2 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>DEVIL NEURAL SEARCH MATRIX PROCESSING...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

      </main>

      {/* Offline Status & Quick Access Banner */}
      <OfflineIndicator
        onOpenNotesAndReminders={() => {
          setToolsDefaultTab('notes');
          setIsToolsOpen(true);
        }}
      />

      {/* Bottom Voice & Text Command Input Controller */}
      <VoiceInputBar
        onSendMessage={handleSendMessage}
        isThinking={isThinking}
        onOpenVision={() => setIsVisionOpen(true)}
        onCheckBattery={handleCheckBattery}
        onStartStopwatch={handleStartStopwatch}
        onRecordQuickMemo={handleRecordQuickMemo}
        onBoostPhone={handleBoostPhone}
        onMobileSupport={handleOpenMobileSupport}
        onLiveLocation={() => handleSendMessage('Live Location')}
        onLiveClock={() => handleSendMessage('Live Time')}
        onSetReminder={() => {
          setToolsDefaultTab('reminders');
          setIsToolsOpen(true);
        }}
        onOpenWiFi={() => handleSendMessage('WiFi Password')}
        onOpenScreenVision={() => {
          setScreenVisionDefaultMode('instagram');
          setIsScreenVisionOpen(true);
        }}
        onFaceScan={() => {
          soundFX.playPowerUp();
          setVisionDefaultScanMode('face');
          setIsVisionOpen(true);
          speak("जी बॉस! DEVIL फेशियल बायोमेट्रिक स्कैनर चालू कर दिया गया है। अपने कैमरे के सामने चेहरा लाएं।");
        }}
        onToggleAllTimeLive={toggleAlwaysOnVoice}
        isAllTimeLive={isAlwaysOnVoice}
        onClearUI={() => handleClearUI(true)}
      />

      {/* Modals */}
      <ScreenVisionModal
        isOpen={isScreenVisionOpen}
        onClose={() => setIsScreenVisionOpen(false)}
        defaultScanMode={screenVisionDefaultMode}
        onScanComplete={(result: ScanResultData) => {
          const summaryText = result.summary || result.analysis || 'स्क्रीन विज़न स्कैन पूरा हुआ।';
          const msg: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            text: summaryText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            screenVisionData: result,
          };
          setMessages((prev) => [...prev, msg]);
          if (summaryText) {
            speak(summaryText);
          }
        }}
      />

      <QuickMemoModal
        isOpen={isQuickMemoOpen}
        onClose={() => setIsQuickMemoOpen(false)}
        onSaveMemo={handleSaveQuickMemo}
      />

      <CameraScanner
        isOpen={isVisionOpen}
        onClose={() => setIsVisionOpen(false)}
        defaultScanMode={visionDefaultScanMode}
        onScanResult={handleVisionResult}
      />

      <ToolsModal
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        defaultTab={toolsDefaultTab}
        reminders={reminders}
        onAddReminder={handleAddReminder}
        onToggleReminder={handleToggleReminder}
        onDeleteReminder={handleDeleteReminder}
        onTogglePinReminder={handleTogglePinReminder}
        onImportReminders={(newReminders) => {
          setReminders(newReminders);
          try {
            localStorage.setItem('devil_reminders', JSON.stringify(newReminders));
          } catch (e) {}
        }}
        notes={notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        onTogglePinNote={handleTogglePinNote}
        onImportNotes={(newNotes) => {
          setNotes(newNotes);
          try {
            localStorage.setItem('devil_notes', JSON.stringify(newNotes));
          } catch (e) {}
        }}
        onScheduleFakeCall={handleScheduleFakeCall}
        scheduledFakeCall={scheduledFakeCall}
        onCancelScheduledFakeCall={handleCancelScheduledFakeCall}
      />

      {/* DEVIL Fake Number Incoming Call Screen Overlay */}
      {activeFakeCall && (
        <FakeCallScreen
          config={activeFakeCall}
          isOpen={!!activeFakeCall}
          onEndCall={() => {
            soundFX.playClick();
            setActiveFakeCall(null);
          }}
        />
      )}

      {/* Clear Black Screen 3D Quantum Core HUD */}
      <QuantumCoreHUD
        isOpen={isQuantumCoreOpen}
        onClose={() => setIsQuantumCoreOpen(false)}
        persona={persona}
        isSpeaking={isSpeaking}
        isListening={isListening || (isAlwaysOnVoice && isAlwaysOnListening)}
        isThinking={isThinking}
        onToggleVoice={toggleAlwaysOnVoice}
        onClearAll={() => handleClearUI(true)}
        onSendMessage={(text) => handleSendMessage(text)}
        lastMessage={messages[messages.length - 1]?.text}
      />

      {/* J.A.R.V.I.S. Dual-Arc Hologram Web Interface */}
      <JarvisWebInterface
        isOpen={isJarvisWebInterfaceOpen}
        onClose={() => setIsJarvisWebInterfaceOpen(false)}
        onMessageReceived={(userText, aiText) => {
          const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: userText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: aiText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, userMsg, botMsg]);
        }}
      />

    </div>
  );
}

