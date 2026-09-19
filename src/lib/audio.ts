// Web Audio API sci-fi sound effect synthesizer and Speech helpers

class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Futuristic click/beep
  playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio FX play error', e);
    }
  }

  // Confirm sound when DEVIL finishes a response or command
  playConfirm() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.16); // G5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1046.50, now + 0.16); // C6

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio FX play error', e);
    }
  }

  // Scanning radar pulse
  playScanPing() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio FX play error', e);
    }
  }

  // Arc Reactor Activation Power-up
  playPowerUp() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.4);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn('Audio FX play error', e);
    }
  }

  // Tactical alert / warning sound
  playWarning() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.1);
      osc.frequency.setValueAtTime(220, now + 0.2);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio FX play error', e);
    }
  }

  // Realistic phone ringtone synthesizer (440Hz + 480Hz dual-frequency phone cadence)
  private ringtoneTimer: any = null;
  private ringOscillators: OscillatorNode[] = [];

  startRingtone() {
    if (!this.enabled) return;
    this.stopRingtone();
    this.initCtx();
    if (!this.ctx) return;

    const playRingCycle = () => {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now);

        // Ring for 2.0s with subtle envelope, then pause
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.setValueAtTime(0.15, now + 1.85);
        gain.gain.linearRampToValueAtTime(0.001, now + 2.0);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.0);
        osc2.stop(now + 2.0);

        this.ringOscillators = [osc1, osc2];
      } catch (e) {
        console.warn('Ringtone loop error', e);
      }
    };

    playRingCycle();
    this.ringtoneTimer = setInterval(playRingCycle, 3600);
  }

  stopRingtone() {
    if (this.ringtoneTimer) {
      clearInterval(this.ringtoneTimer);
      this.ringtoneTimer = null;
    }
    this.ringOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.ringOscillators = [];
  }

  // Call ended busy beeps (3 cadences)
  playCallEnd() {
    if (!this.enabled) return;
    this.stopRingtone();
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + i * 0.32;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.setValueAtTime(0.001, start + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.2);
      }
    } catch (e) {}
  }

  // DTMF Keypad Tones for realistic dialpad interaction
  playDtmfTone(key: string) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const dtmfFreqs: Record<string, [number, number]> = {
      '1': [697, 1209],
      '2': [697, 1336],
      '3': [697, 1477],
      '4': [770, 1209],
      '5': [770, 1336],
      '6': [770, 1477],
      '7': [852, 1209],
      '8': [852, 1336],
      '9': [852, 1477],
      '*': [941, 1209],
      '0': [941, 1336],
      '#': [941, 1477],
    };

    const freqs = dtmfFreqs[key] || [941, 1336];
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freqs[0], now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freqs[1], now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.15);
    } catch (e) {}
  }
}

export const soundFX = new SoundFX();

export interface MaleVoiceConfig {
  pitch: number;
  rate: number;
  voiceURI?: string;
  preset: 'indian_man' | 'deep_alpha' | 'heavy_commander' | 'baritone_tech' | 'cyber_male';
}

export const MALE_VOICE_PRESETS: Record<string, { label: string; hindiLabel: string; pitch: number; rate: number; desc: string }> = {
  indian_man: {
    label: '🇮🇳 Indian Man Core',
    hindiLabel: 'भारतीय पुरुष स्वर (Desi Male Baritone)',
    pitch: 0.68,
    rate: 0.98,
    desc: 'गहरी, स्पष्ट एवं प्रामाणिक भारतीय पुरुष की आवाज़ (Hindi & Indian English Male Accent)',
  },
  deep_alpha: {
    label: 'Alpha Male Core',
    hindiLabel: 'गहरा पुरुष स्वर (Alpha Male)',
    pitch: 0.68,
    rate: 1.0,
    desc: 'Deep, masculine, commanding voice with resonant bass',
  },
  heavy_commander: {
    label: 'Heavy Commander',
    hindiLabel: 'भारी कमांडिंग पुरुष (Heavy Bass)',
    pitch: 0.58,
    rate: 0.95,
    desc: 'Extra-heavy, authoritative cybernetic male commander',
  },
  baritone_tech: {
    label: 'Baritone Tech',
    hindiLabel: 'बैरिटोन पुरुष स्वर (Baritone)',
    pitch: 0.74,
    rate: 1.02,
    desc: 'Crisp, articulated masculine tech assistant',
  },
  cyber_male: {
    label: 'J.A.R.V.I.S. Style',
    hindiLabel: 'जार्विस पुरुष स्वर (J.A.R.V.I.S.)',
    pitch: 0.80,
    rate: 1.05,
    desc: 'Refined British-Indian masculine AI voice signature',
  },
};

