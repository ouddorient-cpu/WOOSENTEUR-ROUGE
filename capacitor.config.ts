import type { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.CAPACITOR_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'fr.woosenteur.mobile',
  appName: 'Woosenteur',
  // Dossier minimal: avec la stratégie server.url ci-dessous, ce contenu n'est jamais affiché.
  // Capacitor exige toutefois un webDir non vide au moment du build.
  webDir: 'android-web-placeholder',
  server: {
    // Émulateur Android: 10.0.2.2 est l'alias standard vers localhost de la machine hôte.
    url: isDev ? 'http://10.0.2.2:3000/m' : 'https://woosenteur.fr/m',
    cleartext: isDev,
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#0B1220',
  },
};

export default config;
