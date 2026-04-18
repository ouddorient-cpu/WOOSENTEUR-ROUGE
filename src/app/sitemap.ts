import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

const BASE_URL = 'https://woosenteur.fr';

// Date du repositionnement warm (avril 2026)
const REBRANDING_DATE = new Date('2026-04-18');

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      // Accueil — fiche produit en 5 minutes, sans jargon
      url: `${BASE_URL}/`,
      lastModified: REBRANDING_DATE,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      // Tarifs — pensés pour les petites boutiques
      url: `${BASE_URL}/pricing`,
      lastModified: REBRANDING_DATE,
      changeFrequency: 'monthly',
      priority: 0.95,
    },
    {
      // Blog — conseils e-commerce & fiches produit sans jargon
      url: `${BASE_URL}/blog`,
      lastModified: REBRANDING_DATE,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      // Inscription — 5 fiches gratuites, sans carte bancaire
      url: `${BASE_URL}/signup`,
      lastModified: REBRANDING_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      // Connexion
      url: `${BASE_URL}/login`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/legal/terms`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/legal/privacy`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/legal/notice`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/legal/cookies`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogEntries];
}
