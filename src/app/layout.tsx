
import type { Metadata } from 'next';
import { PT_Sans, Poppins, Cormorant_Garamond, IBM_Plex_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { ThemeProvider } from '@/components/theme-provider';
import { Suspense } from 'react';
import { NProgress } from '@/components/ui/nprogress';
import { ChromeAuroraBg, ChromeFooterWidgets } from '@/components/ChromeGate';
import { LangProvider } from '@/lib/i18n/LangContext';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

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

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-plex-mono',
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
  publisher: 'Woosenteur',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: 'https://res.cloudinary.com/db2ljqpdt/image/upload/v1776549880/ChatGPT_Image_18_avr._2026_22_36_12_p5pr6f.png',
    shortcut: 'https://res.cloudinary.com/db2ljqpdt/image/upload/v1776549880/ChatGPT_Image_18_avr._2026_22_36_12_p5pr6f.png',
    apple: 'https://res.cloudinary.com/db2ljqpdt/image/upload/v1776549880/ChatGPT_Image_18_avr._2026_22_36_12_p5pr6f.png',
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
    siteName: 'Woosenteur',
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
    title: 'Woosenteur - L\'IA qui rédige vos fiches produits',
    description: 'Économisez des heures et boostez votre SEO. L\'outil indispensable pour tous les e-commerçants.',
    images: ['https://res.cloudinary.com/dhjwimevi/image/upload/v1765955670/ChatGPT_Image_16_d%C3%A9c._2025_18_05_41_1_kluffi.png'],
    creator: '@abderelmalki',
  },
  verification: {
    google: 'io50-VjP9Me5eSmcN1NtiZvhLw5AUbAwKhCTBMSRKG0',
  },

  alternates: {
    canonical: '/',
  },
  other: {
    'google-adsense-account': 'ca-pub-8287820739614627',
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
            "name": "Woosenteur",
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
            "softwareVersion": "2",
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
          cormorant.variable,
          plexMono.variable
        )}
      >
        <GoogleAnalytics />
        <LangProvider>
        <FirebaseClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ChromeAuroraBg />
            <FirebaseErrorListener />
            <Suspense fallback={null}>
              <NProgress />
            </Suspense>
            {children}
            <Toaster />
            <ChromeFooterWidgets />
          </ThemeProvider>
        </FirebaseClientProvider>
        </LangProvider>

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8287820739614627"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
            n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
            s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
            fbq('track','PageView');
          `}</Script>
        )}
        {/* Google Ads */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`} strategy="afterInteractive" />
            <Script id="google-ads" strategy="afterInteractive">{`
              window.dataLayer=window.dataLayer||[];
              function gtag(){dataLayer.push(arguments);}
              gtag('js',new Date());
              gtag('config','${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
