import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllPosts, getRelatedPosts } from '@/lib/posts';
import { Clock, ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

// ─── Génération statique ──────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

// ─── Metadata dynamique ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://woosenteur.fr/blog/${post.slug}` },
    authors: [{ name: post.author.name, url: post.author.linkedin }],
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://woosenteur.fr/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
      authors: [post.author.name],
      tags: post.tags,
    },
  };
}

// ─── JSON-LD Article ─────────────────────────────────────────────────────────

function ArticleJsonLd({ post }: { post: ReturnType<typeof getPostBySlug> }) {
  if (!post) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.linkedin,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Woosenteur',
      url: 'https://woosenteur.fr',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://woosenteur.fr/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Utilitaire date ──────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <ArticleJsonLd post={post} />
      <Header />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">

          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* ── Header article ── */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                {post.category}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime} min de lecture
              </span>
            </div>

            <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] mb-5">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              {post.excerpt}
            </p>

            {/* Auteur */}
            <div className="flex items-center gap-3 pt-5 border-t border-border/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-10 w-10 rounded-full object-cover border border-border"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">{post.author.name}</p>
                <p className="text-xs text-muted-foreground">{post.author.role}</p>
              </div>
              <time className="ml-auto text-xs text-muted-foreground" dateTime={post.date}>
                {formatDate(post.date)}
              </time>
            </div>
          </header>

          {/* ── Contenu ── */}
          <article
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-headline prose-headings:font-bold prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-foreground/80 prose-p:leading-relaxed
              prose-li:text-foreground/80
              prose-strong:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-ul:my-4 prose-li:my-1"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* ── Tags ── */}
          <div className="mt-10 pt-8 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── CTA dans l'article ── */}
          <div className="mt-12 bg-gradient-to-br from-primary/8 to-violet-500/8 border border-primary/20 rounded-3xl p-8 text-center">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Testez par vous-même</p>
            <h3 className="font-headline text-2xl font-bold text-foreground mb-3">
              5 fiches produits gratuites —{' '}
              <span className="text-gradient">sans carte bancaire</span>
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Titre SEO, méta, slug, JSON-LD, description longue. Tout est généré. Vous jugez le résultat.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Générer ma première fiche
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* ── Articles liés ── */}
          {related.length > 0 && (
            <div className="mt-14">
              <h2 className="font-headline text-xl font-bold text-foreground mb-6">
                À lire aussi
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {related.map((r) => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="group block">
                    <article className="h-full bg-white dark:bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                      <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                        {r.category}
                      </span>
                      <h3 className="font-headline text-lg font-bold text-foreground mt-1.5 mb-2 leading-snug group-hover:text-primary transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{r.excerpt}</p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> {r.readingTime} min
                      </span>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Retour blog ── */}
          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au blog
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
