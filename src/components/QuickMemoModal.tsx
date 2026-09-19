import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../lib/audio';
import { FileText, Mic, MicOff, Check, X, Sparkles, Tag, Save } from 'lucide-react';

interface QuickMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMemo: (title: string, content: string, category: 'code' | 'intel' | 'task' | 'general') => void;
}

export const QuickMemoModal: React.FC<QuickMemoModalProps> = ({
  isOpen,
  onClose,
  onSaveMemo,
}) => {
  const [memoText, setMemoText] = useState('');
  const [memoTitle, setMemoTitle] = useState('');
  const [category, setCategory] = useState<'intel' | 'task' | 'code' | 'general'>('intel');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current && isRecording) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
      return;
    }

    // Initialize Web Speech API for Quick Voice Dictation
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Supports Hindi + English dictation

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setMemoText((prev) => {
            const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + transcript;
          });
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleRecording = () => {
    soundFX.playClick();
    if (!recognitionRef.current) return;
    if (isRecording) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const handleSave = () => {
    if (!memoText.trim()) return;
    soundFX.playConfirm();

    const title = memoTitle.trim() || memoText.trim().slice(0, 36) || 'Quick Voice Memo';
    onSaveMemo(title, memoText.trim(), category);

    setMemoText('');
    setMemoTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-950/95 border border-red-500/60 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-950 border-b border-red-500/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-950 border border-red-500/50 text-red-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-red-300 text-xs tracking-wider uppercase flex items-center gap-1.5">
                <span>RECORD QUICK MEMO</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-900/60 text-red-200 border border-red-500/30">
                  OFFLINE BANK
                </span>
              </div>
              <p className="text-[10px] text-slate-400">बोलकर या लिखकर त्वरित मेमो सुरक्षित करें</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          {/* Memo Title (Optional) */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Title / विषय (वैकल्पिक)
            </label>
            <input
              type="text"
              value={memoTitle}
              onChange={(e) => setMemoTitle(e.target.value)}
              placeholder="उदा. Project Strategy, Meeting Note..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Memo Content Textarea with Voice Record Button */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Memo Content / विचार या कार्य
              </label>

              {/* Voice Record Mic Trigger */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/40'
                    : 'bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60'
                }`}
                title="बोलकर डिक्टेट करें"
              >
                {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                <span>{isRecording ? 'डिक्टेशन जारी...' : 'बोलकर रिकॉर्ड करें'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="अपना मेमो यहाँ टाइप करें या ऊपर माइक पर टैप करके बोलें..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 resize-none font-sans"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-500" />
              <span>Category / श्रेणी</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'intel', label: 'Intel / गुप्त जानकारी' },
                { id: 'task', label: 'Task / कार्य' },
                { id: 'code', label: 'Code / कोड' },
                { id: 'general', label: 'General / सामान्य' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setCategory(cat.id as any);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                    category === cat.id
                      ? 'bg-red-950 border-red-500 text-red-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-end gap-2">
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
          >
            रद्द करें
          </button>

          <button
            onClick={handleSave}
            disabled={!memoText.trim()}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-lg ${
              memoText.trim()
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>सुरक्षित करें (Save Memo)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
