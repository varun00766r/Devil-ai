import React, { useState } from 'react';
import { ChatMessage, Persona } from '../types';
import { speakTextNative, soundFX } from '../lib/audio';
import { LocationRadarCard } from './LocationRadarCard';
import { ContactDialerCard } from './ContactDialerCard';
import { LiveClockCard } from './LiveClockCard';
import { WiFiManagerCard } from './WiFiManagerCard';
import { MobileManagerCard } from './MobileManagerCard';
import { StopwatchCard } from './StopwatchCard';
import { VoiceManagerCard } from './VoiceManagerCard';
import { AllIndiaNewsCard } from './AllIndiaNewsCard';
import { AllIndiaDataCard } from './AllIndiaDataCard';
import { FakeCallLauncherCard } from './FakeCallLauncherCard';
import { ApkDownloadCard } from './ApkDownloadCard';
import { MobileNumberLocationCard } from './MobileNumberLocationCard';
import { UIClearingCard } from './UIClearingCard';
import { FakeCallConfig } from '../types';
import { Volume2, Copy, Check, ExternalLink, Bot, User, Sparkles, Monitor, Instagram, Wifi, Eye, EyeOff } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
  persona: Persona;
  onScheduleFakeCall?: (config: FakeCallConfig) => void;
  scheduledFakeCall?: { config: FakeCallConfig; triggerTime: number } | null;
  onCancelScheduledFakeCall?: () => void;
  isClearView?: boolean;
  onToggleClearView?: () => void;
  onClearTerminal?: () => void;
  onOpenQuantumCore?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  persona,
  onScheduleFakeCall,
  scheduledFakeCall,
  onCancelScheduledFakeCall,
  isClearView,
  onToggleClearView,
  onClearTerminal,
  onOpenQuantumCore,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    soundFX.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      soundFX.playClick();
      setIsSpeaking(true);
      speakTextNative(message.text, persona, () => setIsSpeaking(false));
    }
  };

  // Simple clean markdown string display
  const renderText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-cyan-300 font-bold text-sm mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-cyan-300 font-bold text-base mt-2 mb-1">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200 my-0.5">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      }
      if (line.startsWith('```')) {
        return <div key={idx} className="my-1 font-mono text-[11px] text-cyan-400 bg-slate-950 p-2 rounded border border-cyan-900/50">{line.replace(/```[a-z]*/g, '')}</div>;
      }
      return <p key={idx} className="my-1 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className={`flex gap-3 my-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      
      {/* Bot Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-950/50">
          <Bot className="w-4 h-4 text-cyan-400" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs font-sans border shadow-xl ${
        isUser
          ? 'bg-gradient-to-br from-cyan-950/90 to-slate-900 border-cyan-700/50 text-cyan-100 rounded-tr-none'
          : 'bg-slate-900/95 border-slate-800 text-slate-100 rounded-tl-none'
      }`}>
        
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-800/80 font-mono text-[10px] text-slate-400">
          <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-cyan-400">
            {isUser ? 'OPERATOR' : persona.toUpperCase()}
          </span>
          <span className="text-slate-500">{message.timestamp}</span>
        </div>

        {/* Attached Image Preview */}
        {message.image && (
          <div className="my-2 rounded-lg overflow-hidden border border-cyan-500/30">
            <img src={message.image} alt="Scan input" className="w-full max-h-56 object-cover" />
          </div>
        )}

        {/* Text Content */}
        <div className="text-slate-200 text-xs leading-relaxed space-y-1">
          {renderText(message.text)}
        </div>

        {/* Attached Live Location Radar */}
        {message.locationData && (
          <div className="mt-2">
            <LocationRadarCard location={message.locationData} />
          </div>
        )}

        {/* Attached DEVIL Contact Dialer */}
        {message.showContactDialer && (
          <div className="mt-2">
            <ContactDialerCard />
          </div>
        )}

        {/* Attached DEVIL Live Clock */}
        {message.showLiveClock && (
          <div className="mt-2">
            <LiveClockCard />
          </div>
        )}

        {/* Attached DEVIL Wi-Fi Manager */}
        {message.showWiFiManager && (
          <div className="mt-2">
            <WiFiManagerCard />
          </div>
        )}

        {/* Attached DEVIL All Mobile Manager */}
        {message.showMobileManager && (
          <div className="mt-2">
            <MobileManagerCard />
          </div>
        )}

        {/* Attached DEVIL Stopwatch */}
        {message.showStopwatch && (
          <div className="mt-2">
            <StopwatchCard autoStart={true} />
          </div>
        )}

        {/* Attached DEVIL Man Voice Manager */}
        {message.showVoiceManager && (
          <div className="mt-2">
            <VoiceManagerCard />
          </div>
        )}

        {/* Attached DEVIL All-India News Radar */}
        {message.showIndiaNews && (
          <div className="mt-2">
            <AllIndiaNewsCard initialNews={message.indiaNewsData} />
          </div>
        )}

        {/* Attached DEVIL All-India Data Matrix */}
        {message.showAllIndiaData && (
          <div className="mt-2">
            <AllIndiaDataCard />
          </div>
        )}

        {/* Attached DEVIL Fake Call Launcher Card */}
        {message.showFakeCallLauncher && onScheduleFakeCall && (
          <div className="mt-2">
            <FakeCallLauncherCard
              onScheduleCall={onScheduleFakeCall}
              scheduledCall={scheduledFakeCall || null}
              onCancelScheduledCall={onCancelScheduledFakeCall || (() => {})}
            />
          </div>
        )}

        {/* Attached DEVIL APK & Mobile App Downloader Card */}
        {message.showApkDownload && (
          <div className="mt-2">
            <ApkDownloadCard />
          </div>
        )}

        {/* Attached DEVIL Mobile Number Live Location Card */}
        {message.showMobileNumberLocation && (
          <div className="mt-2">
            <MobileNumberLocationCard initialNumber={message.mobileNumberQuery || ''} />
          </div>
        )}

        {/* Attached DEVIL UI Clearing & Clarity Card */}
        {message.showUIClearingCard && (
          <div className="mt-2">
            <UIClearingCard
              isClearView={isClearView}
              onToggleClearView={onToggleClearView}
              onClearTerminal={onClearTerminal}
              onOpenQuantumCore={onOpenQuantumCore}
            />
          </div>
        )}

        {/* Attached DEVIL Screen Vision Intelligence Card */}
        {message.screenVisionData && (
          <div className="mt-2 p-3 rounded-xl bg-slate-950/90 border border-red-500/50 shadow-lg space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-red-900/40 pb-1.5">
              <span className="text-red-400 font-bold flex items-center gap-1.5 uppercase text-[11px]">
                <Monitor className="w-3.5 h-3.5 text-red-400" />
                <span>Screen Vision Matrix</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                {message.screenVisionData.mode?.toUpperCase() || 'OPTICAL HUD'}
              </span>
            </div>

            {/* Detected Instagram ID */}
            {message.screenVisionData.instagramId && (
              <div className="p-2.5 rounded-lg bg-pink-950/40 border border-pink-500/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-pink-300/80 block">Instagram ID Detected:</span>
                    <span className="font-bold text-white text-sm">{message.screenVisionData.instagramId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      soundFX.playConfirm();
                      navigator.clipboard.writeText(message.screenVisionData!.instagramId!);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3 text-pink-400" />
                    <span>Copy</span>
                  </button>
                  <a
                    href={`https://instagram.com/${(message.screenVisionData.instagramId || '').replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded bg-pink-600 hover:bg-pink-500 text-white font-bold text-[10px] flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open</span>
                  </a>
                </div>
              </div>
            )}

            {/* Detected Wi-Fi Details */}
            {message.screenVisionData.wifiDetails && (
              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-cyan-300/80 block">
                      Wi-Fi: {message.screenVisionData.wifiDetails.ssid || 'Active Network'}
                    </span>
                    <span className="font-bold text-white text-xs">
                      Key: {message.screenVisionData.wifiDetails.password || '••••••••'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundFX.playConfirm();
                    navigator.clipboard.writeText(message.screenVisionData!.wifiDetails?.password || '');
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1"
                >
                  <Copy className="w-3 h-3 text-cyan-400" />
                  <span>Copy Pass</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Grounding Source Links if Web Search was used */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-800/80">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Live Intel Sources:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-cyan-900/60 text-[10px] text-cyan-300 hover:text-cyan-200 hover:border-cyan-500 transition"
                >
                  <span className="truncate max-w-[140px]">{src.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls for Assistant Messages */}
        {!isUser && (
          <div className="mt-2.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-end gap-2 text-slate-400 font-mono">
            <button
              onClick={handleSpeak}
              className={`p-1 rounded hover:bg-slate-800 transition ${isSpeaking ? 'text-cyan-400 animate-pulse' : ''}`}
              title="Speak Answer"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-slate-800 transition"
              title="Copy Text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
          <User className="w-4 h-4 text-cyan-400" />
        </div>
      )}

    </div>
  );
};
