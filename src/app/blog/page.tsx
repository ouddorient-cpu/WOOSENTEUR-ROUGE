import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { Clock, ArrowRight, Rss } from 'lucide-react';
import HeaderLanding from '@/components/header-landing';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'Blog — Conseils E-commerce & Fiches Produit | Woosenteur',
  description:
    'Conseils pratiques pour améliorer vos fiches produit, vendre mieux en ligne et gagner du temps. Par le fondateur de Woosenteur.',
  alternates: { canonical: 'https://woosenteur.fr/blog' },
  openGraph: {
    title: 'Blog Woosenteur — Fiches Produit & E-commerce',
    description:
      'Conseils pratiques pour améliorer vos fiches produit, vendre mieux en ligne et gagner du temps.',
    url: 'https://woosenteur.fr/blog',
    type: 'website',
  },
};

const C = {
  bg: '#FAF6F0', bgAlt: '#F3ECE4', surface: '#FDF9F5',
  text: '#2E2018', muted: '#7A6D62', border: '#E5DDD4',
  sage: '#7D9B76', sagePale: '#EDF2EC',
  terra: '#D4704A', terraDark: '#BF5E3A',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BlogPage() {
  const allPosts = getAllPosts();
  const [featured, ...rest] = allPosts;

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      <HeaderLanding />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">

          {/* Header */}
          <div className="text-center mb-14">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
              style={{ background: C.sagePale, color: C.sage }}
            >
              <Rss className="h-3.5 w-3.5" />
              Blog
            </span>
            <h1
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(2rem,6vw,3.2rem)', fontWeight: 700, color: C.text }}
              className="mt-2 mb-4"
            >
              Conseils e-commerce &{' '}
              <span style={{ color: C.terra }}>fiches produit</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: C.muted }}>
              Méthodes pratiques pour vendre mieux en ligne — sans jargon technique, sans prise de tête.
            </p>
          </div>

          {/* Article à la une */}
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="group block mb-12">
              <article
                className="rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl"
                style={{ background: C.surface, border: `2px solid ${C.border}` }}
              >
                <div className="md:grid md:grid-cols-5">
                  <div
                    className="md:col-span-2 p-10 flex flex-col justify-between"
                    style={{ background: C.bgAlt }}
                  >
                    <span
                      className="inline-block text-xs font-bold px-3 py-1 rounded-full w-fit mb-4"
                      style={{ background: C.sagePale, color: C.sage }}
                    >
                      ★ À la une
                    </span>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.muted }}>
                        {featured.category}
                      </span>
                      <h2
                        className="text-2xl md:text-3xl font-bold mt-2 leading-tight transition-colors"
                        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: C.text }}
                      >
                        {featured.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3 mt-6 text-xs" style={{ color: C.muted }}>
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readingTime} min · {formatDate(featured.date)}
                    </div>
                  </div>

                  <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-between">
                    <p className="leading-relaxed text-base mb-6" style={{ color: C.muted }}>
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {featured.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2.5 py-1 rounded-full"
                            style={{ background: C.sagePale, color: C.sage, border: `1px solid ${C.border}` }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: C.terra }}>
                        Lire <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Grille articles */}
          {rest.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-6" style={{ color: C.text }}>
                Tous les articles
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {rest.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                    <article
                      className="h-full rounded-2xl p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      style={{ background: C.surface, border: `1px solid ${C.border}` }}
                    >
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.sage }}>
                        {post.category}
                      </span>
                      <h3
                        className="text-xl font-bold mt-2 mb-3 leading-snug transition-colors"
                        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: C.text }}
                      >
                        {post.title}
                      </h3>
                      <p className="text-sm leading-relaxed mb-5 line-clamp-3" style={{ color: C.muted }}>
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
                          <Clock className="h-3.5 w-3.5" />
                          {post.readingTime} min · {formatDate(post.date)}
                        </div>
                        <ArrowRight
                          className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                          style={{ color: C.terra }}
                        />
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          <div
            className="mt-16 rounded-3xl p-10 text-center"
            style={{ background: C.bgAlt, border: `1px solid ${C.border}` }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
              style={{ background: C.sagePale }}
            >
              ✦
            </div>
            <h3
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: C.text }}
            >
              Nouveaux articles chaque semaine
            </h3>
            <p className="max-w-md mx-auto mb-6" style={{ color: C.muted }}>
              Fiches produit, e-commerce, copywriting — conseils pratiques sans jargon inutile.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: C.terra, boxShadow: '0 4px 20px rgba(212,112,74,0.28)' }}
            >
              Essayer gratuitement — 5 fiches offertes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
