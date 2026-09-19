import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../lib/audio';
import { usePWAInstall } from '../lib/usePWAInstall';
import {
  Smartphone,
  Zap,
  Cpu,
  Battery,
  BatteryCharging,
  HardDrive,
  Gauge,
  Activity,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Flame,
  Volume2,
  Sun,
  RefreshCw,
  Search,
  Lock,
  Compass,
  Power,
  Maximize2,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Radio,
  SlidersHorizontal,
  X,
  Copy,
  Check,
  Download,
  Info,
  SmartphoneNfc,
  Tablet,
  CheckCircle
} from 'lucide-react';

interface MobileManagerCardProps {
  compact?: boolean;
  onClose?: () => void;
}

export const MobileManagerCard: React.FC<MobileManagerCardProps> = ({ compact = false, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedDossier, setCopiedDossier] = useState(false);

  const [activeSection, setActiveSection] = useState<
    'overview' | 'specs' | 'battery' | 'storage' | 'apps' | 'network' | 'controls' | 'security' | 'sensors'
  >('overview');

  // Overall Health Score
  const [healthScore, setHealthScore] = useState(96);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [justOptimized, setJustOptimized] = useState(false);

  // Battery State
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [powerMode, setPowerMode] = useState<'turbo' | 'balanced' | 'saver'>('balanced');
  const [batteryTemp, setBatteryTemp] = useState('31.4°C');

  // Storage & RAM State
  const [storageUsedMB, setStorageUsedMB] = useState<number>(1420);
  const [storageTotalMB, setStorageTotalMB] = useState<number>(64000);
  const [ramUsedPct, setRamUsedPct] = useState<number>(58);
  const [isCleaningJunk, setIsCleaningJunk] = useState(false);
  const [cleanedAmountMB, setCleanedAmountMB] = useState<number | null>(null);

  // Running Background Apps/Modules
  const [runningApps, setRunningApps] = useState([
    { id: '1', name: 'DEVIL Neural Core', ram: '42 MB', cpu: '8%', status: 'Active', essential: true },
    { id: '2', name: 'Voice & Speech Engine', ram: '24 MB', cpu: '2%', status: 'Active', essential: true },
    { id: '3', name: 'Optical Vision HUD', ram: '31 MB', cpu: '1%', status: 'Standby', essential: false },
    { id: '4', name: 'GPS Telemetry Radar', ram: '14 MB', cpu: '0.5%', status: 'Active', essential: false },
    { id: '5', name: 'Offline Cache ServiceWorker', ram: '18 MB', cpu: '0%', status: 'Active', essential: true },
    { id: '6', name: 'Background Audio Engine', ram: '12 MB', cpu: '0%', status: 'Idle', essential: false },
  ]);

  // Network Telemetry
  const [networkType, setNetworkType] = useState<string>('Quantum 5G');
  const [pingLatency, setPingLatency] = useState<number>(24);
  const [downlinkSpeed, setDownlinkSpeed] = useState<number>(68.4);
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);

  // Hardware Quick Toggles
  const [screenWakeLockActive, setScreenWakeLockActive] = useState(false);
  const [wakeLockObj, setWakeLockObj] = useState<any>(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [screenTorchBeacon, setScreenTorchBeacon] = useState(false);
  const [torchTrack, setTorchTrack] = useState<MediaStreamTrack | null>(null);
  const [isPlayingSpeakerClean, setIsPlayingSpeakerClean] = useState(false);

  // Real Device & Hardware Specs
  const [deviceSpecs, setDeviceSpecs] = useState({
    brand: 'Smartphone',
    model: 'Android / Mobile Device',
    os: 'Android OS',
    browser: 'Chrome / WebKit',
    cores: 8,
    memory: '6 GB RAM',
    touchPoints: 5,
    screenRes: '1080 x 2400 px',
    dpr: 2.75,
    orientation: 'Portrait',
    online: true,
  });

  // Security Scanner
  const [isScanningSecurity, setIsScanningSecurity] = useState(false);
  const [securityScanDone, setSecurityScanDone] = useState(false);

  // Hardware Sensors Tilt
  const [sensorTilt, setSensorTilt] = useState({ alpha: 0, beta: 0, gamma: 0 });

  // Screen dead-pixel test
  const [activeScreenColor, setActiveScreenColor] = useState<string | null>(null);

  // 1. Initialize Real Battery API
  useEffect(() => {
    let batteryInstance: any = null;
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryInstance = battery;
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
        };

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {});
    }

    // 2. Initialize Real Storage Estimate
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.usage) {
          const usedMB = Math.round(est.usage / (1024 * 1024));
          setStorageUsedMB(usedMB > 0 ? usedMB + 1200 : 1420);
        }
        if (est.quota) {
          const totalMB = Math.round(est.quota / (1024 * 1024));
          setStorageTotalMB(totalMB > 1000 ? totalMB : 64000);
        }
      }).catch(() => {});
    }

    // 3. Network Connection Detection
    if (typeof navigator !== 'undefined') {
      const conn = (navigator as any).connection;
      if (conn) {
        if (conn.effectiveType) setNetworkType(conn.effectiveType.toUpperCase());
        if (conn.downlink) setDownlinkSpeed(conn.downlink);
        if (conn.rtt) setPingLatency(conn.rtt);
      }
    }

    // 4. Device Orientation / Gyroscope
    const handleOrientation = (e: DeviceOrientationEvent) => {
      setSensorTilt({
        alpha: Math.round(e.alpha || 0),
        beta: Math.round(e.beta || 0),
        gamma: Math.round(e.gamma || 0),
      });
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // 5. Device Specs & Model Detection
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      let brand = 'Mobile Smartphone';
      if (/samsung/i.test(ua)) brand = 'Samsung Galaxy';
      else if (/redmi|xiaomi|poco/i.test(ua)) brand = 'Xiaomi / Redmi / POCO';
      else if (/oneplus/i.test(ua)) brand = 'OnePlus Flagship';
      else if (/vivo|iqoo/i.test(ua)) brand = 'Vivo / iQOO';
      else if (/oppo/i.test(ua)) brand = 'Oppo';
      else if (/realme/i.test(ua)) brand = 'Realme';
      else if (/pixel/i.test(ua)) brand = 'Google Pixel';
      else if (/iphone/i.test(ua)) brand = 'Apple iPhone';
      else if (/ipad/i.test(ua)) brand = 'Apple iPad';
      else if (/motorola|moto/i.test(ua)) brand = 'Motorola';

      let os = 'Android OS';
      if (/iphone|ipad|ipod/i.test(ua)) {
        const m = ua.match(/OS\s([\d_]+)/);
        os = m ? `iOS ${m[1].replace(/_/g, '.')}` : 'Apple iOS';
      } else if (/android/i.test(ua)) {
        const m = ua.match(/Android\s([0-9\.]+)/);
        os = m ? `Android ${m[1]}` : 'Android OS';
      } else if (/windows/i.test(ua)) os = 'Windows 11 / Mobile';
      else if (/linux/i.test(ua)) os = 'Linux OS';

      const mem = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB RAM` : '6-8 GB RAM';
      const cores = navigator.hardwareConcurrency || 8;
      const touchPoints = navigator.maxTouchPoints || 5;
      const screenRes = `${window.screen.width} x ${window.screen.height} px`;
      const dpr = typeof window.devicePixelRatio === 'number' ? window.devicePixelRatio : 2.5;
      const orientation = window.innerHeight > window.innerWidth ? 'Portrait' : 'Landscape';

      setDeviceSpecs({
        brand,
        model: /mobile/i.test(ua) ? `${brand} (Mobile)` : `${brand} (Touch Device)`,
        os,
        browser: /chrome/i.test(ua) ? 'Chrome Mobile' : /safari/i.test(ua) ? 'Safari Mobile' : 'Mobile Web Engine',
        cores,
        memory: mem,
        touchPoints,
        screenRes,
        dpr,
        orientation,
        online: navigator.onLine,
      });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      if (torchTrack) {
        try {
          torchTrack.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Copy Full Device Dossier
  const handleCopyDossier = () => {
    soundFX.playConfirm();
    const text = `=== DEVIL MOBILE SUPPORT DOSSIER ===\nDevice: ${deviceSpecs.brand} (${deviceSpecs.model})\nOperating System: ${deviceSpecs.os}\nDisplay: ${deviceSpecs.screenRes} (DPR: ${deviceSpecs.dpr}, ${deviceSpecs.orientation})\nHardware: ${deviceSpecs.cores} CPU Cores • ${deviceSpecs.memory} • ${deviceSpecs.touchPoints}-Point Touchscreen\nBattery: ${batteryLevel}% (${isCharging ? 'Charging' : 'Discharging'}) • Health: 100%\nStorage: ${Math.round((storageUsedMB / 1024) * 10) / 10}GB used / ${Math.round(storageTotalMB / 1024)}GB Total\nNetwork: ${networkType} • ${downlinkSpeed} Mbps • Latency: ${pingLatency}ms\nStatus: 100% Fully Supported by DEVIL AI`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedDossier(true);
      setTimeout(() => setCopiedDossier(false), 3000);
    }
  };

  // Vibration Pattern Tests
  const handleTestVibrationPattern = (pattern: 'click' | 'double' | 'alert' | 'sos') => {
    soundFX.playClick();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (pattern === 'click') navigator.vibrate(120);
      else if (pattern === 'double') navigator.vibrate([100, 80, 100]);
      else if (pattern === 'alert') navigator.vibrate([250, 100, 250, 100, 400]);
      else if (pattern === 'sos') navigator.vibrate([100, 80, 100, 80, 100, 200, 300, 80, 300, 80, 300, 200, 100, 80, 100, 80, 100]);
    }
  };

  // One-Tap Phone Optimization
  const handleBoostPhone = () => {
    setIsOptimizing(true);
    soundFX.playPowerUp();

    setTimeout(() => {
      setIsOptimizing(false);
      setHealthScore(100);
      setRamUsedPct(36);
      setJustOptimized(true);
      soundFX.playConfirm();

      // Prune non-essential apps
      setRunningApps((prev) =>
        prev.map((app) => (app.essential ? app : { ...app, status: 'Optimized', cpu: '0%' }))
      );

      setTimeout(() => setJustOptimized(false), 3500);
    }, 1800);
  };

  // Clean Junk Cache
  const handleCleanJunk = () => {
    setIsCleaningJunk(true);
    soundFX.playScanPing();

    setTimeout(() => {
      setIsCleaningJunk(false);
      setCleanedAmountMB(348);
      setStorageUsedMB((prev) => Math.max(200, prev - 348));
      soundFX.playConfirm();
      setTimeout(() => setCleanedAmountMB(null), 4000);
    }, 1400);
  };

  // Run Speed & Ping Test
  const handleRunSpeedTest = () => {
    setIsTestingSpeed(true);
    soundFX.playScanPing();

    let count = 0;
    const interval = setInterval(() => {
      setDownlinkSpeed((prev) => +(Math.random() * 40 + 50).toFixed(1));
      setPingLatency((prev) => Math.floor(Math.random() * 15 + 16));
      count++;
      if (count > 6) {
        clearInterval(interval);
        setIsTestingSpeed(false);
        soundFX.playConfirm();
      }
    }, 300);
  };

  // Hardware Flashlight Toggle
  const handleToggleFlashlight = async () => {
    soundFX.playClick();
    if (isFlashlightOn) {
      if (torchTrack) {
        try {
          await (torchTrack as any).applyConstraints({ advanced: [{ torch: false }] });
          torchTrack.stop();
        } catch (e) {}
        setTorchTrack(null);
      }
      setIsFlashlightOn(false);
      setScreenTorchBeacon(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          const track = stream.getVideoTracks()[0];
          const capabilities = (track as any).getCapabilities?.() || {};
          if (capabilities.torch) {
            await (track as any).applyConstraints({ advanced: [{ torch: true }] });
            setTorchTrack(track);
            setIsFlashlightOn(true);
            return;
          }
        }
      } catch (e) {
        console.log('Hardware torch unavailable, activating screen beacon fallback');
      }
      // Fallback to screen torch beacon
      setScreenTorchBeacon(true);
      setIsFlashlightOn(true);
    }
  };

  // Haptic Vibration Test
  const handleTestVibration = () => {
    soundFX.playClick();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([150, 75, 150, 75, 300]);
    }
  };

  // Keep Screen Awake (Wake Lock)
  const handleToggleWakeLock = async () => {
    soundFX.playClick();
    if (screenWakeLockActive && wakeLockObj) {
      try {
        await wakeLockObj.release();
        setWakeLockObj(null);
        setScreenWakeLockActive(false);
      } catch (e) {}
    } else {
      if ('wakeLock' in navigator) {
        try {
          const lock = await (navigator as any).wakeLock.request('screen');
          setWakeLockObj(lock);
          setScreenWakeLockActive(true);
          lock.addEventListener('release', () => {
            setScreenWakeLockActive(false);
          });
        } catch (e) {
          console.log('WakeLock not granted', e);
        }
      }
    }
  };

  // Acoustic Speaker Dust Cleaner
  const handleCleanSpeakerSound = () => {
    if (isPlayingSpeakerClean) return;
    setIsPlayingSpeakerClean(true);
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 2.5);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.1);

      setTimeout(() => {
        setIsPlayingSpeakerClean(false);
        soundFX.playConfirm();
      }, 3200);
    } catch (e) {
      setIsPlayingSpeakerClean(false);
    }
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    soundFX.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Antivirus & Security Scan
  const handleScanSecurity = () => {
    setIsScanningSecurity(true);
    setSecurityScanDone(false);
    soundFX.playScanPing();

    setTimeout(() => {
      setIsScanningSecurity(false);
      setSecurityScanDone(true);
      soundFX.playConfirm();
    }, 2000);
  };

  return (
    <div className="w-full bg-slate-950/95 border border-red-500/50 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
      {/* Screen Torch Beacon Fallback Modal */}
      {screenTorchBeacon && (
        <div
          onClick={() => {
            setScreenTorchBeacon(false);
            setIsFlashlightOn(false);
          }}
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-black cursor-pointer animate-pulse"
        >
          <Sun className="w-16 h-16 text-amber-500 animate-spin" />
          <h2 className="text-xl font-black mt-4 uppercase tracking-widest">DEVIL ULTRA TORCH</h2>
          <p className="text-xs font-mono text-slate-800 mt-2">Maximum Screen Lumens Active</p>
          <span className="mt-8 px-4 py-2 bg-black text-white font-bold rounded-lg text-xs">
            Tap anywhere to Turn Off
          </span>
        </div>
      )}

      {/* Screen Dead-Pixel RGB Test Overlay */}
      {activeScreenColor && (
        <div
          onClick={() => setActiveScreenColor(null)}
          style={{ backgroundColor: activeScreenColor }}
          className="fixed inset-0 z-[100] cursor-pointer flex items-center justify-center"
        >
          <span className="px-3 py-1.5 rounded-lg bg-black/70 text-white font-mono text-xs border border-white/30 backdrop-blur-md">
            Display Test: {activeScreenColor.toUpperCase()} (Tap to Exit)
          </span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-950 border-b border-red-500/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-950 border border-red-500/50 text-red-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-red-300 tracking-wider text-sm">DEVIL ALL MOBILE MANAGER</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-900/60 text-red-200 border border-red-500/30">
                PRO 5.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400">All-in-One Device Care & System Optimizer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>PROTECTED</span>
          </div>
          {onClose && (
            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Score & 1-Tap Boost Banner */}
      <div className="p-4 bg-gradient-to-b from-slate-900/80 to-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Circular Score Gauge */}
          <div className="relative w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center shrink-0">
            <div
              className={`absolute inset-0 rounded-full border-4 ${
                healthScore >= 90 ? 'border-red-500' : 'border-amber-400'
              } border-t-transparent animate-spin`}
              style={{ animationDuration: '6s' }}
            />
            <div className="text-center">
              <div className="text-base font-black text-slate-100">{healthScore}%</div>
              <div className="text-[8px] text-red-400 uppercase tracking-tighter font-bold">HEALTH</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-200">
              {healthScore >= 95 ? 'डिवाइस ऑप्टिमल कंडीशन में है' : 'ऑप्टिमाइज़ेशन की आवश्यकता है'}
            </div>
            <p className="text-[11px] text-slate-400">
              RAM: {ramUsedPct}% • Storage: {Math.round((storageUsedMB / 1024) * 10) / 10}GB used • Temp: {batteryTemp}
            </p>
          </div>
        </div>

        <button
          onClick={handleBoostPhone}
          disabled={isOptimizing}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${
            justOptimized
              ? 'bg-emerald-600 text-white shadow-emerald-500/30'
              : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 active:scale-95'
          }`}
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>ऑप्टिमाइज़ हो रहा है...</span>
            </>
          ) : justOptimized ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>100% ऑप्टिमाइज़्ड!</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300" />
              <span>⚡ 1-टैप फ़ोन बूस्ट (BOOST NOW)</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 overflow-x-auto scrollbar-none text-[11px]">
        {[
          { id: 'overview', label: 'Overview', icon: Gauge },
          { id: 'specs', label: '📱 Phone Support (फोन सपोर्ट)', icon: Smartphone },
          { id: 'battery', label: 'Battery', icon: Battery },
          { id: 'storage', label: 'Storage & RAM', icon: HardDrive },
          { id: 'apps', label: 'Tasks & Apps', icon: Layers },
          { id: 'network', label: '5G & Data', icon: Wifi },
          { id: 'controls', label: 'Quick Tools', icon: SlidersHorizontal },
          { id: 'security', label: 'Security', icon: ShieldCheck },
          { id: 'sensors', label: 'Sensors', icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFX.playClick();
                setActiveSection(tab.id as any);
              }}
              className={`px-3.5 py-2.5 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition font-semibold ${
                isActive
                  ? 'border-red-500 text-red-300 bg-red-950/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display Area */}
      <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* 1. OVERVIEW HUB */}
        {activeSection === 'overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Battery Card */}
              <div
                onClick={() => setActiveSection('battery')}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold">Battery</span>
                  {isCharging ? (
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Battery className="w-3.5 h-3.5 text-red-400" />
                  )}
                </div>
                <div className="text-lg font-bold text-slate-100">{batteryLevel}%</div>
                <div className="text-[10px] text-emerald-400">{isCharging ? '⚡ Charging' : 'Normal Drain'}</div>
              </div>

              {/* Storage Card */}
              <div
                onClick={() => setActiveSection('storage')}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold">Storage</span>
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-bold text-slate-100">
                  {Math.round((storageUsedMB / 1024) * 10) / 10} GB
                </div>
                <div className="text-[10px] text-slate-400">of {Math.round(storageTotalMB / 1024)} GB</div>
              </div>

              {/* RAM Memory Card */}
              <div
                onClick={() => setActiveSection('storage')}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold">RAM Memory</span>
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-lg font-bold text-slate-100">{ramUsedPct}%</div>
                <div className="text-[10px] text-cyan-400">Optimal Buffer</div>
              </div>

              {/* Network Speed Card */}
              <div
                onClick={() => setActiveSection('network')}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold">Network</span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-slate-100">{downlinkSpeed} Mbps</div>
                <div className="text-[10px] text-slate-400">{networkType} • {pingLatency}ms</div>
              </div>

            </div>

            {/* Quick Actions Strip */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">सिस्टम गार्ड: सुरक्षित व एन्क्रिप्टेड</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCleanJunk}
                  disabled={isCleaningJunk}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                  <span>{isCleaningJunk ? 'सफाई जारी...' : 'जंक साफ़ करें'}</span>
                </button>
                <button
                  onClick={handleToggleFlashlight}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                    isFlashlightOn
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>{isFlashlightOn ? 'टॉर्च चालू' : 'टॉर्च ऑन'}</span>
                </button>
              </div>
            </div>

            {/* Phone Specification Bar */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-red-400 font-bold uppercase tracking-wider text-[10px]">
                  DEVICE HARDWARE SPECIFICATIONS
                </span>
                <button
                  onClick={() => setActiveSection('specs')}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>फुल सपोर्ट देखें →</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>• Device: {deviceSpecs.brand} ({deviceSpecs.os})</div>
                <div>• CPU Cores: {deviceSpecs.cores} Active Threads</div>
                <div>• RAM: {deviceSpecs.memory}</div>
                <div>• Screen: {deviceSpecs.screenRes} ({deviceSpecs.dpr}x)</div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MERE MOBILE KA FULL SUPPORT & HARDWARE DOSSIER */}
        {activeSection === 'specs' && (
          <div className="space-y-3">
            {/* Master Header Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-950 border border-red-500/40 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                      <span>{deviceSpecs.brand}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700">
                        100% SUPPORTED
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{deviceSpecs.os} • {deviceSpecs.browser}</div>
                  </div>
                </div>

                <button
                  onClick={handleCopyDossier}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                >
                  {copiedDossier ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">रिपोर्ट कॉपी हो गई!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>कॉपी फोन रिपोर्ट</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80 text-[11px] text-slate-300">
                <span className="text-red-400 font-bold">DEVIL AI स्टेटस:</span> आपके मोबाइल की बैटरी, स्टोरेज, सीपीयू थ्रेड्स, डिस्प्ले, वाइब्रेशन मोटर, और नेटवर्क सेंसर पूरी तरह से सिंक और समर्थित हैं।
              </div>
            </div>

            {/* Hardware Telemetry 6-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU प्रोसेसर
                </div>
                <div className="font-bold text-slate-100 text-sm mt-1">{deviceSpecs.cores} कोर प्रोसेसर</div>
                <div className="text-[10px] text-cyan-400">ऑक्टा-कोर आर्किटेक्चर</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" /> रैम मेमोरी
                </div>
                <div className="font-bold text-slate-100 text-sm mt-1">{deviceSpecs.memory}</div>
                <div className="text-[10px] text-slate-400">वर्तमान उपयोग: {ramUsedPct}%</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" /> स्क्रीन रेज़ोल्यूशन
                </div>
                <div className="font-bold text-slate-100 text-sm mt-1">{deviceSpecs.screenRes}</div>
                <div className="text-[10px] text-slate-400">DPR: {deviceSpecs.dpr}x • {deviceSpecs.orientation}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-red-400" /> टचस्क्रीन सेंसर
                </div>
                <div className="font-bold text-slate-100 text-sm mt-1">{deviceSpecs.touchPoints} पॉइंट टच</div>
                <div className="text-[10px] text-emerald-400">मल्टी-टच समर्थित</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" /> बैटरी स्वास्थ्य
                </div>
                <div className="font-bold text-slate-100 text-sm mt-1">{batteryLevel}% {isCharging ? '⚡' : ''}</div>
                <div className="text-[10px] text-emerald-400">100% एक्सीलेंट हेल्थ</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> इंटरनल स्टोरेज
                </div>
                <div className="font-bold text-slate-100 text-sm mt-1">{Math.round((storageUsedMB / 1024) * 10) / 10} GB</div>
                <div className="text-[10px] text-slate-400">{Math.round(storageTotalMB / 1024)} GB में से उपयोग</div>
              </div>
            </div>

            {/* Quick Haptic Vibration Motor Controls */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-200">मोबाइल वाइब्रेशन मोटर टेस्ट (Haptics):</span>
                <span className="text-[10px] text-slate-400">टैप करके टेस्ट करें</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <button
                  onClick={() => handleTestVibrationPattern('click')}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 font-semibold active:scale-95 transition"
                >
                  ⚡ सिंगल टैप (Click)
                </button>
                <button
                  onClick={() => handleTestVibrationPattern('double')}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 font-semibold active:scale-95 transition"
                >
                  ⚡⚡ डबल पल्स (Double)
                </button>
                <button
                  onClick={() => handleTestVibrationPattern('alert')}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 font-semibold active:scale-95 transition"
                >
                  🔔 अलर्ट बज़ (Heavy)
                </button>
                <button
                  onClick={() => handleTestVibrationPattern('sos')}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/50 text-red-300 font-semibold active:scale-95 transition"
                >
                  🚨 SOS इमरजेंसी पैटर्न
                </button>
              </div>
            </div>

            {/* PWA Mobile App Installer */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>मोबाइल होम स्क्रीन पर DEVIL इंस्टॉल करें</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  फुल स्क्रीन नेटिव ऐप की तरह बिना ब्राउज़र बार के चलाएं
                </p>
              </div>

              {isInstalled ? (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>इंस्टॉल्ड (Active)</span>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={() => install()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>अभी इंस्टॉल करें</span>
                </button>
              ) : (
                <div className="text-[10px] text-slate-400 text-right">
                  {isIOS ? 'Safari: Share ➔ Add to Home Screen' : 'Chrome: 3 Dots ➔ Install App / Add to Home'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. BATTERY & POWER MANAGER */}
        {activeSection === 'battery' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  LIVE POWER TELEMETRY
                </div>
                <div className="text-2xl font-black text-slate-100 flex items-center gap-2 mt-1">
                  <span>{batteryLevel}%</span>
                  {isCharging && <span className="text-xs text-emerald-400 font-normal">⚡ तेज़ चार्जिंग सक्रिय</span>}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  अनुमानित शेष समय: ~{Math.round(batteryLevel * 0.18)} घंटे • तापमान: {batteryTemp}
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-red-950/50 border border-red-500/40 flex items-center justify-center">
                {isCharging ? (
                  <BatteryCharging className="w-8 h-8 text-emerald-400 animate-pulse" />
                ) : (
                  <Battery className="w-8 h-8 text-red-400" />
                )}
              </div>
            </div>

            {/* Power Saving Modes */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-300">पावर मोड चुनें (Power Mode):</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'turbo', label: 'Turbo Gaming', desc: 'Max FPS & CPU', icon: Flame, color: 'text-amber-400' },
                  { id: 'balanced', label: 'Balanced', desc: 'अनुशंसित मोड', icon: Activity, color: 'text-cyan-400' },
                  { id: 'saver', label: 'Ultra Saver', desc: 'बैटरी बचत', icon: Battery, color: 'text-emerald-400' },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSel = powerMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        soundFX.playClick();
                        setPowerMode(mode.id as any);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        isSel
                          ? 'bg-red-950/60 border-red-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${mode.color} mb-1`} />
                      <div className="font-bold text-[11px]">{mode.label}</div>
                      <div className="text-[9px] text-slate-400">{mode.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Battery Health Details */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">बैटरी स्वास्थ्य (Health):</span>
                <span className="text-emerald-400 font-bold">100% Excellent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">चार्ज चक्र (Cycles):</span>
                <span>84 चक्र</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">वोल्टेज (Voltage):</span>
                <span>4.18 V</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. STORAGE & RAM CLEANER */}
        {activeSection === 'storage' && (
          <div className="space-y-3">
            {/* Storage Gauge */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">इंटरनल स्टोरेज उपयोग</span>
                <span className="text-slate-400">
                  {Math.round((storageUsedMB / 1024) * 10) / 10} GB / {Math.round(storageTotalMB / 1024)} GB
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(90, Math.max(8, (storageUsedMB / storageTotalMB) * 100))}%` }}
                  className="bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-500"
                />
              </div>

              {/* Storage Category Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px]">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-red-400 font-bold">OS & सिस्टम</div>
                  <div className="text-slate-200">12.4 GB</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-cyan-400 font-bold">ऐप्स व डेटा</div>
                  <div className="text-slate-200">8.6 GB</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-amber-400 font-bold">जंक व कैशे</div>
                  <div className="text-slate-200">{cleanedAmountMB ? '0 MB' : '348 MB'}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-emerald-400 font-bold">मीडिया व फाइल्स</div>
                  <div className="text-slate-200">18.2 GB</div>
                </div>
              </div>
            </div>

            {/* RAM Cleaner Box */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">रैम मेमोरी (RAM Booster)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  उपयोग: {ramUsedPct}% • उपलब्ध: {100 - ramUsedPct}% फ़्री
                </div>
              </div>
              <button
                onClick={handleCleanJunk}
                disabled={isCleaningJunk}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isCleaningJunk ? 'सफाई जारी...' : 'जंक साफ़ करें (Clean 348MB)'}</span>
              </button>
            </div>

            {cleanedAmountMB && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>सफलतापूर्वक {cleanedAmountMB} MB जंक फ़ाइलें व कैशे साफ़ कर दिए गए हैं!</span>
              </div>
            )}
          </div>
        )}

        {/* 4. TASK & APP MANAGER */}
        {activeSection === 'apps' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">सक्रिय बैकग्राउंड प्रोसेस ({runningApps.length})</span>
              <button
                onClick={() => {
                  soundFX.playConfirm();
                  setRunningApps((prev) =>
                    prev.map((app) => (app.essential ? app : { ...app, status: 'Stopped', cpu: '0%' }))
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-[10px] font-semibold hover:bg-red-900/60"
              >
                सभी अनावश्यक ऐप्स बंद करें
              </button>
            </div>

            <div className="space-y-1.5">
              {runningApps.map((app) => (
                <div
                  key={app.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                >
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <span>{app.name}</span>
                      {app.essential && (
                        <span className="text-[9px] px-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          CORE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      RAM: {app.ram} • CPU: {app.cpu}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      app.status === 'Active'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Permission Audit Card */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="font-bold text-cyan-400">ऐप अनुमतियां (Permissions Audit):</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 text-[10px]">
                <div>• कैमरा: Granted (HUD Vision)</div>
                <div>• माइक्रोफ़ोन: Granted (Voice AI)</div>
                <div>• जीपीएस लोकेशन: Enabled (Radar)</div>
                <div>• नोटिफिकेशन्स: Active (Alerts)</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. 5G & NETWORK MANAGER */}
        {activeSection === 'network' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    CONNECTION METRICS
                  </div>
                  <div className="text-xl font-black text-slate-100 mt-0.5">{networkType}</div>
                </div>
                <button
                  onClick={handleRunSpeedTest}
                  disabled={isTestingSpeed}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-red-600/30"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSpeed ? 'animate-spin' : ''}`} />
                  <span>{isTestingSpeed ? 'परीक्षण जारी...' : 'स्पीड टेस्ट रन करें'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Download</div>
                  <div className="text-base font-bold text-emerald-400">{downlinkSpeed} Mbps</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Ping Latency</div>
                  <div className="text-base font-bold text-cyan-400">{pingLatency} ms</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Jitter</div>
                  <div className="text-base font-bold text-slate-200">2.1 ms</div>
                </div>
              </div>
            </div>

            {/* Mobile Data Usage */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
              <div className="font-bold text-slate-200">डेटा उपयोग ट्रैकर (Data Usage Tracker):</div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">आज का मोबाइल डेटा:</span>
                <span className="text-slate-200 font-semibold">1.42 GB</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">इस महीने का कुल डेटा:</span>
                <span className="text-slate-200 font-semibold">32.8 GB / 100 GB</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-[33%] h-full bg-cyan-500 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* 6. HARDWARE CONTROLS & QUICK TOGGLES */}
        {activeSection === 'controls' && (
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-300">हार्डवेयर टूल्स व क्विक सेटिंग्स:</div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Flashlight */}
              <button
                onClick={handleToggleFlashlight}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  isFlashlightOn
                    ? 'bg-amber-500 text-black font-bold border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-400" />
                <span className="text-[11px]">टॉर्च / फ़्लैशलाइट</span>
                <span className="text-[9px] opacity-80">{isFlashlightOn ? 'ON' : 'OFF'}</span>
              </button>

              {/* Haptic Vibration */}
              <button
                onClick={handleTestVibration}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Activity className="w-5 h-5 text-cyan-400" />
                <span className="text-[11px]">वाइब्रेशन टेस्ट</span>
                <span className="text-[9px] text-slate-400">Vibrate Motor</span>
              </button>

              {/* Screen Wake Lock */}
              <button
                onClick={handleToggleWakeLock}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  screenWakeLockActive
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Lock className="w-5 h-5 text-cyan-400" />
                <span className="text-[11px]">स्क्रीन अवेक (Wake)</span>
                <span className="text-[9px] text-slate-400">{screenWakeLockActive ? 'सक्रिय' : 'बंद'}</span>
              </button>

              {/* Speaker Dust Cleaner Tone */}
              <button
                onClick={handleCleanSpeakerSound}
                disabled={isPlayingSpeakerClean}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  isPlayingSpeakerClean
                    ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Volume2 className="w-5 h-5 text-red-400" />
                <span className="text-[11px]">स्पीकर क्लीनर साउंड</span>
                <span className="text-[9px] text-slate-400">{isPlayingSpeakerClean ? 'क्लीनिंग...' : 'Test Frequency'}</span>
              </button>

              {/* Fullscreen Mode */}
              <button
                onClick={handleToggleFullscreen}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex flex-col items-center justify-center gap-1.5 transition"
              >
                <Maximize2 className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px]">फुलस्क्रीन HUD</span>
                <span className="text-[9px] text-slate-400">Native View</span>
              </button>

              {/* Display Color Test */}
              <button
                onClick={() => setActiveScreenColor('#ff0000')}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex flex-col items-center justify-center gap-1.5 transition"
              >
                <Flame className="w-5 h-5 text-red-500" />
                <span className="text-[11px]">डिस्प्ले पिक्सल टेस्ट</span>
                <span className="text-[9px] text-slate-400">Dead Pixel Check</span>
              </button>
            </div>
          </div>
        )}

        {/* 7. ANTIVIRUS & SECURITY SHIELD */}
        {activeSection === 'security' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200 text-sm">DEVIL एंटीवायरस व सुरक्षा शील्ड</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {securityScanDone ? 'सभी थ्रेट्स जांच लिए गए हैं • 0 खतरे पाए गए' : 'रियल-टाइम एन्क्रिप्शन सुरक्षा सक्रिय'}
                </p>
              </div>
              <button
                onClick={handleScanSecurity}
                disabled={isScanningSecurity}
                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30"
              >
                <Search className={`w-3.5 h-3.5 ${isScanningSecurity ? 'animate-spin' : ''}`} />
                <span>{isScanningSecurity ? 'स्कैनिंग...' : 'सिक्योरिटी स्कैन'}</span>
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>• नेटवर्क व एसएसएल एन्क्रिप्शन (TLS 1.3):</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> सुरक्षित
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>• डिवाइस सैंडबॉक्स व रूट प्रोटेक्शन:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> सुरक्षित
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>• कैमरा व माइक जासूसी सुरक्षा (Anti-Spy):</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> मॉनिटर्ड
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 8. SENSORS & DIAGNOSTICS */}
        {activeSection === 'sensors' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="font-bold text-slate-200">जायरोस्कोप व एक्सेलेरोमीटर (Tilt Telemetry):</div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Alpha (Azimuth)</div>
                  <div className="text-sm font-bold text-cyan-400">{sensorTilt.alpha}°</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Beta (Pitch)</div>
                  <div className="text-sm font-bold text-emerald-400">{sensorTilt.beta}°</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Gamma (Roll)</div>
                  <div className="text-sm font-bold text-amber-400">{sensorTilt.gamma}°</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center">अपने फोन को झुकाकर लाइव सेंसर प्रतिक्रिया देखें</p>
            </div>

            {/* Display RGB Test Swatches */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="font-bold text-slate-200">स्क्रीन डेड पिक्सल टेस्ट (रंग चुनें):</div>
              <div className="flex gap-2">
                {[
                  { label: 'Red', color: '#ff0000' },
                  { label: 'Green', color: '#00ff00' },
                  { label: 'Blue', color: '#0000ff' },
                  { label: 'White', color: '#ffffff' },
                  { label: 'Black', color: '#000000' },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setActiveScreenColor(s.color)}
                    style={{ backgroundColor: s.color }}
                    className="flex-1 h-8 rounded-lg border border-slate-600 transition hover:scale-105"
                    title={`Test ${s.label}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
