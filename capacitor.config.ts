
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
    icon: 'public/lovable-uploads/ae9f1c81-a4aa-4f64-9118-91ed2cdd5703.png'
  },
  android: {
    icon: 'public/lovable-uploads/ae9f1c81-a4aa-4f64-9118-91ed2cdd5703.png'
  }
};

export default config;
