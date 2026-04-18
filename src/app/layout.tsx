
import type { Metadata } from 'next';
import { PT_Sans, Poppins, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { ThemeProvider } from '@/components/theme-provider';
import { Suspense } from 'react';
import { NProgress } from '@/components/ui/nprogress';
import { CookieConsent } from '@/components/CookieConsent';
import { GlobalChatbot } from '@/components/chatbot/global-chatbot';
import { AuroraBg } from '@/components/ui/aurora-bg';
import { LangProvider } from '@/lib/i18n/LangContext';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['800'],
  variable: '--font-poppins',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

const URL_BASE = 'https://woosenteur.fr';

export const metadata: Metadata = {
  metadataBase: new URL(URL_BASE),
  title: {
    default: 'Woosenteur — Des fiches produit qui font vendre, en 5 minutes',
    template: '%s | Woosenteur',
  },
  description: 'Tu as un bon produit mais tu ne sais pas comment le présenter ? Woosenteur rédige ta fiche produit à ta place. Claire, professionnelle, prête à publier — sans jargon, sans effort.',
  keywords: ['fiche produit', 'rédaction fiche produit', 'e-commerce débutant', 'boutique en ligne', 'WooCommerce', 'Shopify', 'description produit', 'vendeur artisanal'],
  authors: [{ name: 'Abderrahmane El Malki', url: 'https://www.linkedin.com/in/abderrahman-elmalki-44a887253/' }],
  creator: 'Abderrahmane El Malki',
  publisher: 'Woosenteur v2',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: 'https://res.cloudinary.com/dzagwz94z/image/upload/v1768292940/ChatGPT_Image_13_janv._2026_09_28_19_wvny6h.png',
    shortcut: 'https://res.cloudinary.com/dzagwz94z/image/upload/v1768292940/ChatGPT_Image_13_janv._2026_09_28_19_wvny6h.png',
    apple: 'https://res.cloudinary.com/dzagwz94z/image/upload/v1768292940/ChatGPT_Image_13_janv._2026_09_28_19_wvny6h.png',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Woosenteur — Des fiches produit qui font vendre, en 5 minutes',
    description: 'Décris ton produit en quelques mots. Woosenteur rédige une fiche claire, professionnelle et prête à publier — sans jargon, sans effort.',
    url: URL_BASE,
    siteName: 'Woosenteur v2',
    images: [
      {
        url: 'https://res.cloudinary.com/dhjwimevi/image/upload/v1765955670/ChatGPT_Image_16_d%C3%A9c._2025_18_05_41_1_kluffi.png',
        width: 1200,
        height: 630,
        alt: 'Générateur de fiches produits par IA - Woosenteur v2',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Woosenteur v2 - L\'IA qui rédige vos fiches produits',
    description: 'Économisez des heures et boostez votre SEO. L\'outil indispensable pour tous les e-commerçants.',
    images: ['https://res.cloudinary.com/dhjwimevi/image/upload/v1765955670/ChatGPT_Image_16_d%C3%A9c._2025_18_05_41_1_kluffi.png'],
    creator: '@abderelmalki',
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Woosenteur v2",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "Une application SaaS basée sur l'IA pour générer des fiches produits optimisées pour le SEO, pour les boutiques WooCommerce, Shopify et autres.",
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "EUR",
              "lowPrice": "0",
              "highPrice": "24.90",
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Gratuit",
                  "price": "0",
                  "priceCurrency": "EUR"
                },
                {
                  "@type": "Offer",
                  "name": "Essentiel",
                  "price": "5.99",
                  "priceCurrency": "EUR"
                },
                {
                  "@type": "Offer",
                  "name": "Standard",
                  "price": "9.99",
                  "priceCurrency": "EUR"
                }
              ]
            },
            "author": {
              "@type": "Person",
              "name": "Abderrahmane El Malki",
              "url": "https://www.linkedin.com/in/abderrahman-elmalki-44a887253/"
            },
            "screenshot": "https://res.cloudinary.com/dhjwimevi/image/upload/v1765904836/ChatGPT_Image_16_d%C3%A9c._2025_18_05_41_vfx3jk.png",
            "softwareVersion": "2.0",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "25"
            }
          })
        }} />
      </head>
      <body
        className={cn(
          'font-body antialiased min-h-screen bg-background',
          ptSans.variable,
          poppins.variable,
          cormorant.variable
        )}
      >
        <LangProvider>
        <FirebaseClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AuroraBg />
            <FirebaseErrorListener />
            <Suspense fallback={null}>
              <NProgress />
            </Suspense>
            {children}
            <Toaster />
            <CookieConsent />
            <GlobalChatbot />
          </ThemeProvider>
        </FirebaseClientProvider>
        </LangProvider>

      </body>
    </html>
  );
}
