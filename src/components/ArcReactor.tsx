import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { Sparkles, Maximize2, Layers, Battery, BatteryCharging, BatteryWarning } from 'lucide-react';
import { soundFX } from '../lib/audio';
import { useBatteryStatus } from '../lib/useBatteryStatus';

interface ArcReactorProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  persona: string;
  onClick?: () => void;
  voiceFeedbackEnabled?: boolean;
  onOpenQuantumCore?: () => void;
  onOpenJarvisInterface?: () => void;
  batteryLevel?: number;
  isCharging?: boolean;
  isLowBattery?: boolean;
  onToggleSimulateLowBattery?: () => void;
  onResetSimulatedBattery?: () => void;
  isSimulatedBattery?: boolean;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  isSpeaking,
  isListening,
  isThinking,
  persona,
  onClick,
  voiceFeedbackEnabled = true,
  onOpenQuantumCore,
  onOpenJarvisInterface,
  batteryLevel,
  isCharging,
  isLowBattery,
  onToggleSimulateLowBattery,
  onResetSimulatedBattery,
  isSimulatedBattery,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'classic'>('3d');

  // Auto-Theming Battery State Hook (Real Browser Battery + Simulation controls)
  const battery = useBatteryStatus();
  const activeLevel = batteryLevel !== undefined ? batteryLevel : battery.batteryLevel;
  const activeIsCharging = isCharging !== undefined ? isCharging : battery.isCharging;
  const activeIsLowBattery = isLowBattery !== undefined ? isLowBattery : activeLevel < 20;
  const activeToggleSimulate = onToggleSimulateLowBattery || battery.toggleLowBatterySimulation;
  const activeIsSimulated = isSimulatedBattery !== undefined ? isSimulatedBattery : battery.simulatedLevel !== null;

  // Auto-Theming Color Scheme:
  // Normal state (>= 20%): Cyan color scheme (#00f0ff)
  // Low battery (< 20%): Switches to Red color scheme (#ff2a4a)
  const colors = activeIsLowBattery
    ? {
        primary: '#ff2a4a',
        secondary: '#88001b',
        glow: 'rgba(255, 42, 74, 0.65)',
        text: `CRITICAL POWER (${activeLevel}%) // RED OVERRIDE`,
        hex: 0xff2a4a,
      }
    : {
        primary: '#00f0ff',
        secondary: '#0088cc',
        glow: 'rgba(0, 240, 255, 0.55)',
        text: 'ARC REACTOR // ONLINE (CYAN)',
        hex: 0x00f0ff,
      };

  // Three.js Particle Sphere for 3D View Mode
  useEffect(() => {
    if (viewMode !== '3d' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = 150;
    const height = 150;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Sphere Creation (2,200 particle mini core)
    const count = 2200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.4 + (Math.random() - 0.5) * 0.4;

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
      color: colors.hex,
      size: 0.042,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const core = new THREE.Points(geometry, material);
    scene.add(core);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      const rotSpeed = isSpeaking ? 0.01 : isThinking ? 0.015 : 0.004;
      core.rotation.y += rotSpeed;
      core.rotation.x += rotSpeed * 0.4;

      // Pulse on audio
      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;
      const pulse = isSpeaking ? 1.12 : isListening ? 1.06 : 1.0;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const ox = originalPositions[i3];
        const oy = originalPositions[i3 + 1];
        const oz = originalPositions[i3 + 2];
        const wave = isSpeaking ? Math.sin(elapsedTime * 8 + ox * 3) * 0.08 : 0;
        posArray[i3] = ox * (pulse + wave);
        posArray[i3 + 1] = oy * (pulse + wave);
        posArray[i3 + 2] = oz * (pulse + wave);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [viewMode, colors.hex, isSpeaking, isListening, isThinking]);

  return (
    <div className="relative flex flex-col items-center justify-center my-3 select-none">
      {/* Interactive Arc Reactor Core Container */}
      <div 
        onClick={onClick}
        className="relative cursor-pointer group flex items-center justify-center p-3 rounded-full transition-transform duration-300 active:scale-95"
        style={{ width: '150px', height: '150px' }}
        title="Tap to toggle DEVIL Voice Input"
      >
        {/* Outer Pulsing Aura Ring */}
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.2, 1] : isListening ? [1, 1.15, 1] : isThinking ? [1, 1.08, 1] : [1, 1.03, 1],
            opacity: isSpeaking ? [0.6, 1, 0.6] : isListening ? [0.7, 0.95, 0.7] : 0.4,
          }}
          transition={{
            duration: isSpeaking ? 0.8 : isListening ? 1.2 : isThinking ? 0.6 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full blur-xl pointer-events-none"
          style={{ backgroundColor: colors.glow }}
        />

        {/* 3D Three.js Particle Sphere Mode */}
        {viewMode === '3d' ? (
          <div className="relative w-[150px] h-[150px] flex items-center justify-center">
            {/* Outer HUD ring */}
            <motion.svg
              animate={{ rotate: isThinking ? -360 : -180 }}
              transition={{ duration: isThinking ? 3 : 18, repeat: Infinity, ease: "linear" }}
              className="absolute w-full h-full pointer-events-none opacity-80"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="47"
                fill="none"
                stroke={colors.primary}
                strokeWidth="1"
                strokeDasharray="4 6 12 4"
                opacity="0.75"
              />
            </motion.svg>

            <canvas
              ref={canvasRef}
              className="w-[150px] h-[150px] rounded-full pointer-events-none"
              style={{ filter: `drop-shadow(0 0 12px ${colors.glow})` }}
            />
          </div>
        ) : (
          /* Classic Concentric Tech Rings */
          <>
            {/* Rotating Outer Tech Ring 1 */}
            <motion.svg
              animate={{ rotate: isThinking ? -360 : -180 }}
              transition={{ duration: isThinking ? 3 : 18, repeat: Infinity, ease: "linear" }}
              className="absolute w-full h-full pointer-events-none opacity-80"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke={colors.primary}
                strokeWidth="1"
                strokeDasharray="4 8 12 4"
                opacity="0.8"
              />
            </motion.svg>

            {/* Rotating Segmented Ring 2 */}
            <motion.svg
              animate={{ rotate: isThinking ? 360 : 360 }}
              transition={{ duration: isThinking ? 2 : 12, repeat: Infinity, ease: "linear" }}
              className="absolute w-[85%] h-[85%] pointer-events-none"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={colors.secondary}
                strokeWidth="1.5"
                strokeDasharray="20 10 5 10"
                opacity="0.9"
              />
            </motion.svg>

            {/* Inner Core Arc Triangles & Coils */}
            <div className={`relative w-20 h-20 rounded-full bg-slate-950/90 border ${activeIsLowBattery ? 'border-red-500/60 shadow-[0_0_15px_rgba(255,42,74,0.3)]' : 'border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'} shadow-inner flex items-center justify-center overflow-hidden`}>
              {/* Glass Specular Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* Copper Arc Coils (10 segments) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-full flex items-start justify-center"
                    style={{ transform: `rotate(${i * 36}deg)` }}
                  >
                    <div
                      className="w-1.5 h-3 mt-1 rounded-sm shadow-sm"
                      style={{ backgroundColor: colors.primary, opacity: 0.7 }}
                    />
                  </div>
                ))}
              </div>

              {/* Center Glowing Element */}
              <motion.div
                animate={{
                  scale: isSpeaking ? [0.85, 1.15, 0.85] : isListening ? [0.9, 1.1, 0.9] : [0.95, 1.05, 0.95],
                  boxShadow: [
                    `0 0 15px ${colors.primary}`,
                    `0 0 30px ${colors.primary}`,
                    `0 0 15px ${colors.primary}`,
                  ]
                }}
                transition={{ duration: isSpeaking ? 0.4 : isListening ? 0.8 : 2, repeat: Infinity }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs shadow-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <div className="w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>

      {/* Core Controls & Status Label */}
      <div className="mt-1 flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border ${activeIsLowBattery ? 'border-red-500/50' : 'border-slate-800'} text-[10px] tracking-widest font-mono uppercase text-slate-300 shadow-md`}>
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: colors.primary }}
          />
          <span style={{ color: colors.primary }}>
            {isSpeaking
              ? 'AUDIO STREAM OUTPUT...'
              : isListening
              ? 'LISTENING (WAKE WORD ACTIVE)'
              : isThinking
              ? 'NEURAL QUANTUM COMPUTING...'
              : !voiceFeedbackEnabled
              ? `${colors.text} (VOICE MUTED)`
              : colors.text}
          </span>
        </div>

        {/* Switch Mode Button (3D Quantum / Classic) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFX.playClick();
            setViewMode(viewMode === '3d' ? 'classic' : '3d');
          }}
          className="p-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50 transition active:scale-90"
          title={`Switch to ${viewMode === '3d' ? 'Classic 2D Arc' : '3D Quantum Particle Core'}`}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        {/* Launch Clear Black Screen 3D Quantum HUD */}
        {onOpenQuantumCore && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundFX.playPowerUp();
              onOpenQuantumCore();
            }}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black border border-cyan-400/80 text-cyan-300 hover:bg-cyan-950/80 hover:border-cyan-300 transition text-[9px] font-mono uppercase tracking-wider active:scale-95 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
            title="Open Clear Black Screen 3D Quantum Core HUD"
          >
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="font-bold">3D QUANTUM</span>
          </button>
        )}

        {/* Launch J.A.R.V.I.S. Arc Hologram Web Interface */}
        {onOpenJarvisInterface && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundFX.playPowerUp();
              onOpenJarvisInterface();
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-[#00f0ff]/60 text-[#00f0ff] hover:bg-[#00f0ff]/20 hover:border-[#00f0ff] transition text-[9px] font-mono uppercase tracking-wider active:scale-95 shadow-[0_0_6px_rgba(0,240,255,0.3)]"
            title="Open J.A.R.V.I.S. Web Interface (Dual-Arc Animated Hologram HUD)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffaa00] animate-ping" />
            <span>JARVIS HUD</span>
          </button>
        )}
      </div>

      {/* Auto-Theming Battery Telemetry & Simulation Bar */}
      <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFX.playClick();
            activeToggleSimulate();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition active:scale-95 ${
            activeIsLowBattery
              ? 'bg-red-950/90 border-red-500/80 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse'
              : 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
          }`}
          title={`Arc Reactor Auto-Theming Status: ${activeIsLowBattery ? 'Low Battery (<20%) -> RED ACTIVE' : 'Normal Battery (≥20%) -> CYAN ACTIVE'}. Click to toggle/simulate low battery`}
        >
          {activeIsLowBattery ? (
            <BatteryWarning className="w-3.5 h-3.5 text-red-400 animate-bounce" />
          ) : activeIsCharging ? (
            <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <Battery className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="font-bold">
            BATTERY {activeLevel}%
          </span>
          <span className="text-[9px] uppercase tracking-wider font-semibold opacity-95">
            {activeIsLowBattery ? '• RED THEME (<20%)' : '• CYAN THEME (≥20%)'}
          </span>
          {activeIsSimulated && (
            <span className="text-[8px] px-1 py-0.2 rounded bg-black/80 text-amber-300 border border-amber-500/50 font-mono">
              SIM
            </span>
          )}
        </button>

        {/* Quick Reset simulation button if simulated */}
        {activeIsSimulated && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundFX.playClick();
              if (onResetSimulatedBattery) {
                onResetSimulatedBattery();
              } else if (battery.setSimulatedLevel) {
                battery.setSimulatedLevel(null);
              }
            }}
            className="px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-[9px] transition active:scale-95"
            title="Reset to device real battery telemetry"
          >
            Live Batt
          </button>
        )}
      </div>
    </div>
  );
};

