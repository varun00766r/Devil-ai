import React, { useState } from 'react';
import { Wifi, QrCode, Lock, ShieldCheck, Copy, Check, Eye, EyeOff, Key, Terminal, Smartphone, Laptop } from 'lucide-react';
import { soundFX } from '../lib/audio';

export const WiFiManagerCard: React.FC = () => {
  const [ssid, setSsid] = useState('DEVIL_Secure_WiFi');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'windows' | 'android' | 'ios' | 'mac'>('android');

  const wifiQRString = `WIFI:S:${ssid};T:${encryption};P:${password};;`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wifiQRString)}`;

  const handleCopyQRString = () => {
    soundFX.playConfirm();
    navigator.clipboard.writeText(wifiQRString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 p-3.5 bg-slate-950 border border-red-500/60 rounded-xl shadow-2xl space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-red-950/80">
        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
          <Wifi className="w-4 h-4 text-red-400 animate-pulse" />
          <span>DEVIL Wi-Fi Manager & QR Sharing Radar</span>
        </div>
        <span className="text-[10px] bg-red-950 text-red-300 border border-red-800/60 px-2 py-0.5 rounded-full font-sans">
          WPA2/WPA3 Active
        </span>
      </div>

      {/* Section 1: Wi-Fi QR Code Generator & Config */}
      <div className="p-3 bg-slate-900/90 rounded-xl border border-red-900/40 space-y-3">
        <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-red-400" />
          <span>1-Tap Wi-Fi Sharing QR Generator</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          {/* Inputs */}
          <div className="sm:col-span-2 space-y-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Wi-Fi Name (SSID):</label>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="Wi-Fi SSID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-red-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Wi-Fi Password:</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-2.5 pr-8 py-1.5 text-white outline-none focus:border-red-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] pt-1">
              <div className="flex gap-1.5">
                {(['WPA', 'WEP', 'nopass'] as const).map((enc) => (
                  <button
                    key={enc}
                    onClick={() => {
                      soundFX.playClick();
                      setEncryption(enc);
                    }}
                    className={`px-2 py-0.5 rounded border transition ${
                      encryption === enc
                        ? 'bg-red-950 text-red-300 border-red-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {enc === 'nopass' ? 'Open' : enc}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyQRString}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-sans"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy String</span>
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col items-center justify-center p-2 bg-slate-950 rounded-lg border border-slate-800/80">
            {ssid ? (
              <img
                src={qrUrl}
                alt="Wi-Fi QR Code"
                className="w-28 h-28 rounded border border-white/20 p-1 bg-white"
              />
            ) : (
              <div className="w-28 h-28 bg-slate-900 rounded flex items-center justify-center text-[10px] text-slate-500">
                Enter SSID
              </div>
            )}
            <span className="text-[9px] text-slate-400 mt-1.5 text-center">Scan with phone camera to connect</span>
          </div>
        </div>
      </div>

      {/* Section 2: How to View Saved Wi-Fi Passwords on Your Device */}
      <div className="p-3 bg-slate-900/90 rounded-xl border border-red-900/40 space-y-2">
        <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-red-400" />
          <span>अपने डिवाइस पर सेव्ड Wi-Fi पासवर्ड कैसे देखें (Guide):</span>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveGuideTab('android')}
            className={`px-3 py-1.5 border-b-2 font-sans transition flex items-center gap-1 ${
              activeGuideTab === 'android'
                ? 'border-red-500 text-red-300 font-bold bg-slate-950'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('windows')}
            className={`px-3 py-1.5 border-b-2 font-sans transition flex items-center gap-1 ${
              activeGuideTab === 'windows'
                ? 'border-red-500 text-red-300 font-bold bg-slate-950'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Windows</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('ios')}
            className={`px-3 py-1.5 border-b-2 font-sans transition flex items-center gap-1 ${
              activeGuideTab === 'ios'
                ? 'border-red-500 text-red-300 font-bold bg-slate-950'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>iPhone (iOS)</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('mac')}
            className={`px-3 py-1.5 border-b-2 font-sans transition flex items-center gap-1 ${
              activeGuideTab === 'mac'
                ? 'border-red-500 text-red-300 font-bold bg-slate-950'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3 h-3" />
            <span>macOS</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="text-[11px] text-slate-300 space-y-1.5 pt-1 font-sans">
          {activeGuideTab === 'android' && (
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>फोन की <b>Settings</b> &gt; <b>Network &amp; Internet / Wi-Fi</b> में जाएँ।</li>
              <li>कनेक्टेड या सेव्ड नेटवर्क के बगल में <b>Settings Gear icon</b> पर टैप करें।</li>
              <li><b>Share</b> बटन पर टैप करें (Fingerprint/PIN से अनलॉक करें)।</li>
              <li>स्क्रीन पर QR Code के नीचे वाई-फाई पासवर्ड लिखा हुआ दिख जाएगा!</li>
            </ol>
          )}

          {activeGuideTab === 'windows' && (
            <div className="space-y-1.5 font-mono">
              <p className="text-slate-300 font-sans">Command Prompt (CMD) खोलें और यह कमांड टाइप करें:</p>
              <div className="p-2 bg-slate-950 rounded border border-red-900/60 text-red-300 select-all text-[10px]">
                netsh wlan show profile name="YOUR_WIFI_NAME" key=clear
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                आउटपुट में <b>Security settings</b> के अंतर्गत <b>Key Content</b> में आपका वाई-फाई पासवर्ड दिख जाएगा।
              </p>
            </div>
          )}

          {activeGuideTab === 'ios' && (
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>iPhone की <b>Settings</b> &gt; <b>Wi-Fi</b> पर जाएँ।</li>
              <li>कनेक्टेड Wi-Fi नेटवर्क के पास नीले <b>(i) Information icon</b> पर टैप करें।</li>
              <li><b>Password</b> फ़ील्ड पर टैप करें (Face ID / Touch ID से अनलॉक करें)।</li>
              <li>पासवर्ड अनहाइड होकर दिखेगा और आप इसे कॉपी भी कर सकते हैं!</li>
            </ol>
          )}

          {activeGuideTab === 'mac' && (
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li><b>System Settings</b> &gt; <b>Wi-Fi</b> पर जाएँ।</li>
              <li>नीचे <b>Advanced</b> बटन पर क्लिक करें।</li>
              <li><b>Known Networks</b> में अपने वाई-फाई के 3-डॉट्स पर क्लिक करके <b>Copy Password</b> चुनें।</li>
            </ol>
          )}
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-sans">
        <span className="flex items-center gap-1 text-emerald-400 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security Advice:</span>
        </span>
        <span className="text-slate-400">Use WPA3 Encryption • Disable WPS • Set 12+ Char Passphrase</span>
      </div>
    </div>
  );
};
