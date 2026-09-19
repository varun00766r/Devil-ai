import React, { useState } from 'react';
import {
  Phone,
  Radio,
  MapPin,
  Shield,
  ShieldAlert,
  Search,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Navigation,
  Globe,
  Signal,
  AlertTriangle,
  Lock,
  Compass,
  Building,
  RotateCw,
} from 'lucide-react';
import { MobileNumberLookupResult, lookupMobileNumberLiveIntel } from '../lib/telecomIntel';
import { soundFX } from '../lib/audio';

interface MobileNumberLocationCardProps {
  initialNumber?: string;
  onTrackAnother?: (num: string) => void;
}

export const MobileNumberLocationCard: React.FC<MobileNumberLocationCardProps> = ({
  initialNumber = '',
  onTrackAnother,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialNumber);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lookupResult, setLookupResult] = useState<MobileNumberLookupResult>(() =>
    lookupMobileNumberLiveIntel(initialNumber || '9826012345')
  );
  const [trackingMode, setTrackingMode] = useState<'radar' | 'whatsapp' | 'legal'>('radar');

  const handleLookup = (numToSearch?: string) => {
    const target = numToSearch !== undefined ? numToSearch : phoneNumber;
    if (!target.trim()) return;

    soundFX.playScanPing();
    setIsScanning(true);

    setTimeout(() => {
      const result = lookupMobileNumberLiveIntel(target);
      setLookupResult(result);
      setIsScanning(false);
      soundFX.playConfirm();
      if (onTrackAnother) onTrackAnother(target);
    }, 600);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundFX.playConfirm();
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${lookupResult.approxCoordinates.lat.toFixed(6)},${lookupResult.approxCoordinates.lng.toFixed(6)}`;
  const embedMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(lookupResult.approxCoordinates.lng - 0.08).toFixed(4)}%2C${(lookupResult.approxCoordinates.lat - 0.08).toFixed(4)}%2C${(lookupResult.approxCoordinates.lng + 0.08).toFixed(4)}%2C${(lookupResult.approxCoordinates.lat + 0.08).toFixed(4)}&layer=mapnik&marker=${lookupResult.approxCoordinates.lat.toFixed(6)}%2C${lookupResult.approxCoordinates.lng.toFixed(6)}`;

  // Quick preset phone numbers
  const PRESETS = [
    { label: 'MP Circle', num: '9826012345' },
    { label: 'Delhi NCR', num: '9810012345' },
    { label: 'Mumbai Metro', num: '9820012345' },
    { label: 'Police Control', num: '112' },
  ];

  return (
    <div className="w-full bg-slate-950/95 border border-red-500/50 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.2)] font-mono text-xs my-3">
      {/* Top Banner HUD */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-950/90 via-slate-950 to-slate-950 border-b border-red-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2 text-red-300 font-bold">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute" />
            <Radio className="w-4 h-4 text-red-400 z-10" />
          </div>
          <div>
            <div className="text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>DEVIL MOBILE NUMBER RADAR</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-900/60 border border-red-500/40 text-red-300">
                LIVE INTEL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              मोबाइल नंबर लोकेशन ट्रैकर, टेलीकॉम सर्कल व सेल-टावर डेटा
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            HLR ACTIVE
          </span>
        </div>
      </div>

      {/* Interactive Number Search Form */}
      <div className="p-3.5 bg-slate-900/70 border-b border-red-900/40 space-y-2.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="w-4 h-4 text-red-400 absolute left-3 top-2.5" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="10 अंकों का मोबाइल नंबर डालें (e.g. 9826012345)..."
              className="w-full bg-slate-950 border border-red-800/70 focus:border-red-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none shadow-inner"
            />
          </div>

          <button
            onClick={() => handleLookup()}
            disabled={isScanning}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-red-900/50"
          >
            {isScanning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>SCANNING</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>TRACK NUMBER</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-[10px] text-slate-400 shrink-0 uppercase tracking-wider">PRESETS:</span>
          {PRESETS.map((p) => (
            <button
              key={p.num}
              onClick={() => {
                setPhoneNumber(p.num);
                handleLookup(p.num);
              }}
              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 hover:border-red-500/60 text-slate-300 hover:text-red-300 transition shrink-0"
            >
              {p.label} ({p.num})
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/80 px-2 text-[11px]">
        <button
          onClick={() => setTrackingMode('radar')}
          className={`flex-1 py-2 text-center font-bold transition border-b-2 flex items-center justify-center gap-1.5 ${
            trackingMode === 'radar'
              ? 'border-red-500 text-red-300 bg-red-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>RADAR MAP & INTEL</span>
        </button>
        <button
          onClick={() => setTrackingMode('whatsapp')}
          className={`flex-1 py-2 text-center font-bold transition border-b-2 flex items-center justify-center gap-1.5 ${
            trackingMode === 'whatsapp'
              ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>LIVE GPS SHARING</span>
        </button>
        <button
          onClick={() => setTrackingMode('legal')}
          className={`flex-1 py-2 text-center font-bold transition border-b-2 flex items-center justify-center gap-1.5 ${
            trackingMode === 'legal'
              ? 'border-amber-500 text-amber-300 bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>LEGAL & POLICE SOS</span>
        </button>
      </div>

      {/* Tab 1: Radar Map & Operator Intelligence */}
      {trackingMode === 'radar' && (
        <div className="space-y-3 p-3.5">
          {/* Tactical Map Container */}
          <div className="relative w-full h-48 bg-slate-900 rounded-xl overflow-hidden border border-red-500/40 shadow-inner">
            <iframe
              title="Mobile Location Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={embedMapUrl}
              className="opacity-80 contrast-125 saturate-150 filter"
            />

            {/* Futuristic Triangulation Overlay */}
            <div className="absolute inset-0 pointer-events-none border border-red-500/20 bg-gradient-to-b from-transparent via-red-950/10 to-slate-950/90 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-red-500/50 animate-ping absolute" />
              <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.9)]">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>

              {/* Crosshair lines */}
              <div className="w-full h-px bg-red-500/20 absolute" />
              <div className="h-full w-px bg-red-500/20 absolute" />
            </div>

            {/* Live Badges on Map */}
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-slate-950/90 border border-red-500/50 text-[10px] text-red-300 backdrop-blur-md flex items-center gap-1.5 shadow-md">
              <Signal className="w-3 h-3 text-red-400" />
              <span className="font-bold">{lookupResult.operator}</span>
            </div>

            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-slate-950/90 border border-red-500/40 text-[10px] text-slate-300 backdrop-blur-md flex items-center gap-1">
              <Building className="w-3 h-3 text-cyan-400" />
              <span>Circle: {lookupResult.circle} ({lookupResult.state})</span>
            </div>

            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-slate-950/90 border border-amber-500/40 text-[10px] text-amber-300 backdrop-blur-md">
              Tower Radius: ~{lookupResult.approxCoordinates.accuracyKm}km
            </div>
          </div>

          {/* Telemetry Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">TARGET NUMBER</span>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-xs">{lookupResult.formattedNumber}</span>
                <button
                  onClick={() => handleCopy(lookupResult.formattedNumber)}
                  className="p-1 text-slate-400 hover:text-red-300"
                  title="Copy Number"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <span className="text-[10px] text-emerald-400 block">● {lookupResult.liveStatus}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">TELECOM OPERATOR</span>
              <span className="text-cyan-300 font-bold block truncate">{lookupResult.operator}</span>
              <span className="text-[10px] text-slate-400 block">{lookupResult.signalType}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">TELECOM CIRCLE / REGION</span>
              <span className="text-amber-300 font-bold block">{lookupResult.circle}</span>
              <span className="text-[10px] text-slate-400 block">{lookupResult.state}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">CYBER SAFETY / SPAM</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      lookupResult.cyberSafetyScore > 70
                        ? 'bg-emerald-500'
                        : lookupResult.cyberSafetyScore > 40
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${lookupResult.cyberSafetyScore}%` }}
                  />
                </div>
                <span className="text-white font-bold text-[10px]">{lookupResult.cyberSafetyScore}%</span>
              </div>
              <span className="text-[9px] text-slate-400 block">
                {lookupResult.reportedSpamCount > 0 ? `⚠️ ${lookupResult.reportedSpamCount} reports` : '✅ Clean Record'}
              </span>
            </div>
          </div>

          {/* Coordinates Details & External Map Trigger */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[9px] uppercase tracking-wider block">CELL TOWER COORDINATES</span>
                <span className="text-slate-200 font-mono text-[11px]">
                  {lookupResult.approxCoordinates.lat.toFixed(5)}° N, {lookupResult.approxCoordinates.lng.toFixed(5)}° E
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  handleCopy(
                    `${lookupResult.approxCoordinates.lat.toFixed(6)}, ${lookupResult.approxCoordinates.lng.toFixed(6)}`
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] transition flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>COORDS</span>
              </button>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFX.playConfirm()}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] transition flex items-center gap-1 shadow-md shadow-red-900/40"
              >
                <ExternalLink className="w-3 h-3" />
                <span>OPEN GOOGLE MAPS</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live GPS Real-Time Sharing Guide (WhatsApp / Google Maps) */}
      {trackingMode === 'whatsapp' && (
        <div className="p-3.5 space-y-3 font-sans text-xs">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>How To Track Real-Time Live Movement (लाइव लोकेशन कैसे ट्रैक करें)</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              टेलीकॉम टावर केवल 1-3 किमी का अनुमानित दायरा बताता है। यदि आप किसी परिवार के सदस्य या दोस्त की 
              <strong> 1-मीटर सटीक लाइव मूवमेंट (Real-Time GPS)</strong> ट्रैक करना चाहते हैं, तो वे 1-टैप में आपसे लाइव लोकेशन शेयर कर सकते हैं:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-200">
            {/* Method A: WhatsApp */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-mono text-[10px]">1</span>
                <span>WhatsApp Live Location (15m / 1h / 8h)</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li>फोन पर WhatsApp चैट खोलें।</li>
                <li>Paperclip 📎 आइकन दबाकर <strong>Location</strong> चुनें।</li>
                <li><strong>"Share Live Location"</strong> पर टैप करके समय (1 Hour या 8 Hours) चुनें।</li>
                <li>आपको स्क्रीन पर उनकी लाइव गति (चलना/गाड़ी) सीधे दिखाई देगी।</li>
              </ol>
            </div>

            {/* Method B: Google Maps */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-mono text-[10px]">2</span>
                <span>Google Maps Real-Time Location Sharing</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li>Google Maps खोलें और प्रोफाइल फोटो पर टैप करें।</li>
                <li><strong>"Location Sharing"</strong> चुनें।</li>
                <li><strong>"Share location"</strong> दबाकर अपना फोन नंबर या लिंक भेजें।</li>
                <li>बैटरी प्रतिशत और रियल-टाइम स्पीड दोनों दिखते हैं।</li>
              </ol>
            </div>
          </div>

          {/* Quick Direct Link to Google Maps Location Sharing */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px]">
            <span className="text-slate-300">Open Google Maps Location Sharing:</span>
            <a
              href="https://maps.google.com/location-sharing"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playConfirm()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3 h-3" />
              <span>LAUNCH SHARING PORTAL</span>
            </a>
          </div>
        </div>
      )}

      {/* Tab 3: Legal Intel & Cyber Police SOS */}
      {trackingMode === 'legal' && (
        <div className="p-3.5 space-y-3 font-sans text-xs">
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>कानूनी नियम एवं पुलिस ट्रैकिंग अधिकार (Legal Disclaimer & Cyber Law)</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {lookupResult.legalIntel.legalNote}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-3 rounded-xl bg-slate-900 border border-red-900/60 space-y-1">
              <span className="text-red-400 font-bold uppercase tracking-wider block">🚨 राष्ट्रीय आपातकालीन नंबर (POLICE 112)</span>
              <p className="text-slate-300 text-[10px] font-sans">
                यदि कोई व्यक्ति गुमशुदा (Missing Person) या खतरे में है, तो तुरंत 112 पर कॉल करें। पुलिस टेलीकॉम नोडल ऑफिसर से सेल-टावर CDR और लाइव लोकेशन प्राप्त करती है।
              </p>
              <a
                href="tel:112"
                onClick={() => soundFX.playWarning()}
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-[10px] transition mt-1"
              >
                <Phone className="w-3 h-3" />
                <span>DIAL 112 NOW</span>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-cyan-900/60 space-y-1">
              <span className="text-cyan-400 font-bold uppercase tracking-wider block">🛡️ राष्ट्रीय साइबर अपराध हेल्पलाइन (1930)</span>
              <p className="text-slate-300 text-[10px] font-sans">
                अज्ञात नंबर से फ्रॉड, ब्लैकमेल या साइबर धमकी मिलने पर तुरंत 1930 पर शिकायत दर्ज करें या cybercrime.gov.in पर रिपोर्ट करें।
              </p>
              <a
                href="tel:1930"
                onClick={() => soundFX.playWarning()}
                className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-[10px] transition mt-1"
              >
                <Phone className="w-3 h-3" />
                <span>DIAL 1930 CYBER CELL</span>
              </a>
            </div>
          </div>

          {/* Official CEIR Sanchar Saathi Portal */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold text-xs block">
                  संचार साथी (Sanchar Saathi) - खोया हुआ मोबाइल ब्लॉक और ट्रैक करें
                </span>
                <span className="text-slate-400 text-[10px] block font-mono">
                  DoT Government of India Central Equipment Identity Register (CEIR)
                </span>
              </div>
              <a
                href="https://sancharsaathi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono transition flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>SANCHAR SAATHI</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
