import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/dashboard/admin/',
          '/dashboard/onboarding/',
        ],
      },
    ],
    sitemap: 'https://woosenteur.fr/sitemap.xml',
    host: 'https://woosenteur.fr',
  };
}
