import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { Clock, Tag, ArrowRight, Rss } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'Blog SEO E-commerce | Woosenteur',
  description:
    'Conseils SEO, copywriting produit, e-commerce WooCommerce & Shopify. Des articles pratiques par Abderrahmane El Malki, fondateur de Woosenteur.',
  alternates: { canonical: 'https://woosenteur.fr/blog' },
  openGraph: {
    title: 'Blog Woosenteur — SEO E-commerce & Copywriting Produit',
    description:
      'Fiches produits, SEO WooCommerce, Shopify, Rank Math — conseils pratiques et retours d\'expérience.',
    url: 'https://woosenteur.fr/blog',
    type: 'website',
  },
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
    <div className="bg-background text-foreground min-h-screen">
      <Header />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">

          {/* ── Header ── */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/20 mb-5">
              <Rss className="h-3.5 w-3.5" />
              Blog
            </span>
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
              SEO, Copywriting &{' '}
              <span className="text-gradient">E-commerce</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Retours d&apos;expérience, méthodes et analyses pratiques pour vendre mieux en ligne — par le fondateur de Woosenteur.
            </p>
          </div>

          {/* ── Article à la une ── */}
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="group block mb-12">
              <article className="bg-white dark:bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/40 hover:shadow-2xl transition-all duration-300">
                <div className="md:grid md:grid-cols-5">
                  {/* Colonne gauche — couleur accent */}
                  <div className="md:col-span-2 bg-gradient-to-br from-primary/10 to-violet-500/10 p-10 flex flex-col justify-between">
                    <span className="inline-block text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full w-fit mb-4">
                      ★ À la une
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        {featured.category}
                      </span>
                      <h2 className="font-headline text-2xl md:text-3xl font-bold text-foreground mt-2 leading-tight group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3 mt-6 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readingTime} min · {formatDate(featured.date)}
                    </div>
                  </div>

                  {/* Colonne droite — excerpt + tags */}
                  <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-between">
                    <p className="text-muted-foreground leading-relaxed text-base mb-6">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {featured.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        Lire <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* ── Grille articles ── */}
          {rest.length > 0 && (
            <>
              <h2 className="font-headline text-xl font-bold text-foreground mb-6">
                Tous les articles
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {rest.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                    <article className="h-full bg-white dark:bg-card border border-border rounded-2xl p-7 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                        {post.category}
                      </span>
                      <h3 className="font-headline text-xl font-bold text-foreground mt-2 mb-3 leading-snug group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readingTime} min · {formatDate(post.date)}
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* ── CTA newsletter / à venir ── */}
          <div className="mt-16 bg-gradient-to-br from-primary/8 to-violet-500/8 border border-primary/20 rounded-3xl p-10 text-center">
            <Tag className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-headline text-2xl font-bold text-foreground mb-2">
              Nouveaux articles chaque semaine
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              SEO e-commerce, copywriting produit, stratégies WooCommerce & Shopify. Sans jargon inutile.
            </p>
            <Link
              href="https://woosenteur.fr/survey"
              className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3 rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
            >
              Rejoindre la bêta — 5 fiches gratuites
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
