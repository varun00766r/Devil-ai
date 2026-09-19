import { GPSLocation } from './lib/location';

export type Persona = 'devil' | 'jarvis' | 'friday' | 'edith' | 'karen' | 'vision';

export type ScanMode = 'tactical' | 'face' | 'code' | 'text' | 'object' | 'screen' | 'instagram' | 'wifi';

export interface GroundingSource {
  title: string;
  url: string;
}

export interface IndiaNewsItem {
  id: string;
  title: string;
  summary: string;
  category: 'all' | 'national' | 'politics' | 'business' | 'sports' | 'tech' | 'states';
  source: string;
  url?: string;
  time: string;
  tag?: string;
}

export interface ScanResultData {
  summary: string;
  analysis: string;
  imageBase64?: string;
  instagramId?: string;
  wifiDetails?: { ssid?: string; password?: string };
  mode?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  image?: string;
  sources?: GroundingSource[];
  isThinking?: boolean;
  locationData?: GPSLocation;
  showContactDialer?: boolean;
  showLiveClock?: boolean;
  showWiFiManager?: boolean;
  showMobileManager?: boolean;
  showStopwatch?: boolean;
  showVoiceManager?: boolean;
  showIndiaNews?: boolean;
  indiaNewsData?: IndiaNewsItem[];
  showAllIndiaData?: boolean;
  allIndiaData?: any;
  showScreenVision?: boolean;
  screenVisionData?: ScanResultData;
  showFakeCallLauncher?: boolean;
  showApkDownload?: boolean;
  showMobileNumberLocation?: boolean;
  mobileNumberQuery?: string;
  showUIClearingCard?: boolean;
}

export interface FakeCallConfig {
  id: string;
  callerName: string;
  callerNumber: string;
  callerTag: string;
  avatarIcon?: 'phone' | 'shield' | 'user' | 'bot' | 'building' | 'alert';
  scriptId: string;
  scriptText?: string;
  delaySeconds: number;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  completed: boolean;
  isPinned?: boolean;
  isUrgent?: boolean;
  priority?: 'normal' | 'high' | 'urgent';
}

export interface StarkNote {
  id: string;
  title: string;
  content: string;
  category: 'code' | 'intel' | 'task' | 'general';
  createdAt: string;
  isPinned?: boolean;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  coreTemp: number;
  batteryLevel: number;
  securityLevel: string;
  activeThreads: number;
}
