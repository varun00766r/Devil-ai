import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Check,
  ExternalLink,
  ShieldCheck,
  Copy,
  Terminal,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Share2,
  HardDrive,
  Cpu,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { soundFX } from '../lib/audio';
import { PWAInstallButton } from './PWAInstallButton';
import { usePWAInstall } from '../lib/usePWAInstall';

export const ApkDownloadCard: React.FC = () => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [showCliGuide, setShowCliGuide] = useState(false);
  const [showSpecDetails, setShowSpecDetails] = useState(false);
  const { isInstallable, isInstalled, isIOS } = usePWAInstall();

  // Detect if inside iframe
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleCopyLink = () => {
    soundFX.playConfirm();
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenStandalone = () => {
    soundFX.playConfirm();
    window.open(window.location.href, '_blank');
  };

  const handleDownloadManifest = () => {
    soundFX.playConfirm();
    const link = document.createElement('a');
    link.href = '/manifest.json';
    link.download = 'devil-ai-manifest.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCliCommand = () => {
    soundFX.playClick();
    const cmd = `npx @bubblewrap/cli init --manifest=${window.location.origin}/manifest.json && npx @bubblewrap/cli build`;
    navigator.clipboard.writeText(cmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2500);
  };

  return (
    <div className="w-full bg-slate-950/90 border border-red-500/50 rounded-2xl p-3.5 sm:p-4 text-slate-100 font-mono shadow-[0_0_25px_rgba(239,68,68,0.15)] space-y-3.5">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-red-900/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/60 shadow-md">
            <Smartphone className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wider text-white">DEVIL AI APK & MOBILE APP</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                v2.5 PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Android WebAPK • Standalone Mobile PWA • 100% Offline</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Safe</span>
        </div>
      </div>

      {/* Iframe Notice & Standalone Browser Trigger */}
      {isInIframe && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>AI Studio Preview Iframe सक्रिय है</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Android फोन पर <strong>"Install App / Add to Home Screen"</strong> का ऑटोमैटिक पॉपअप पाने के लिए इसे मुख्य ब्राउज़र टैब में खोलें:
          </p>
          <div className="flex flex-wrap gap-2 pt-0.5">
            <button
              onClick={handleOpenStandalone}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition active:scale-95 shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab (नया टैब खोलें)</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Mobile URL'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Direct 1-Tap PWA Install Section */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/50 via-slate-900 to-slate-950 border border-red-500/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="font-bold text-xs text-red-300 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-red-400" />
            <span>विकल्प 1: 1-टैप डायरेक्ट ऐप इंस्टॉल (Android / Mobile WebAPK)</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">Fastest</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          बिना गूगल प्लेस्टोर के, अपने फोन में DEVIL AI को एक पूर्ण Android मोबाइल ऐप की तरह इंस्टॉल करें:
        </p>

        {/* Embedded PWA install action */}
        <div className="pt-1">
          <PWAInstallButton />
        </div>

        {isInstalled && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>DEVIL AI आपके डिवाइस पर पहले से इंस्टॉल है!</span>
          </div>
        )}
      </div>

      {/* Step-by-Step Android Installation Guide */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Android Chrome / Brave में मैन्युअल इंस्टॉल कैसे करें?</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
              <span>3-Dots मेनू खोलें</span>
            </div>
            <p className="text-[11px] text-slate-400">
              फोन के Chrome या Brave ब्राउज़र में ऊपर दाएं <strong>3 डॉट्स (⋮)</strong> पर टैप करें।
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
              <span>"Install App" चुनें</span>
            </div>
            <p className="text-[11px] text-slate-400">
              मेनू लिस्ट में <strong>"Install App"</strong> या <strong>"Add to Home screen"</strong> पर क्लिक करें।
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">3</span>
              <span>होम स्क्रीन पर तैयार</span>
            </div>
            <p className="text-[11px] text-slate-400">
              DEVIL AI का आइकॉन होम स्क्रीन पर आ जाएगा और यह फुल-स्क्रीन बिना एड्रेस बार के चलेगा!
            </p>
          </div>
        </div>
      </div>

      {/* APK Binary Generation / Android Studio CLI Details (Accordion) */}
      <div className="border border-slate-800 rounded-xl p-3 bg-slate-900/50 space-y-2.5 text-xs">
        <div
          onClick={() => setShowCliGuide(!showCliGuide)}
          className="flex items-center justify-between cursor-pointer select-none text-slate-300 hover:text-white font-semibold"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>विकल्प 2: .APK फ़ाइल बिल्ड करें (Bubblewrap / Android Studio)</span>
          </div>
          {showCliGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {showCliGuide && (
          <div className="pt-2 border-t border-slate-800 space-y-2.5 text-[11px] text-slate-300">
            <p className="text-slate-400">
              यदि आप गूगल प्लेस्टोर या साइडलोडिंग के लिए कम्पाइल की हुई <code className="text-red-300">.apk</code> या{' '}
              <code className="text-red-300">.aab</code> फ़ाइल जनरेट करना चाहते हैं:
            </p>

            <div className="p-2.5 rounded-lg bg-black border border-slate-800 font-mono text-[10px] space-y-1.5">
              <div className="text-slate-500">// 1. Google Bubblewrap CLI से 1-कमांड में APK बनाएं:</div>
              <div className="text-emerald-400 select-all">
                npm install -g @bubblewrap/cli
                <br />
                bubblewrap init --manifest={window.location.origin}/manifest.json
                <br />
                bubblewrap build
              </div>
              <div className="pt-1 text-slate-500">// 2. या Capacitor द्वारा Android Studio प्रोजेक्ट खोलें:</div>
              <div className="text-cyan-400 select-all">
                npx cap add android && npx cap open android
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleCopyCliCommand}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCli ? 'Commands Copied!' : 'Copy Build Commands'}</span>
              </button>

              <button
                onClick={handleDownloadManifest}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download Web Manifest (.json)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Specifications & Technical Details */}
      <div className="border border-slate-800 rounded-xl p-3 bg-slate-900/50 space-y-2 text-xs">
        <div
          onClick={() => setShowSpecDetails(!showSpecDetails)}
          className="flex items-center justify-between cursor-pointer select-none text-slate-300 hover:text-white font-semibold"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>DEVIL Mobile App Specifications (तकनीकी विवरण)</span>
          </div>
          {showSpecDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {showSpecDetails && (
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="text-slate-500 text-[10px]">Package Format</div>
              <div className="text-white font-bold">WebAPK / PWA v2</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="text-slate-500 text-[10px]">App Size</div>
              <div className="text-white font-bold">&lt; 3.5 MB (Instant)</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="text-slate-500 text-[10px]">Offline Support</div>
              <div className="text-emerald-400 font-bold">100% Cached (SW)</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="text-slate-500 text-[10px]">Permissions</div>
              <div className="text-cyan-400 font-bold">Mic • Cam • GPS</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Quick Actions */}
      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span>Standalone full-screen display • No Play Store required</span>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Link</span>
        </button>
      </div>
    </div>
  );
};
