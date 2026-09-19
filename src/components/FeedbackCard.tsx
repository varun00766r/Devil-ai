import React, { useState, useEffect } from 'react';
import { soundFX } from '../lib/audio';
import { downloadJSON } from '../lib/exportUtils';
import {
  MessageSquare,
  Star,
  Send,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Cpu,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Clock,
  ThumbsUp,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  category: 'feature' | 'bug' | 'voice' | 'security' | 'general';
  rating: number;
  message: string;
  author: string;
  timestamp: string;
  systemTelemetry?: {
    platform: string;
    userAgent: string;
    screenResolution: string;
    isOnline: boolean;
  };
}

export const FeedbackCard: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem('devil_user_feedback');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [category, setCategory] = useState<'feature' | 'bug' | 'voice' | 'security' | 'general'>('feature');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('Tony Stark / Boss');
  const [includeTelemetry, setIncludeTelemetry] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Voice feedback setting from App.tsx ('devil_voice_feedback')
  const [voiceFeedbackOn, setVoiceFeedbackOn] = useState<boolean>(() => {
    return localStorage.getItem('devil_voice_feedback') !== 'false';
  });

  const toggleVoiceFeedback = () => {
    const next = !voiceFeedbackOn;
    setVoiceFeedbackOn(next);
    localStorage.setItem('devil_voice_feedback', String(next));
    soundFX.playConfirm();
  };

  const saveFeedbackList = (items: FeedbackItem[]) => {
    setFeedbackList(items);
    localStorage.setItem('devil_user_feedback', JSON.stringify(items));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    soundFX.playConfirm();

    const newFeedback: FeedbackItem = {
      id: `fb_${Date.now()}`,
      category,
      rating,
      message: message.trim(),
      author: author.trim() || 'Anonymous Operative',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      systemTelemetry: includeTelemetry
        ? {
            platform: navigator.platform || 'Unknown',
            userAgent: navigator.userAgent.slice(0, 100),
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            isOnline: navigator.onLine,
          }
        : undefined,
    };

    const updated = [newFeedback, ...feedbackList];
    saveFeedbackList(updated);
    setMessage('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleDeleteFeedback = (id: string) => {
    soundFX.playClick();
    const updated = feedbackList.filter((f) => f.id !== id);
    saveFeedbackList(updated);
  };

  const handleExportFeedback = () => {
    soundFX.playConfirm();
    downloadJSON(
      {
        system: 'DEVIL AI User Feedback Matrix',
        exportedAt: new Date().toISOString(),
        totalSubmissions: feedbackList.length,
        feedback: feedbackList,
      },
      `devil-user-feedback-${new Date().toISOString().slice(0, 10)}.json`
    );
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all feedback history from local storage?')) {
      soundFX.playClick();
      saveFeedbackList([]);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header Banner */}
      <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-cyan-300 uppercase tracking-wider">
            DEVIL Feedback & Telemetry Hub
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          {feedbackList.length} LOGGED
        </span>
      </div>

      {/* Voice Audio Feedback Toggle Quick-Strip */}
      <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {voiceFeedbackOn ? (
            <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="font-semibold text-slate-200 text-xs">
              AI Voice Speech Feedback: {voiceFeedbackOn ? 'ACTIVE (बोलता है)' : 'MUTED (शांत है)'}
            </div>
            <div className="text-[10px] text-slate-400">
              {voiceFeedbackOn
                ? 'DEVIL speaks tactical responses out loud.'
                : 'Responses are silent (text-only HUD mode).'}
            </div>
          </div>
        </div>

        <button
          onClick={toggleVoiceFeedback}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
            voiceFeedbackOn
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900'
              : 'bg-rose-950/80 border-rose-500/60 text-rose-300 hover:bg-rose-900'
          }`}
        >
          {voiceFeedbackOn ? 'Turn Speech OFF' : 'Turn Speech ON'}
        </button>
      </div>

      {/* Feedback Submission Form */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-slate-950 rounded-xl border border-cyan-900/60 space-y-3">
        <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Submit Direct Tactical Feedback / Bug Report</span>
        </div>

        {/* Category & Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Feedback Category</label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="feature">💡 Feature Suggestion (नया फ़ीचर सुझाव)</option>
              <option value="bug">🐛 Bug / Glitch Report (बग या समस्या)</option>
              <option value="voice">🎙️ Voice & Speech Feedback (आवाज़ एवं उच्चारण)</option>
              <option value="security">🛡️ Security & Pentest Feedback (सुरक्षा)</option>
              <option value="general">⭐ General Experience (सामान्य अनुभव)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Star / Arc Reactor Rating</label>
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                    soundFX.playClick();
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= (hoverRating ?? rating)
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-[10px] text-amber-400 font-bold ml-1">{rating} / 5</span>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Feedback / Observations / Details</label>
          <textarea
            rows={3}
            placeholder="आपकी प्रतिक्रिया, क्या सुधार चाहिए या कौन सा फ़ीचर सबसे बढ़िया लगा? Type your feedback here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Author & Telemetry Checkbox */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Author:</span>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name..."
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[11px] w-40 focus:border-cyan-500"
            />
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={includeTelemetry}
              onChange={(e) => setIncludeTelemetry(e.target.checked)}
              className="rounded bg-slate-900 border-white/20 text-cyan-500 accent-cyan-500"
            />
            <span className="text-[10px] text-slate-400">Include Device Telemetry (OS/Screen)</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Transmit Feedback to Stark Archives</span>
        </button>

        {isSubmitted && (
          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 flex items-center gap-2 text-[11px] animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>धन्यवाद बॉस! आपकी प्रतिक्रिया सुरक्षित रूप से दर्ज कर ली गई है।</span>
          </div>
        )}
      </form>

      {/* Feedback Logs & History */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recorded Feedback Logs ({feedbackList.length})</span>
          </span>

          {feedbackList.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportFeedback}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 transition text-[10px]"
                title="Export Feedback as JSON"
              >
                <Download className="w-3 h-3" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={handleClearAll}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-white/10 transition text-[10px]"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {feedbackList.length === 0 ? (
          <div className="p-6 bg-slate-950/60 rounded-xl border border-white/5 text-center text-slate-500">
            No feedback entries logged yet. Submit your first observation above!
          </div>
        ) : (
          feedbackList.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-950 border border-cyan-900/40 space-y-1.5 text-xs hover:border-cyan-500/40 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-300">{item.author}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteFeedback(item.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                  title="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-slate-200 whitespace-pre-wrap">{item.message}</p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                <span>{item.timestamp}</span>
                {item.systemTelemetry && (
                  <span className="text-cyan-400/80">
                    {item.systemTelemetry.screenResolution} • {item.systemTelemetry.platform}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
