
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
    icon: 'public/lovable-uploads/5119782b-de52-4e96-9e00-1ef796eb0058.png'
  },
  android: {
    icon: 'public/lovable-uploads/5119782b-de52-4e96-9e00-1ef796eb0058.png'
  }
};

export default config;
