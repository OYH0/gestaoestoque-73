
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4460e193bbf7420da23c01488c10b92a',
  appName: 'Gestão de Estoque',
  webDir: 'dist',
  server: {
    url: 'https://4460e193-bbf7-420d-a23c-01488c10b92a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
  ios: {
    icon: 'public/lovable-uploads/97e0e4b2-6513-45d2-9a2b-dca5bc027a48.png'
  },
  android: {
    icon: 'public/lovable-uploads/97e0e4b2-6513-45d2-9a2b-dca5bc027a48.png'
  }
};

export default config;
