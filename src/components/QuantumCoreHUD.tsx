import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  X,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Activity,
  ShieldCheck,
  Cpu,
  Trash2,
  Send,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { soundFX } from '../lib/audio';
import { Persona } from '../types';

interface QuantumCoreHUDProps {
  isOpen: boolean;
  onClose: () => void;
  persona?: Persona;
  isSpeaking?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
  onToggleVoice?: () => void;
  onClearAll?: () => void;
  onSendMessage?: (text: string) => Promise<void> | void;
  lastMessage?: string;
}

export const QuantumCoreHUD: React.FC<QuantumCoreHUDProps> = ({
  isOpen,
  onClose,
  persona = 'jarvis',
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  onToggleVoice,
  onClearAll,
  onSendMessage,
  lastMessage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeColorHex, setActiveColorHex] = useState<number>(0xffb703); // Default JARVIS gold
  const [throughput, setThroughput] = useState('4.2 TB/S');
  const [dataIntake, setDataIntake] = useState('95.2%');
  const [cpuFreq, setCpuFreq] = useState('4.8 GHz');
  const [inputText, setInputText] = useState('');
  const [localLastReply, setLocalLastReply] = useState<string>('');
  const [showClearBanner, setShowClearBanner] = useState(false);
  const [isLocalListening, setIsLocalListening] = useState(false);

  // Sync last message into local display
  useEffect(() => {
    if (lastMessage) {
      setLocalLastReply(lastMessage);
    }
  }, [lastMessage]);

  // Persona to color mapping
  useEffect(() => {
    switch (persona) {
      case 'devil':
        setActiveColorHex(0xff2a4a);
        break;
      case 'jarvis':
        setActiveColorHex(0xffb703);
        break;
      case 'friday':
        setActiveColorHex(0xff0055);
        break;
      case 'edith':
        setActiveColorHex(0x00ff88);
        break;
      case 'karen':
        setActiveColorHex(0xa855f7);
        break;
      case 'vision':
        setActiveColorHex(0xeab308);
        break;
      default:
        setActiveColorHex(0xffb703);
    }
  }, [persona]);

  // Subtle telemetry simulation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setThroughput((3.9 + Math.random() * 0.7).toFixed(1) + ' TB/S');
      setDataIntake((93.5 + Math.random() * 4.8).toFixed(1) + '%');
      setCpuFreq((4.6 + Math.random() * 0.4).toFixed(2) + ' GHz');
    }, 2500);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Three.js 3D Quantum Core Particle Sphere Scene
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Sphere Creation (4,000 Holographic Quantum Particles)
    const count = 4000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.5 + (Math.random() - 0.5) * 0.4;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;

      originalPositions[i] = x;
      originalPositions[i + 1] = y;
      originalPositions[i + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: activeColorHex,
      size: 0.026,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const core = new THREE.Points(geometry, material);
    scene.add(core);

    // Inner Core Energy Node (Wireframe Icosahedron)
    const innerGeo = new THREE.IcosahedronGeometry(0.85, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: activeColorHex,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerNode = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerNode);

    // Mouse / Touch Orbital Drag
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;
      targetRotationY += deltaX * 0.005;
      targetRotationX += deltaY * 0.005;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMouseX;
      const deltaY = e.touches[0].clientY - previousMouseY;
      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;
      previousMouseX = e.touches[0].clientX;
      previousMouseY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize Observer for dynamic dimensions
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Dynamic rotation
      core.rotation.y += 0.003 + targetRotationY * 0.05;
      core.rotation.x += 0.001 + targetRotationX * 0.05;
      targetRotationX *= 0.95;
      targetRotationY *= 0.95;

      innerNode.rotation.y -= 0.005;
      innerNode.rotation.z += 0.002;

      // Audio / Speech pulsation resonance
      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      const pulseFactor = isSpeaking ? 1.15 : (isListening || isLocalListening) ? 1.08 : isThinking ? 1.06 : 1.0;
      const waveSpeed = isSpeaking ? 8.0 : (isListening || isLocalListening) ? 5.0 : 2.0;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const ox = originalPositions[i3];
        const oy = originalPositions[i3 + 1];
        const oz = originalPositions[i3 + 2];

        const wave = Math.sin(elapsedTime * waveSpeed + ox * 2 + oy * 2) * (isSpeaking ? 0.08 : 0.02);
        posArray[i3] = ox * (pulseFactor + wave);
        posArray[i3 + 1] = oy * (pulseFactor + wave);
        posArray[i3 + 2] = oz * (pulseFactor + wave);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      geometry.dispose();
      material.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      renderer.dispose();
    };
  }, [isOpen, activeColorHex, isSpeaking, isListening, isThinking, isLocalListening]);

  // Execute All Clear
  const handleExecuteAllClear = () => {
    soundFX.playConfirm();
    setLocalLastReply('');
    setShowClearBanner(true);
    if (onClearAll) {
      onClearAll();
    }
    setTimeout(() => {
      setShowClearBanner(false);
    }, 3000);
  };

  // Execute Send Message
  const handleSendPrompt = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    soundFX.playClick();
    if (onSendMessage) {
      onSendMessage(text);
    }
    setInputText('');
  };

  // Local Voice Recognition Trigger
  const handleTriggerVoice = () => {
    if (onToggleVoice) {
      onToggleVoice();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    soundFX.playPowerUp();
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'hi-IN';

      setIsLocalListening(true);

      rec.onresult = (e: any) => {
        setIsLocalListening(false);
        const spoken = e.results[0][0].transcript;
        if (spoken) {
          handleSendPrompt(spoken);
        }
      };

      rec.onerror = () => {
        setIsLocalListening(false);
      };

      rec.onend = () => {
        setIsLocalListening(false);
      };

      rec.start();
    } catch {
      setIsLocalListening(false);
    }
  };

  if (!isOpen) return null;

  const hexColorString = `#${activeColorHex.toString(16).padStart(6, '0')}`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#000000] text-[#e6ab43] font-mono overflow-hidden flex flex-col select-none"
      style={{
        touchAction: 'none',
        background: 'radial-gradient(circle at 50% 50%, #08080c 0%, #000000 80%)',
      }}
    >
      {/* HUD Top Header Bar */}
      <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-7 sm:right-7 flex items-center justify-between z-20 pointer-events-auto gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className="w-2.5 h-2.5 rounded-full animate-ping shrink-0"
            style={{ backgroundColor: hexColorString }}
          />
          <div className="text-xs sm:text-sm font-bold tracking-[2px] uppercase text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] truncate">
            CLEAR BLACK SCREEN // 3D QUANTUM CORE
          </div>
        </div>

        {/* Action Buttons: ALL CLEAR, Voice, Fullscreen, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Prominent ALL CLEAR Button */}
          <button
            onClick={handleExecuteAllClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-500/70 text-red-300 hover:bg-red-900/90 transition shadow-[0_0_10px_rgba(239,68,68,0.4)] text-[10px] sm:text-xs font-bold uppercase tracking-wider active:scale-95"
            title="All Clear: Wipe logs & reset HUD"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span>ALL CLEAR</span>
          </button>

          {/* Voice Input Toggle */}
          <button
            onClick={handleTriggerVoice}
            className={`p-1.5 sm:p-2 rounded-lg border transition ${
              isListening || isLocalListening
                ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-black/80 border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/60'
            }`}
            title="Voice Command"
          >
            {isListening || isLocalListening ? (
              <Mic className="w-4 h-4 text-rose-400" />
            ) : (
              <Mic className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              soundFX.playClick();
              setIsFullscreen(!isFullscreen);
            }}
            className="p-1.5 sm:p-2 rounded-lg bg-black/80 border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen HUD'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close HUD */}
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-lg bg-black/80 border border-red-500/60 text-red-300 hover:bg-red-950 transition"
            title="Exit 3D Quantum Black Screen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* "ALL CLEAR" Visual Flash Banner */}
      {showClearBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-xs sm:text-sm font-bold tracking-widest uppercase shadow-[0_0_25px_rgba(16,185,129,0.5)] animate-bounce flex items-center gap-2 pointer-events-none">
          <Zap className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>ALL CLEAR COMPLETED // 3D QUANTUM CORE ONLINE</span>
        </div>
      )}

      {/* HUD Telemetry Panel (Left Top Floating Overlay) */}
      <div className="absolute top-14 sm:top-16 left-3 sm:left-7 z-20 bg-black/70 border-l-2 border-cyan-400 p-2.5 sm:p-3 text-[10px] sm:text-xs backdrop-blur-md rounded-r-xl shadow-[0_0_20px_rgba(0,0,0,0.9)] pointer-events-auto space-y-2 min-w-[150px] sm:min-w-[190px]">
        <div>
          <div className="text-[9px] text-slate-400 tracking-wider uppercase">CORE STATUS:</div>
          <div className="text-sm sm:text-base font-bold text-cyan-400 flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{isSpeaking ? 'SPEAKING' : (isListening || isLocalListening) ? 'LISTENING' : isThinking ? 'PROCESSING' : 'NOMINAL'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="text-[9px] text-slate-400">NODES:</span>
          <span className="font-bold text-white">4,000</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="text-[9px] text-slate-400">INTAKE:</span>
          <span className="font-bold text-white">{dataIntake}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="text-[9px] text-slate-400">SPEED:</span>
          <span className="font-bold text-white">{throughput}</span>
        </div>

        {/* Color Matrix Switcher */}
        <div className="pt-1 border-t border-cyan-500/20">
          <div className="text-[8px] uppercase tracking-wider text-slate-400 mb-1">HARMONICS:</div>
          <div className="flex items-center gap-1.5">
            {[
              { name: 'Gold (JARVIS)', color: 0xffb703 },
              { name: 'Red (DEVIL)', color: 0xff2a4a },
              { name: 'Cyan (CYBER)', color: 0x00f0ff },
              { name: 'Green (EDITH)', color: 0x00ff88 },
            ].map((p) => (
              <button
                key={p.color}
                onClick={() => {
                  soundFX.playClick();
                  setActiveColorHex(p.color);
                }}
                className={`w-3.5 h-3.5 rounded-full border transition active:scale-90 ${
                  activeColorHex === p.color ? 'ring-2 ring-white scale-110' : 'opacity-70'
                }`}
                style={{ backgroundColor: `#${p.color.toString(16).padStart(6, '0')}` }}
                title={p.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Holographic Speech / Subtitle Floating Bubble (When AI talks or replies) */}
      {localLastReply && (
        <div className="absolute top-20 sm:top-24 right-3 sm:right-7 z-20 max-w-sm sm:max-w-md bg-black/85 border border-cyan-500/40 p-3 rounded-xl backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.2)] pointer-events-auto text-xs text-slate-100 animate-fadeIn">
          <div className="flex items-center justify-between mb-1 text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#ffaa00]" />
              RESPONSE STREAM
            </span>
            <button
              onClick={() => setLocalLastReply('')}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="max-h-36 overflow-y-auto scrollbar-none leading-relaxed text-slate-200">
            {localLastReply}
          </div>
        </div>
      )}

      {/* Floating Bottom Command Bar & Quick Triggers */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-7 sm:right-7 z-20 flex flex-col items-center gap-2 pointer-events-auto max-w-2xl mx-auto w-full">
        {/* Quick Action Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          <button
            onClick={handleExecuteAllClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500 text-red-300 hover:bg-red-900 text-[10px] font-bold uppercase tracking-wider shrink-0 transition"
          >
            <RotateCcw className="w-3 h-3 text-red-400" />
            <span>ALL CLEAR</span>
          </button>
          <button
            onClick={() => handleSendPrompt('System status check')}
            className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-900 text-[10px] font-bold uppercase tracking-wider shrink-0 transition"
          >
            STATUS REPORT
          </button>
          <button
            onClick={() => handleSendPrompt('All India data and telemetry')}
            className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 hover:bg-amber-900 text-[10px] font-bold uppercase tracking-wider shrink-0 transition"
          >
            ALL INDIA DATA
          </button>
          <button
            onClick={() => handleSendPrompt('Device boost RAM clear')}
            className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-900 text-[10px] font-bold uppercase tracking-wider shrink-0 transition"
          >
            BOOST CORE
          </button>
        </div>

        {/* Input Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="w-full flex items-center gap-2 bg-black/90 border border-cyan-500/50 rounded-xl p-1.5 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.25)]"
        >
          <button
            type="button"
            onClick={handleTriggerVoice}
            className={`p-2 rounded-lg border transition ${
              isListening || isLocalListening
                ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
            }`}
            title="Speech Input"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Command 3D Quantum Core (or tap mic)..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none px-2"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-xs uppercase tracking-wider transition disabled:opacity-30 disabled:hover:bg-cyan-500 flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TRANSMIT</span>
          </button>
        </form>

        <div className="text-[9px] text-slate-500 uppercase tracking-widest pointer-events-none">
          TOUCH / DRAG TO ROTATE 3D SPHERE // FULL OLED PURE BLACK
        </div>
      </div>

      {/* Three.js Particle Sphere Canvas */}
      <canvas
        id="quantum-core-canvas"
        ref={canvasRef}
        className="w-full h-full flex-1 block cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