export function getMaleVoiceConfig(): MaleVoiceConfig {
  if (typeof window === 'undefined') {
    return { pitch: 0.68, rate: 0.98, preset: 'indian_man' };
  }
  const savedPitch = localStorage.getItem('devil_male_voice_pitch');
  const savedRate = localStorage.getItem('devil_male_voice_rate');
  const savedURI = localStorage.getItem('devil_male_voice_uri') || undefined;
  const savedPreset = (localStorage.getItem('devil_male_voice_preset') as any) || 'indian_man';

  return {
    pitch: savedPitch ? parseFloat(savedPitch) : 0.68,
    rate: savedRate ? parseFloat(savedRate) : 0.98,
    voiceURI: savedURI,
    preset: savedPreset in MALE_VOICE_PRESETS ? savedPreset : 'indian_man',
  };
}

export function setMaleVoiceConfig(config: Partial<MaleVoiceConfig>) {
  if (typeof window === 'undefined') return;
  if (config.pitch !== undefined) {
    localStorage.setItem('devil_male_voice_pitch', config.pitch.toString());
  }
  if (config.rate !== undefined) {
    localStorage.setItem('devil_male_voice_rate', config.rate.toString());
  }
  if (config.voiceURI !== undefined) {
    localStorage.setItem('devil_male_voice_uri', config.voiceURI);
  }
  if (config.preset !== undefined) {
    localStorage.setItem('devil_male_voice_preset', config.preset);
  }
}

export interface SystemVoiceItem {
  id: string;
  name: string;
  lang: string;
  voiceURI: string;
  isMale: boolean;
  isHindi: boolean;
  isRecommended: boolean;
}

export function getAvailableSystemVoices(): SystemVoiceItem[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const rawVoices = window.speechSynthesis.getVoices();
  const seenVoiceURIs = new Set<string>();
  const seenNames = new Set<string>();
  const items: SystemVoiceItem[] = [];

  rawVoices.forEach((v, index) => {
    const normName = (v.name || '').trim().toLowerCase();
    const normURI = (v.voiceURI || '').trim().toLowerCase();

    // Discard duplicates: if we have already encountered this voice name or URI, ignore subsequent duplicates
    if (seenNames.has(normName) || (normURI && seenVoiceURIs.has(normURI))) {
      return;
    }
    if (normName) seenNames.add(normName);
    if (normURI) seenVoiceURIs.add(normURI);

    const lower = (v.name + ' ' + v.voiceURI + ' ' + v.lang).toLowerCase();
    
    // Explicit negative check for female identifiers
    const isFemale =
      lower.includes('female') ||
      lower.includes('woman') ||
      lower.includes('girl') ||
      lower.includes('swara') ||
      lower.includes('kalpana') ||
      lower.includes('neerja') ||
      lower.includes('ananya') ||
      lower.includes('veena') ||
      lower.includes('priya') ||
      lower.includes('aditi') ||
      lower.includes('pooja') ||
      lower.includes('shreya') ||
      lower.includes('sunita') ||
      lower.includes('kavita') ||
      lower.includes('zira') ||
      lower.includes('samantha') ||
      lower.includes('victoria') ||
      lower.includes('fiona') ||
      lower.includes('siri') ||
      lower.includes('karen') ||
      lower.includes('cortana');

    // Positive check for male identifiers
    const isExplicitMale =
      lower.includes('male') ||
      lower.includes('man') ||
      lower.includes('hemant') ||
      lower.includes('madhav') ||
      lower.includes('ajit') ||
      lower.includes('ravi') ||
      lower.includes('karan') ||
      lower.includes('rohit') ||
      lower.includes('rishi') ||
      lower.includes('guy') ||
      lower.includes('boy') ||
      lower.includes('deepak') ||
      lower.includes('ajay') ||
      lower.includes('neel') ||
      lower.includes('dev') ||
      lower.includes('pradeep') ||
      lower.includes('tarun') ||
      lower.includes('george') ||
      lower.includes('daniel') ||
      lower.includes('david') ||
      lower.includes('oliver') ||
      lower.includes('james') ||
      lower.includes('alex') ||
      lower.includes('mark') ||
      lower.includes('hid') ||
      lower.includes('hie') ||
      lower.includes('#male') ||
      lower.includes('male_1') ||
      lower.includes('male_2');

    const isHindi = v.lang.startsWith('hi') || lower.includes('hindi');
    const isIndianEng = v.lang.includes('en-in') || lower.includes('india');

    items.push({
      id: `${v.voiceURI || v.name}_${v.lang}_${index}`,
      name: v.name,
      lang: v.lang,
      voiceURI: v.voiceURI,
      isMale: isExplicitMale || !isFemale,
      isHindi,
      isRecommended: (isHindi || isIndianEng) && (isExplicitMale || !isFemale),
    });
  });

  return items;
}

