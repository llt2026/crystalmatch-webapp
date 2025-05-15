declare global {
  var verificationCodes: Map<string, {
    code: string;
    timestamp: number;
  }>;
}

export {};

// Google Analytics
interface Window {
  gtag: (command: string, action: string, params: any) => void;
}

// PWA
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
  appinstalled: Event;
} 