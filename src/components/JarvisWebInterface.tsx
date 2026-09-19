import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, Send, Volume2, Sparkles, Terminal, RefreshCw } from 'lucide-react';
import { soundFX } from '../lib/audio';

interface JarvisWebInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageReceived?: (userText: string, aiText: string) => void;
}

export const JarvisWebInterface: React.FC<JarvisWebInterfaceProps> = ({
  isOpen,
  onClose,
  onMessageReceived,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [statusText, setStatusText] = useState('System Standby');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [lastReply, setLastReply] = useState('');

  // Canvas Animated Hologram HUD
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    let animationFrameId: number;

    const drawHUD = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = 160, cy = 160;

      // Outer Arc (Gold #ffaa00)
      ctx.beginPath();
      ctx.arc(cx, cy, 140, angle, angle + Math.PI * 1.2);
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner Arc (Cyan #00f0ff)
      ctx.beginPath();
      ctx.arc(cx, cy, 110, -angle * 1.5, -angle * 1.5 + Math.PI * 1.4);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center Core
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.stroke();

      angle += 0.02;
      animationFrameId = requestAnimationFrame(drawHUD);
    };

    drawHUD();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  // Speech Output Helper with British/Deep Male tone (Pitch 0.9, Rate 1.0)
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Prefer deep English/UK Male voice
    utter.voice =
      voices.find(
        (v) =>
          v.name.includes('Google UK English Male') ||
          v.name.includes('Natural') ||
          v.name.includes('George') ||
          (v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
      ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

    utter.pitch = 0.9;
    utter.rate = 1.0;

    utter.onend = () => {
      setStatusText('System Standby');
    };
    utter.onerror = () => {
      setStatusText('System Standby');
    };

    window.speechSynthesis.speak(utter);
  };

  // Send query to /api/chat
  const handleQuery = async (queryText: string) => {
    if (!queryText.trim() || isProcessing) return;

    soundFX.playClick();
    setLastPrompt(queryText);
    setStatusText(`Processing: "${queryText}"`);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          persona: 'jarvis',
        }),
      });

      const data = await response.json();
      const reply = data.reply || "At your service, Sir.";

      setLastReply(reply);
      setStatusText('JARVIS Responding');
      soundFX.playConfirm();

      if (onMessageReceived) {
        onMessageReceived(queryText, reply);
      }

      speak(reply);
    } catch (err) {
      console.error('JARVIS Chat Error:', err);
      setStatusText('Connection Error');
      const fallback = "Pardon me, Sir, but the neural communications link encountered an anomaly. Standing by.";
      setLastReply(fallback);
      speak(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  // Voice Interaction Logic using Web Speech API
  const initVoice = () => {
    soundFX.playPowerUp();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusText("Web Speech API not supported in this browser.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      setStatusText('Listening...');
      setIsListening(true);

      rec.onresult = async (e: any) => {
        setIsListening(false);
        const text = e.results[0][0].transcript;
        handleQuery(text);
      };

      rec.onerror = (e: any) => {
        setIsListening(false);
        console.warn('Speech recognition error:', e);
        setStatusText('Voice Input Idle (Type below or retry)');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (err) {
      setIsListening(false);
      setStatusText('Microphone permission required');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#040914] text-[#00f0ff] font-mono flex flex-col items-center justify-center p-4 select-none overflow-y-auto"
      style={{ fontFamily: "'Segoe UI', monospace" }}
    >
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
          <span className="text-xs uppercase tracking-[2px] font-bold text-[#00f0ff] drop-shadow-[0_0_8px_#00f0ff]">
            J.A.R.V.I.S. Web Interface // System Active
          </span>
        </div>

        <button
          onClick={() => {
            soundFX.playClick();
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            onClose();
          }}
          className="p-2 rounded-lg border border-[#00f0ff]/40 bg-[#040914] text-[#00f0ff] hover:bg-[#00f0ff]/20 transition shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          title="Exit J.A.R.V.I.S. Interface"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Hologram HUD */}
      <div id="hud" className="relative w-[320px] h-[320px] flex items-center justify-center">
        <canvas
          id="arc"
          ref={canvasRef}
          width={320}
          height={320}
          className="rounded-full shadow-[0_0_50px_rgba(255,170,0,0.2),inset_0_0_30px_rgba(0,240,255,0.3)]"
        />

        {/* Pulse center halo */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00f0ff] animate-spin opacity-50 pointer-events-none" />
        )}
      </div>

      {/* Status Element */}
      <div
        id="status"
        className="mt-5 text-sm sm:text-base font-bold uppercase tracking-[2px] text-center text-[#00f0ff] drop-shadow-[0_0_8px_#00f0ff]"
      >
        {statusText}
      </div>

      {/* Button: INITIALIZE JARVIS */}
      <button
        onClick={initVoice}
        disabled={isProcessing}
        className={`mt-4 px-6 py-2.5 border border-[#00f0ff] text-[#00f0ff] font-bold tracking-wider uppercase cursor-pointer transition shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:bg-[#00f0ff] hover:text-[#040914] active:scale-95 flex items-center gap-2 ${
          isListening ? 'bg-[#00f0ff]/20 animate-pulse' : 'bg-transparent'
        }`}
      >
        <Mic className="w-4 h-4" />
        <span>INITIALIZE JARVIS</span>
      </button>

      {/* Dual Text Input & Quick Terminal for convenience */}
      <div className="mt-6 w-full max-w-md bg-[#040914]/80 border border-[#00f0ff]/30 p-3 rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.1)]">
        {lastReply && (
          <div className="mb-3 text-xs leading-relaxed border-l-2 border-[#00f0ff] pl-2 text-slate-200">
            <div className="text-[10px] uppercase text-[#ffaa00] font-bold tracking-wider mb-0.5">
              J.A.R.V.I.S.:
            </div>
            <div>{lastReply}</div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (textInput.trim()) {
              handleQuery(textInput);
              setTextInput('');
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Address J.A.R.V.I.S. (e.g. 'Status report, Sir')..."
            className="flex-1 bg-[#050e1f] border border-[#00f0ff]/40 rounded px-3 py-1.5 text-xs text-slate-100 placeholder:text-cyan-600 focus:outline-none focus:border-[#00f0ff]"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isProcessing}
            className="px-3 py-1.5 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/30 border border-[#00f0ff] text-[#00f0ff] rounded text-xs uppercase tracking-wider font-bold transition disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