// Helper to find the best authentic Indian Male Voice (Hindi/Indian English)
export function findBestIndianMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Explicit Male Hindi Voice (e.g. Microsoft Hemant, Microsoft Madhav, Android Google hi-in-x-hid, Google hi-in-x-hie)
  let found = voices.find((v) => {
    const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
    const isHi = v.lang.startsWith('hi') || lower.includes('hindi');
    const isExplicitMale =
      lower.includes('male') ||
      lower.includes('man') ||
      lower.includes('hemant') ||
      lower.includes('madhav') ||
      lower.includes('ajit') ||
      lower.includes('ravi') ||
      lower.includes('hid') ||
      lower.includes('hie') ||
      lower.includes('#male');
    const isFemale =
      lower.includes('female') ||
      lower.includes('woman') ||
      lower.includes('swara') ||
      lower.includes('kalpana') ||
      lower.includes('neerja') ||
      lower.includes('priya') ||
      lower.includes('pooja') ||
      lower.includes('ananya');
    return isHi && isExplicitMale && !isFemale;
  });
  if (found) return found;

  // 2. Explicit Indian English Male Voice (e.g. Rishi, Microsoft Ravi, Microsoft Mohan, Google en-in-x-end, Android en-IN male)
  found = voices.find((v) => {
    const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
    const isInd = v.lang.includes('en-in') || lower.includes('india');
    const isExplicitMale =
      lower.includes('male') ||
      lower.includes('man') ||
      lower.includes('ravi') ||
      lower.includes('rishi') ||
      lower.includes('mohan') ||
      lower.includes('prabhat');
    const isFemale =
      lower.includes('female') ||
      lower.includes('woman') ||
      lower.includes('heera') ||
      lower.includes('neerja') ||
      lower.includes('lekha');
    return isInd && isExplicitMale && !isFemale;
  });
  if (found) return found;

  // 3. Any Hindi Voice that is not explicit female
  found = voices.find((v) => {
    const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
    const isHi = v.lang.startsWith('hi') || lower.includes('hindi');
    const isFemale =
      lower.includes('female') ||
      lower.includes('woman') ||
      lower.includes('swara') ||
      lower.includes('kalpana') ||
      lower.includes('neerja') ||
      lower.includes('ananya') ||
      lower.includes('veena');
    return isHi && !isFemale;
  });
  if (found) return found;

  // 4. Any Indian English Voice that is not explicit female
  found = voices.find((v) => {
    const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
    const isInd = v.lang.includes('en-in') || lower.includes('india');
    const isFemale = lower.includes('female') || lower.includes('woman') || lower.includes('girl');
    return isInd && !isFemale;
  });
  if (found) return found;

  return null;
}

