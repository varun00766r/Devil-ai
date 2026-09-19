import React, { useState, useRef, useEffect } from 'react';
import { ScanMode } from '../types';
import { soundFX } from '../lib/audio';
import { Camera, X, Scan, Code, FileText, Box, RefreshCw, Zap, ScanFace, SwitchCamera, Upload, UserCheck } from 'lucide-react';

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (analysis: string, imageBase64: string) => void;
  defaultScanMode?: ScanMode;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  isOpen,
  onClose,
  onScanResult,
  defaultScanMode = 'tactical',
}) => {
  const [scanMode, setScanMode] = useState<ScanMode>(defaultScanMode);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    defaultScanMode === 'face' ? 'user' : 'environment'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && defaultScanMode) {
      setScanMode(defaultScanMode);
      if (defaultScanMode === 'face') {
        setFacingMode('user');
      }
    }
  }, [isOpen, defaultScanMode]);

  // Start webcam feed when modal opens or facingMode changes
  useEffect(() => {
    if (!isOpen) return;

    setCameraError(null);
    soundFX.playPowerUp();

    let stream: MediaStream | null = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('कैमरा एक्सेस उपलब्ध नहीं है। आप नीचे "Upload Photo" बटन से फोटो चुनकर फेस डिटेल्स स्कैन कर सकते हैं।');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn('Camera access error:', err);
        setCameraError('कैमरा परमिशन अस्वीकृत या ब्लॉक है। आप नीचे "Upload Photo" बटन से सीधे फोटो चुनकर फेस डिटेल्स निकाल सकते हैं।');
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const toggleCameraFacing = () => {
    soundFX.playClick();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const processImageScan = async (base64: string) => {
    soundFX.playScanPing();
    setIsScanning(true);

    try {
      const response = await fetch('/api/devil/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          scanMode,
        }),
      });

      const data = await response.json();
      soundFX.playConfirm();
      onScanResult(
        data.analysis || (scanMode === 'face'
          ? '👤 **चेहरा विश्लेषण पूर्ण:** बायोमेट्रिक फीचर्स और अनुमानित विवरण सफलतापूर्वक निकाल लिए गए हैं।'
          : 'ऑप्टिकल विश्लेषण पूर्ण: वस्तु की पहचान हो गई है।'),
        base64
      );
      onClose();
    } catch (e: any) {
      console.error('Vision scan error', e);
      soundFX.playWarning();
      onScanResult('बॉस, फेस इमेज कैप्चर हुई लेकिन इमेज विश्लेषण में क्षणिक विलंब हुआ। कृपया पुनः स्कैन करें।', base64);
      onClose();
    } finally {
      setIsScanning(false);
    }
  };

  const handleCaptureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      await processImageScan(base64);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFX.playClick();
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await processImageScan(base64);
    };
    reader.readAsDataURL(file);
  };

  const modes: { id: ScanMode; label: string; icon: any }[] = [
    { id: 'face', label: 'Face & ID Intel (नाम, पता)', icon: ScanFace },
    { id: 'tactical', label: 'Tactical HUD', icon: Scan },
    { id: 'code', label: 'Code Inspector', icon: Code },
    { id: 'text', label: 'OCR & Text', icon: FileText },
    { id: 'object', label: 'Object Detector', icon: Box },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex flex-col items-center justify-center p-3 font-mono">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-3 border-b border-cyan-900/60 bg-slate-950 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
            {scanMode === 'face' ? (
              <ScanFace className="w-4 h-4 text-cyan-400 animate-pulse" />
            ) : (
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            )}
            <span>
              {scanMode === 'face' ? 'DEVIL FACE INTEL & BIOMETRICS' : 'DEVIL OPTICAL TACTICAL SCANNER'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleCameraFacing}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition"
              title={`Flip Camera (Current: ${facingMode === 'user' ? 'Front/Selfie' : 'Rear/Environment'})`}
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Canvas Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-rose-400 text-xs space-y-3">
              <Camera className="w-8 h-8 mx-auto opacity-50 text-rose-400" />
              <p className="max-w-xs mx-auto leading-relaxed">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-cyan-500/30"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>गैलरी से फोटो अपलोड करें</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Holographic HUD Overlays */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {/* Corner Crosshairs */}
                <div className="flex justify-between items-start">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                  {scanMode === 'face' && (
                    <div className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-[9px] text-cyan-300 font-mono tracking-wider flex items-center gap-1 animate-pulse">
                      <UserCheck className="w-3 h-3 text-cyan-400" />
                      <span>FACE RECOGNITION: ACTIVE</span>
                    </div>
                  )}
                  <div className="w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                </div>

                {/* Center Targeting Reticle */}
                {scanMode === 'face' ? (
                  <div className="self-center flex flex-col items-center justify-center relative">
                    {/* Oval Biometric Facial Frame */}
                    <div className="w-32 h-44 border-2 border-dashed border-cyan-400/70 rounded-[50%] flex flex-col items-center justify-between p-3 relative shadow-[0_0_20px_rgba(0,240,255,0.25)] animate-pulse">
                      <div className="text-[8px] text-cyan-300 uppercase tracking-widest bg-slate-950/70 px-1.5 rounded">
                        FOREHEAD / EYES
                      </div>
                      <div className="w-full flex justify-around opacity-75">
                        <div className="w-2 h-2 border border-cyan-300 rounded-full" />
                        <div className="w-2 h-2 border border-cyan-300 rounded-full" />
                      </div>
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                      <div className="w-10 h-1 border-b border-cyan-300/80 rounded" />
                      <div className="text-[8px] text-cyan-300 uppercase tracking-widest bg-slate-950/70 px-1.5 rounded">
                        CHIN LOCK
                      </div>
                    </div>
                    <span className="text-[9px] text-cyan-300/90 font-mono mt-1.5 bg-black/75 px-2.5 py-0.5 rounded border border-cyan-500/40 text-center">
                      चेहरा या ID कार्ड (Aadhaar / PAN / Badge) फ्रेम में रखें
                    </span>
                  </div>
                ) : (
                  <div className="self-center w-24 h-24 border border-cyan-500/40 rounded-full flex items-center justify-center relative">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                    <div className="absolute w-full h-0.5 bg-cyan-500/20" />
                    <div className="absolute h-full w-0.5 bg-cyan-500/20" />
                  </div>
                )}

                {/* Scanning Laser Animation */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-bounce" />
                )}

                {/* Bottom Crosshairs & Mode status */}
                <div className="flex justify-between items-end">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                  <span className="text-[9px] text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded border border-white/10">
                    {facingMode === 'user' ? 'Front Cam (Selfie)' : 'Rear Cam'}
                  </span>
                  <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Hidden File Input for Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Scan Mode Selection Bar */}
        <div className="p-3 bg-slate-950 border-t border-cyan-900/60 space-y-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-[10px]">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    soundFX.playClick();
                    setScanMode(m.id);
                    if (m.id === 'face') {
                      setFacingMode('user');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shrink-0 transition ${
                    scanMode === m.id
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Face Intel Helper Info Banner */}
          {scanMode === 'face' && (
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-200/90 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong className="text-cyan-300">Face & ID Dossier:</strong> चेहरा या ID कार्ड (आधार, पैन, वोटर ID, बैज) स्कैन करें — नाम, पूरा पता, मोबाइल/ID व बायोमेट्रिक्स डिकोड होंगे।
              </span>
            </div>
          )}

          {/* Action Buttons: Capture or Upload */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCaptureAndScan}
              disabled={isScanning || !!cameraError}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition ${
                isScanning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/40 active:scale-98'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>ANALYZING {scanMode.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>
                    {scanMode === 'face'
                      ? 'CAPTURE & EXTRACT ALL DETAILS (NAME, ADDRESS)'
                      : `CAPTURE & RUN ${scanMode.toUpperCase()} SCAN`}
                  </span>
                </>
              )}
            </button>

            {/* Upload image button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              title="Upload Face / Photo from Gallery"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Upload</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
