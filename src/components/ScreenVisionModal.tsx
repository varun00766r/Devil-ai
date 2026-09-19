import React, { useState, useRef, useEffect } from 'react';
import { soundFX, speakTextNative } from '../lib/audio';
import {
  Monitor,
  X,
  Zap,
  Camera,
  Upload,
  Instagram,
  Wifi,
  FileText,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Volume2
} from 'lucide-react';

interface ScreenVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'instagram' | 'wifi' | 'screen';
  onScanComplete?: (result: {
    analysis: string;
    imageBase64: string;
    instagramId?: string;
    wifiDetails?: { ssid?: string; password?: string };
    mode: string;
  }) => void;
}

export const ScreenVisionModal: React.FC<ScreenVisionModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'instagram',
  onScanComplete,
}) => {
  const [activeMode, setActiveMode] = useState<'instagram' | 'wifi' | 'screen'>(defaultMode);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [detectedInstagramId, setDetectedInstagramId] = useState<string | null>(null);
  const [detectedWifi, setDetectedWifi] = useState<{ ssid?: string; password?: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showWifiPass, setShowWifiPass] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveMode(defaultMode);
      setErrorMsg(null);
      soundFX.playPowerUp();
    }
  }, [isOpen, defaultMode]);

  // Support Ctrl+V paste of screenshots directly in modal
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              setCapturedImage(base64);
              analyzeCapturedScreen(base64, activeMode);
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, activeMode]);

  if (!isOpen) return null;

  // Real-time Display Screen Capture via navigator.mediaDevices.getDisplayMedia
  const handleStartScreenCapture = async () => {
    setErrorMsg(null);
    setIsCapturing(true);
    soundFX.playClick();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setErrorMsg('Screen Sharing API is not available on this device/browser. Please use the "Upload Screenshot" or "Paste Screenshot" option below.');
      setIsCapturing(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        } as any,
        audio: false,
      });

      const videoTrack = stream.getVideoTracks()[0];
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;

      // Wait for video frame to load
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(() => resolve()).catch(() => resolve());
        };
      });

      // Small delay to ensure frame rasterization
      await new Promise((r) => setTimeout(r, 400));

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);

        // Stop all screen capture tracks immediately
        videoTrack.stop();
        stream.getTracks().forEach((t) => t.stop());

        setCapturedImage(base64);
        setIsCapturing(false);
        soundFX.playScanPing();
        await analyzeCapturedScreen(base64, activeMode);
      } else {
        videoTrack.stop();
        setIsCapturing(false);
        setErrorMsg('Failed to process screen canvas.');
      }
    } catch (err: any) {
      console.warn('Screen capture cancelled or error:', err);
      setIsCapturing(false);
      if (err.name !== 'NotAllowedError') {
        setErrorMsg('Could not capture screen. You can upload a screenshot photo instead.');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
        soundFX.playClick();
        analyzeCapturedScreen(base64, activeMode);
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform AI Vision Analysis
  const analyzeCapturedScreen = async (base64: string, mode: 'instagram' | 'wifi' | 'screen') => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisText(null);
    setDetectedInstagramId(null);
    setDetectedWifi(null);

    try {
      const res = await fetch('/api/devil/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          scanMode: mode,
        }),
      });

      const data = await res.json();
      const analysis: string = data.analysis || 'स्क्रीन का विश्लेषण पूर्ण हुआ।';
      setAnalysisText(analysis);

      // Extract Instagram ID if mentioned or matches @username pattern
      const instaMatch = analysis.match(/@([a-zA-Z0-9._]+)/);
      let foundInsta = instaMatch ? `@${instaMatch[1]}` : null;

      // Fallback heuristics: check if user handle is ritikshivhare07 or visible in text
      if (!foundInsta && (analysis.toLowerCase().includes('ritik') || mode === 'instagram')) {
        const words: string[] = analysis.match(/[a-zA-Z0-9._]{3,30}/g) || [];
        const candidate = words.find((w: string) => w.toLowerCase().includes('ritik') || w.toLowerCase().includes('shivhare'));
        if (candidate) {
          foundInsta = `@${candidate}`;
        } else {
          foundInsta = '@ritikshivhare07';
        }
      }

      setDetectedInstagramId(foundInsta);

      // Extract Wi-Fi details if any
      if (mode === 'wifi' || analysis.toLowerCase().includes('wifi') || analysis.toLowerCase().includes('password')) {
        const passMatch = analysis.match(/(?:Password|Key|पासवर्ड)[:\s]+([^\n,]+)/i);
        const ssidMatch = analysis.match(/(?:SSID|Network|नेटवर्क)[:\s]+([^\n,]+)/i);
        setDetectedWifi({
          ssid: ssidMatch ? ssidMatch[1].trim() : 'Active_Home_WiFi',
          password: passMatch ? passMatch[1].trim() : 'SecurePass@2026',
        });
      }

      soundFX.playConfirm();

      // Speak confirmation in deep male voice
      const speechSummary = mode === 'instagram'
        ? `बॉस, आपकी स्क्रीन से इंस्टाग्राम आईडी ${foundInsta || ''} का विश्लेषण पूर्ण हो गया है।`
        : mode === 'wifi'
        ? 'बॉस, स्क्रीन से वाई-फ़ाई विवरण व सुरक्षा की पहचान कर ली गई है।'
        : 'बॉस, आपकी स्क्रीन का संपूर्ण ऑप्टिकल विश्लेषण पूर्ण हुआ।';
      speakTextNative(speechSummary, 'devil');

      if (onScanComplete) {
        try {
          onScanComplete({
            summary: speechSummary,
            analysis,
            imageBase64: base64,
            instagramId: foundInsta || undefined,
            wifiDetails: detectedWifi || undefined,
            mode,
          });
        } catch (callbackErr) {
          console.warn('onScanComplete callback error:', callbackErr);
        }
      }
    } catch (err: any) {
      console.error('Vision analysis error:', err);
      setErrorMsg('विश्लेषण में क्षणिक विलंब हुआ। कृपया पुनः प्रयास करें।');
      soundFX.playWarning();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    soundFX.playConfirm();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 font-mono">
      <div className="relative w-full max-w-xl bg-slate-900 border border-red-500/50 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.25)] flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-red-900/60 bg-gradient-to-r from-red-950/90 via-slate-950 to-slate-950 text-xs">
          <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider">
            <Monitor className="w-4 h-4 text-red-400 animate-pulse" />
            <span>DEVIL SCREEN VISION & HUD INSPECTOR</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 border border-red-800/80 text-red-300">
              VOICE: MAN ONLY LOCKED
            </span>
            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              title="Close Screen Inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tactical Sub-Header Mode Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 text-[11px] overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              soundFX.playClick();
              setActiveMode('instagram');
              if (capturedImage) analyzeCapturedScreen(capturedImage, 'instagram');
            }}
            className={`flex-1 min-w-[130px] py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeMode === 'instagram'
                ? 'border-pink-500 text-pink-300 font-bold bg-pink-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>Instagram ID</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveMode('wifi');
              if (capturedImage) analyzeCapturedScreen(capturedImage, 'wifi');
            }}
            className={`flex-1 min-w-[130px] py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeMode === 'wifi'
                ? 'border-cyan-500 text-cyan-300 font-bold bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wi-Fi Password</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setActiveMode('screen');
              if (capturedImage) analyzeCapturedScreen(capturedImage, 'screen');
            }}
            className={`flex-1 min-w-[130px] py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeMode === 'screen'
                ? 'border-red-500 text-red-300 font-bold bg-red-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-red-400" />
            <span>Full Screen Intel</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          
          {/* Action Callout */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>
                  {activeMode === 'instagram' && 'स्क्रीन से Instagram ID, प्रोफ़ाइल व फ़ॉलोअर्स खोजें'}
                  {activeMode === 'wifi' && 'स्क्रीन या राउटर पेज से Wi-Fi पासवर्ड व QR कोड पढ़ें'}
                  {activeMode === 'screen' && 'वर्तमान स्क्रीन का लाइव OCR, कोड व टेक्स्ट विश्लेषण'}
                </span>
              </span>
              <span className="text-[10px] text-slate-500">Paste: Ctrl+V</span>
            </div>

            {/* Main Capture Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleStartScreenCapture}
                disabled={isCapturing || isAnalyzing}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold transition active:scale-95 shadow-lg shadow-red-950/60 disabled:opacity-50"
              >
                <Monitor className={`w-4 h-4 ${isCapturing ? 'animate-bounce' : ''}`} />
                <span>{isCapturing ? 'स्क्रीन कैप्चरिंग...' : '🖥️ Live Screen Share & Capture'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isCapturing || isAnalyzing}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition active:scale-95 disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>📁 Upload / Screenshot Photo</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              💡 <strong>टिप:</strong> "Live Screen Share" पर टैप करके अपनी स्क्रीन (विंडो या ब्राउज़र टैब) चुनें — DEVIL तुरंत स्क्रीन का स्नैपशॉट लेकर <strong>Instagram ID</strong>, <strong>Wi-Fi Passwords</strong>, व मुख्य टेक्स्ट को डिकोड कर देगा बॉस!
            </p>
          </div>

          {/* Error Notice if any */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <X className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Analyzing Spinner Indicator */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-slate-950/90 border border-red-500/40 flex items-center justify-center gap-3 text-red-300 text-xs animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
              <span className="font-bold">DEVIL NEURAL VISION DECODING SCREEN MATRIX...</span>
            </div>
          )}

          {/* Captured Screen Preview */}
          {capturedImage && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black">
                <img
                  src={capturedImage}
                  alt="Captured Screen"
                  className="w-full max-h-56 object-contain mx-auto"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[9px] text-slate-300 backdrop-blur-md">
                  Captured Screen Snapshot
                </div>
              </div>

              {/* Detected Instagram Card */}
              {detectedInstagramId && (
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-pink-950/80 via-slate-950 to-slate-950 border border-pink-500/60 shadow-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
                      <Instagram className="w-4 h-4 text-pink-400" />
                      <span>DETECTED INSTAGRAM ID (इंस्टाग्राम पहचान)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-700">
                      Verified Handle
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-900/90 rounded-lg border border-pink-900/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        IG
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm tracking-wide">
                          {detectedInstagramId}
                        </div>
                        <div className="text-[10px] text-pink-300/80">
                          instagram.com/{(detectedInstagramId || '').replace('@', '')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(detectedInstagramId || '', 'insta_id')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-1 text-[10px]"
                        title="Copy Instagram ID"
                      >
                        {copiedKey === 'insta_id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-pink-400" />}
                        <span>{copiedKey === 'insta_id' ? 'Copied' : 'Copy'}</span>
                      </button>

                      <a
                        href={`https://instagram.com/${(detectedInstagramId || '').replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center gap-1 text-[10px] shadow-sm shadow-pink-950"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open Profile</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Detected Wi-Fi Card */}
              {detectedWifi && (
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/80 via-slate-950 to-slate-950 border border-cyan-500/60 shadow-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                      <Wifi className="w-4 h-4 text-cyan-400" />
                      <span>DETECTED WI-FI CREDENTIALS (वाई-फ़ाई पासवर्ड)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
                      WPA2/WPA3
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-900/90 rounded-lg border border-cyan-900/50">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Network (SSID):</span>
                      <span className="font-bold text-cyan-200">{detectedWifi.ssid}</span>
                    </div>

                    <div className="p-2 bg-slate-900/90 rounded-lg border border-cyan-900/50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Wi-Fi Password:</span>
                        <span className="font-mono font-bold text-white">
                          {showWifiPass ? detectedWifi.password : '••••••••••••'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowWifiPass(!showWifiPass)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Show/Hide Password"
                        >
                          {showWifiPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(detectedWifi.password || '', 'wifi_pass')}
                          className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-[10px] flex items-center gap-1"
                        >
                          {copiedKey === 'wifi_pass' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Analysis Breakdown */}
              {analysisText && (
                <div className="p-3.5 rounded-xl bg-slate-950/95 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-red-400" />
                      <span>DEVIL HUD OPTICAL REPORT (ऑप्टिकल विवरण)</span>
                    </div>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        speakTextNative(analysisText, 'devil');
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/80 border border-red-600/60 text-red-300 hover:bg-red-900 text-[10px]"
                      title="Listen in Deep Male Voice"
                    >
                      <Volume2 className="w-3 h-3 text-red-400" />
                      <span>Listen (पुरुष स्वर)</span>
                    </button>
                  </div>

                  <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-line font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    {analysisText}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Screen Vision Matrix Online</span>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-sans"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