// Browser Native Speech Synthesis with Guaranteed Deep Male Voice Core
export function speakTextNative(
  text: string,
  persona: string = 'devil',
  onEnd?: () => void,
  targetLang: string = 'hi-IN'
) {
  if (!text || typeof text !== 'string') {
    if (onEnd) onEnd();
    return null;
  }

  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return null;
  }

  window.speechSynthesis.cancel(); // stop current sound/speech

  // Clean text from markdown symbols for clean speech output
  const cleanText = (text || '')
    .replace(/[*_#`~[\]()]/g, '')
    .replace(/https?:\/\/\S+/g, 'link')
    .slice(0, 500); // limit length per utterance chunk

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Load configured user preference (default: deep masculine 0.68)
  const voiceConfig = getMaleVoiceConfig();

  // Detect language
  const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);
  const isHindiMode = hasDevanagari || targetLang === 'hi-IN';

  const applyVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    let selectedVoice: SpeechSynthesisVoice | null = null;

    // 1. If user explicitly selected a voiceURI, use it
    if (voiceConfig.voiceURI) {
      selectedVoice = voices.find((v) => v.voiceURI === voiceConfig.voiceURI) || null;
    }

    // 2. If Indian Man preset is active or Hindi text, try Indian Male voice first
    if (!selectedVoice && (voiceConfig.preset === 'indian_man' || isHindiMode)) {
      selectedVoice = findBestIndianMaleVoice();
    }

    // 3. Otherwise, find optimal Male voice
    if (!selectedVoice) {
      if (isHindiMode) {
        // Priority A: Explicit Male Hindi Voice (e.g. Microsoft Hemant, Madhav, Android Google hi-in-x-hid)
        selectedVoice =
          voices.find((v) => {
            const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
            const isHi = v.lang.startsWith('hi') || lower.includes('hindi');
            const isExplicitMale =
              lower.includes('male') ||
              lower.includes('man') ||
              lower.includes('hemant') ||
              lower.includes('madhav') ||
              lower.includes('ajit') ||
              lower.includes('ravi') ||
              lower.includes('hid') ||
              lower.includes('hie') ||
              lower.includes('#male');
            const isFemale =
              lower.includes('female') ||
              lower.includes('woman') ||
              lower.includes('swara') ||
              lower.includes('kalpana') ||
              lower.includes('neerja');
            return isHi && isExplicitMale && !isFemale;
          }) || null;

        // Priority B: Any Hindi Voice that is not explicit female
        if (!selectedVoice) {
          selectedVoice =
            voices.find((v) => {
              const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
              const isHi = v.lang.startsWith('hi') || lower.includes('hindi');
              const isFemale =
                lower.includes('female') ||
                lower.includes('woman') ||
                lower.includes('swara') ||
                lower.includes('kalpana') ||
                lower.includes('neerja') ||
                lower.includes('ananya') ||
                lower.includes('veena');
              return isHi && !isFemale;
            }) || null;
        }

        // Priority C: Indian English Male Voice (e.g. Rishi, Microsoft Ravi, Google en-IN Male)
        if (!selectedVoice) {
          selectedVoice =
            voices.find((v) => {
              const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
              const isInd = v.lang.includes('en-in') || lower.includes('india');
              const isMale =
                lower.includes('male') ||
                lower.includes('ravi') ||
                lower.includes('rishi') ||
                !lower.includes('female');
              return isInd && isMale;
            }) || null;
        }

        // Priority D: Fallback to any non-female voice, preferring Hindi
        if (!selectedVoice) {
          selectedVoice =
            voices.find((v) => {
              const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
              const isFemale =
                lower.includes('female') ||
                lower.includes('woman') ||
                lower.includes('swara') ||
                lower.includes('kalpana') ||
                lower.includes('zira') ||
                lower.includes('samantha');
              return (v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')) && !isFemale;
            }) ||
            voices.find((v) => {
              const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
              return !lower.includes('female') && !lower.includes('woman') && !lower.includes('girl');
            }) ||
            null;
        }
      } else {
        // English / J.A.R.V.I.S. Mode
        selectedVoice =
          voices.find((v) => {
            const lower = (v.name + ' ' + v.voiceURI).toLowerCase();
            const isMale =
              lower.includes('male') ||
              lower.includes('george') ||
              lower.includes('daniel') ||
              lower.includes('david') ||
              lower.includes('oliver') ||
              lower.includes('rishi') ||
              lower.includes('guy');
            const isFemale =
              lower.includes('female') ||
              lower.includes('zira') ||
              lower.includes('samantha') ||
              lower.includes('victoria');
            return v.lang.startsWith('en') && isMale && !isFemale;
          }) || null;
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang || (isHindiMode ? 'hi-IN' : 'en-GB');
    } else {
      utterance.lang = isHindiMode ? 'hi-IN' : 'en-GB';
    }

    // Apply Deep Masculine Pitch Tuning (Locked to Man Voice Only: pitch <= 0.70 guarantees commanding baritone)
    utterance.pitch = Math.max(0.48, Math.min(0.72, voiceConfig.pitch));
    utterance.rate = Math.max(0.85, Math.min(1.2, voiceConfig.rate));

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis speak error:', err);
      if (onEnd) onEnd();
    }
  };

  const voicesAvailable = window.speechSynthesis.getVoices();
  if (voicesAvailable && voicesAvailable.length > 0) {
    applyVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      applyVoice();
    };
    setTimeout(() => {
      applyVoice();
    }, 120);
  }

  return utterance;
}

export function testManVoice(sampleText?: string, onEnd?: () => void) {
  const text =
    sampleText ||
    'नमस्ते बॉस! DEVIL की भारी पुरुष आवाज़ सक्रिय है। मैं आपकी हर आज्ञा का पालन करने के लिए तैयार हूँ। आदेश दीजिए!';
  return speakTextNative(text, 'devil', onEnd, 'hi-IN');
}
