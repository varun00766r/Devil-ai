import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../lib/audio';
import { Mic, MicOff, Send, Globe, ImagePlus, Sparkles, Terminal, ShieldAlert, Languages, MapPin } from 'lucide-react';
import { QuickTriggerChips } from './QuickTriggerChips';

interface VoiceInputBarProps {
  onSendMessage: (text: string, image?: string, useSearch?: boolean) => void;
  isThinking: boolean;
  onOpenVision: () => void;
  onCheckBattery?: () => void;
  onStartStopwatch?: () => void;
  onRecordQuickMemo?: () => void;
  onBoostPhone?: () => void;
  onMobileSupport?: () => void;
  onLiveLocation?: () => void;
  onLiveClock?: () => void;
  onSetReminder?: () => void;
  onOpenWiFi?: () => void;
  onOpenScreenVision?: () => void;
  onFaceScan?: () => void;
  onToggleAllTimeLive?: () => void;
  isAllTimeLive?: boolean;
  onAllIndiaData?: () => void;
  onClearUI?: () => void;
}

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  onSendMessage,
  isThinking,
  onOpenVision,
  onCheckBattery,
  onStartStopwatch,
  onRecordQuickMemo,
  onBoostPhone,
  onMobileSupport,
  onLiveLocation,
  onLiveClock,
  onSetReminder,
  onOpenWiFi,
  onOpenScreenVision,
  onFaceScan,
  onToggleAllTimeLive,
  isAllTimeLive,
  onAllIndiaData,
  onClearUI,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [speechLang, setSpeechLang] = useState<'en-US' | 'hi-IN'>('hi-IN'); // Defaulting or offering Hindi capability
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for hands-free speech input & "Wake Word" listener
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current && isListening) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        const lower = transcript.toLowerCase();
        
        // Wake word detection ("Hey Devil", "Devil", "हे डेविल", "नमस्ते डेविल", "डेविल", "Hey Jarvis")
        if (
          wakeWordEnabled &&
          (lower.includes('hey devil') ||
            lower.includes('devil') ||
            lower.includes('हे डेविल') ||
            lower.includes('डेविल') ||
            lower.includes('नमस्ते डेविल') ||
            lower.includes('hey jarvis') ||
            lower.includes('jarvis') ||
            lower.includes('हे जार्विस') ||
            lower.includes('नमस्ते जार्विस'))
        ) {
          soundFX.playPowerUp();
        }

        setInputText(transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech Recognition error', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [wakeWordEnabled, speechLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. You can still type prompts or use camera vision!');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      soundFX.playClick();
    } else {
      try {
        recognitionRef.current.lang = speechLang;
        recognitionRef.current.start();
        setIsListening(true);
        soundFX.playPowerUp();
      } catch (e) {
        console.warn('Start recognition error', e);
      }
    }
  };

  const toggleLanguage = () => {
    soundFX.playClick();
    const newLang = speechLang === 'en-US' ? 'hi-IN' : 'en-US';
    setSpeechLang(newLang);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() && !selectedImage) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    soundFX.playConfirm();
    onSendMessage(inputText, selectedImage, useSearch);

    setInputText('');
    setSelectedImage(undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        soundFX.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const quickPrompts = [
    'Indian Man Voice',
    'See My Screen',
    'Instagram ID',
    'WiFi Password',
    'My Location',
    'DEVIL बोलो ऑन',
    'Live Time',
    'Contact Call',
    'नमस्ते DEVIL',
  ];

  return (
    <div className="sticky bottom-0 z-30 bg-slate-950/95 border-t border-cyan-900/50 p-2 backdrop-blur-md max-w-xl mx-auto w-full">
      
      {/* Quick-Trigger Floating Chips (Common tasks: Check Battery, Start Stopwatch, Record Quick Memo, etc.) */}
      <QuickTriggerChips
        onCheckBattery={onCheckBattery || (() => onSendMessage('Check Battery'))}
        onStartStopwatch={onStartStopwatch || (() => onSendMessage('Start Stopwatch'))}
        onRecordQuickMemo={onRecordQuickMemo || (() => onSendMessage('Record Quick Memo'))}
        onBoostPhone={onBoostPhone || (() => onSendMessage('Boost Phone'))}
        onMobileSupport={onMobileSupport || (() => onSendMessage('Mere mobile ka full support'))}
        onLiveLocation={onLiveLocation || (() => onSendMessage('My Location'))}
        onLiveClock={onLiveClock || (() => onSendMessage('Live Time'))}
        onSetReminder={onSetReminder || (() => onSendMessage('Set Reminder'))}
        onOpenWiFi={onOpenWiFi || (() => onSendMessage('WiFi Password'))}
        onSeeScreen={onOpenScreenVision || (() => onSendMessage('See My Screen'))}
        onFaceScan={onFaceScan || (() => onSendMessage('Face se details'))}
        onToggleAllTimeLive={onToggleAllTimeLive || (() => onSendMessage('Devil all time live'))}
        isAllTimeLive={isAllTimeLive}
        onAllIndiaData={onAllIndiaData || (() => onSendMessage('All india ka data and fast reply and background on'))}
        onClearUI={onClearUI || (() => onSendMessage('Clear UI'))}
      />

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 px-2 scrollbar-none text-[10px] font-mono">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              soundFX.playClick();
              onSendMessage(prompt, undefined, prompt.includes('News'));
            }}
            className="shrink-0 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition active:scale-95 flex items-center gap-1 text-[10px]"
          >
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Preview Attached Image if any */}
      {selectedImage && (
        <div className="relative mb-2 inline-block">
          <img src={selectedImage} alt="Attachment" className="w-16 h-16 object-cover rounded-lg border border-cyan-500" />
          <button
            onClick={() => setSelectedImage(undefined)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full text-xs flex items-center justify-center font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Input Control Bar */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-cyan-900/60 rounded-xl p-1.5 shadow-xl">
        
        {/* Google Search Grounding Toggle */}
        <button
          onClick={() => {
            soundFX.playClick();
            setUseSearch(!useSearch);
          }}
          className={`p-2 rounded-lg transition border ${
            useSearch
              ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/30'
              : 'bg-slate-950/50 border-slate-800 text-slate-500'
          }`}
          title={useSearch ? 'Live Web Search Active' : 'Enable Live Web Search'}
        >
          <Globe className="w-4 h-4" />
        </button>

        {/* File Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300 transition"
          title="Upload image for DEVIL analysis"
        >
          <ImagePlus className="w-4 h-4" />
        </button>

        {/* Text Area Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? (speechLang === 'hi-IN' ? "सुन रहा हूँ... बोलिए या टाइप कीजिए..." : "Listening... Speak or type prompt...") : "Ask DEVIL or give command..."}
          disabled={isThinking}
          className="flex-1 bg-transparent px-2 text-xs font-sans text-slate-100 placeholder-slate-500 focus:outline-none"
        />

        {/* Speech Language Switcher (HI / EN) */}
        <button
          onClick={toggleLanguage}
          className="px-2 py-1.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 hover:border-cyan-400 text-[10px] font-mono font-bold text-cyan-300 transition flex items-center gap-0.5"
          title={`Speech Recognition Language: ${speechLang === 'hi-IN' ? 'Hindi (हिंदी)' : 'English'}. Click to switch.`}
        >
          <Languages className="w-3.5 h-3.5 text-cyan-400" />
          <span>{speechLang === 'hi-IN' ? 'HI' : 'EN'}</span>
        </button>

        {/* Mic Voice Input Button */}
        <button
          onClick={toggleListening}
          className={`p-2 rounded-lg transition border ${
            isListening
              ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
              : 'bg-cyan-950 border-cyan-700 text-cyan-300 hover:bg-cyan-900'
          }`}
          title={isListening ? 'Stop Voice Input' : 'Start Voice Input'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Send Prompt Button */}
        <button
          onClick={handleSend}
          disabled={isThinking || (!inputText.trim() && !selectedImage)}
          className={`p-2 rounded-lg transition font-bold ${
            inputText.trim() || selectedImage
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
          title="Send to DEVIL"
        >
          <Send className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
