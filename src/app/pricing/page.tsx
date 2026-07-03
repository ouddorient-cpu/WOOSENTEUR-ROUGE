
'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Heart, ArrowRight, Loader2 } from 'lucide-react';
import HeaderLanding from '@/components/header-landing';
import Footer from '@/components/footer';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { WelcomeBanner } from './welcome-banner';
import { PRICING_PLANS, CREDIT_PACKS, CreditPack } from '@/lib/pricing-config';

const P = {
  cream:    '#FAF7F2',
  pearl:    '#F1ECE4',
  ink:      '#2E2A26',
  inkSoft:  '#6B645C',
  rose:     '#C9897B',
  roseDeep: '#B3705F',
  sage:     '#9AA88F',
};

const SERIF  = "Georgia, 'Times New Roman', serif";
const SANS   = 'system-ui, -apple-system, sans-serif';

const FAQ_ITEMS = [
  {
    q: 'Pourquoi payer alors que ChatGPT est gratuit ?',
    a: "ChatGPT vous donne du texte brut : à vous de trouver le bon prompt, structurer la fiche, ajouter les mots-clés, formater pour WooCommerce, puis copier-coller champ par champ. Woosenteur fait tout ça en un clic — titre, description, SEO Rank Math, méta, et publication directe sur votre boutique. Vous payez le temps gagné, pas le texte.",
  },
  {
    q: 'Que deviennent mes crédits non utilisés ?',
    a: 'Avec le plan Boutique, vos crédits se renouvellent chaque mois. Avec le Pack Découverte, vos 10 fiches sont valables 6 mois — vous les utilisez à votre rythme, sans pression.',
  },
  {
    q: 'Je peux changer de plan ou arrêter quand je veux ?',
    a: 'Oui. Passage de plan, pause ou résiliation : tout se fait en 1 clic depuis votre espace, sans email à envoyer, sans justification à donner.',
  },
];

function PricingPageContent() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);
  const billingCycle = annual ? 'annually' : 'monthly';

  /* ── Handlers (logique Stripe / Firebase inchangée) ── */
  const handleFreePlan = async () => {
    if (!user) { router.push('/signup?redirect=/pricing&new_user=true'); return; }
    setLoadingPriceId('free');
    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch('/api/user/activate-free', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ variant: 'success', title: "C'est parti ! 🎉", description: 'Vos 5 crédits ont été ajoutés. Redirection…' });
      setTimeout(() => router.push('/dashboard/onboarding'), 2000);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message || "Impossible d'activer le plan gratuit." });
    } finally {
      setLoadingPriceId(null);
    }
  };

  const handlePackPurchase = async (pack: CreditPack) => {
    if (!user) { router.push('/signup?redirect=/pricing'); return; }
    setLoadingPriceId(pack.id);
    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch('/api/checkout/pack', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (err: any) {
      setLoadingPriceId(null);
      toast({ variant: 'destructive', title: 'Erreur', description: err.message || 'Impossible de lancer le paiement.' });
    }
  };

  const handlePaidPlan = async (plan: typeof PRICING_PLANS[0]) => {
    if (!user) { router.push('/signup?redirect=/pricing'); return; }
    setLoadingPriceId(plan.id);

    // Priorité : Stripe Checkout Session via priceId
    if (plan.priceId?.[billingCycle]) {
      try {
        const idToken = await user.getIdToken(true);
        const res = await fetch('/api/checkout/subscription', {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: plan.id, billingCycle }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        window.location.assign(data.url);
      } catch (err: any) {
        setLoadingPriceId(null);
        toast({ variant: 'destructive', title: 'Erreur', description: err.message || 'Impossible de lancer le paiement.' });
      }
      return;
    }

    // Fallback : payment link statique
    const link = plan.paymentLink?.[billingCycle];
    if (!link) {
      setLoadingPriceId(null);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Lien de paiement indisponible pour ce cycle.' });
      return;
    }
    try {
      const url = new URL(link);
      url.searchParams.set('prefilled_email', user.email || '');
      url.searchParams.set('client_reference_id', user.uid);
      window.location.assign(url.toString());
    } catch {
      setLoadingPriceId(null);
      toast({ variant: 'destructive', title: 'Erreur de redirection', description: 'Impossible de vous rediriger. Veuillez réessayer.' });
    }
  };

  /* ── Mapping plans → affichage ── */
  const freePlan     = PRICING_PLANS.find(p => p.id === 'free')!;
  const boutiquePlan = PRICING_PLANS.find(p => p.id === 'standard')!;
  const proPlan      = PRICING_PLANS.find(p => p.id === 'premium')!;
  const packDecouverte = CREDIT_PACKS.find(p => p.id === 'pack-s')!;

  const displayPlans = [
    {
      plan: freePlan,
      displayName: 'Gratuit',
      tagline: 'Pour voir le résultat de vos propres yeux.',
      highlight: false,
      badge: null,
      onCta: handleFreePlan,
      ctaLabel: 'Générer mes 5 fiches',
      displayFeatures: [
        '5 fiches produit offertes',
        'Optimisation SEO de base',
        'Export CSV',
        'Accès à vie aux fiches créées',
        'Sans carte bancaire',
      ],
    },
    {
      plan: boutiquePlan,
      displayName: 'Boutique',
      tagline: 'Le plan de celles et ceux qui vendent.',
      highlight: true,
      badge: 'Recommandé',
      onCta: () => handlePaidPlan(boutiquePlan),
      ctaLabel: 'Choisir Boutique',
      displayFeatures: [
        '200 fiches produit / mois',
        'Score Rank Math 88%+ garanti',
        'Publication 1-clic WooCommerce + Shopify',
        'Import produits en masse (CSV)',
        'Résiliable en 1 clic',
      ],
    },
    {
      plan: proPlan,
      displayName: 'Pro',
      tagline: 'Pour les gros catalogues et les agences.',
      highlight: false,
      badge: null,
      onCta: () => handlePaidPlan(proPlan),
      ctaLabel: 'Choisir Pro',
      displayFeatures: [
        'Crédits illimités',
        'Multi-boutiques WooCommerce',
        'Support prioritaire — réponse sous 24h',
        'Accès anticipé aux nouvelles fonctionnalités',
        'Bonus lancement : onboarding avec le fondateur',
      ],
    },
  ];

  const busy = !!loadingPriceId || userLoading;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: P.cream, color: P.ink, fontFamily: SERIF }}>
      <HeaderLanding />

      <main className="flex-grow pt-24">

        {/* ── En-tête ── */}
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <Suspense fallback={<div className="h-16" />}>
              <WelcomeBanner />
            </Suspense>
            <p className="uppercase tracking-widest text-xs mb-4" style={{ color: P.roseDeep, fontFamily: SANS, letterSpacing: '0.2em' }}>
              Tarifs
            </p>
            <h1 className="text-4xl md:text-5xl leading-tight mb-4" style={{ fontWeight: 500 }}>
              Un prix simple.<br />
              <span style={{ color: P.roseDeep, fontStyle: 'italic' }}>Choisi en paix.</span>
            </h1>
            <p className="text-lg" style={{ color: P.inkSoft, fontFamily: SANS }}>
              Commencez gratuitement, sans carte bancaire. Passez au plan supérieur uniquement le jour où votre boutique en a besoin. Pas avant.
            </p>
          </div>
        </section>

        {/* ── Toggle mensuel / annuel ── */}
        <div className="flex items-center justify-center gap-3 mb-12" style={{ fontFamily: SANS }}>
          <span className="text-sm" style={{ color: annual ? P.inkSoft : P.ink, fontWeight: annual ? 400 : 600 }}>
            Mensuel
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            aria-label="Basculer entre tarif mensuel et annuel"
            className="relative w-14 h-8 rounded-full transition-colors duration-200"
            style={{ backgroundColor: annual ? P.roseDeep : P.pearl, border: `1px solid ${P.rose}` }}
          >
            <span
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all duration-200"
              style={{ left: annual ? 'calc(100% - 28px)' : '4px' }}
            />
          </button>
          <span className="text-sm" style={{ color: annual ? P.ink : P.inkSoft, fontWeight: annual ? 600 : 400 }}>
            Annuel{' '}
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: P.sage, color: 'white' }}>
              2 mois offerts
            </span>
          </span>
        </div>

        {/* ── Les 3 plans ── */}
        <section className="pb-6">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {displayPlans.map(({ plan, displayName, tagline, highlight, badge, onCta, ctaLabel, displayFeatures }) => (
                <div
                  key={plan.id}
                  className="relative rounded-3xl p-8 flex flex-col transition-transform duration-200 hover:-translate-y-1"
                  style={{
                    backgroundColor: highlight ? 'white' : P.pearl,
                    border: highlight ? `2px solid ${P.roseDeep}` : `1px solid ${P.pearl}`,
                    boxShadow: highlight ? '0 16px 40px rgba(179,112,95,0.15)' : 'none',
                  }}
                >
                  {badge && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs uppercase tracking-wider"
                      style={{ backgroundColor: P.roseDeep, color: 'white', fontFamily: SANS, letterSpacing: '0.1em' }}
                    >
                      {badge}
                    </span>
                  )}

                  <h2 className="text-2xl mb-1" style={{ fontWeight: 600 }}>{displayName}</h2>
                  <p className="text-sm mb-6" style={{ color: P.inkSoft, fontFamily: SANS }}>{tagline}</p>

                  <div className="mb-1">
                    <span className="text-5xl" style={{ fontWeight: 500 }}>
                      {plan.price[billingCycle]}
                    </span>
                    {plan.id !== 'free' && (
                      <span className="text-base ml-1" style={{ color: P.inkSoft, fontFamily: SANS }}>/mois</span>
                    )}
                  </div>
                  <p className="text-xs mb-8 h-4" style={{ color: P.inkSoft, fontFamily: SANS }}>
                    {annual && plan.id !== 'free' ? `(${plan.price.annually} facturés annuellement)` : ' '}
                  </p>

                  <ul className="space-y-3 mb-8 flex-1" style={{ fontFamily: SANS }}>
                    {displayFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="mt-0.5 shrink-0" style={{ color: P.sage }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onCta}
                    disabled={busy}
                    className="w-full rounded-full py-3 px-6 text-sm transition-opacity hover:opacity-90 flex items-center justify-center"
                    style={{
                      backgroundColor: highlight ? P.roseDeep : 'transparent',
                      color: highlight ? 'white' : P.roseDeep,
                      border: `1.5px solid ${P.roseDeep}`,
                      fontFamily: SANS,
                      fontWeight: 600,
                    }}
                  >
                    {loadingPriceId === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : ctaLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pack Découverte ── */}
        <section className="py-6">
          <div className="max-w-6xl mx-auto px-6">
            <div
              className="rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10"
              style={{ backgroundColor: 'white', border: `1px dashed ${P.rose}` }}
            >
              <div
                className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: P.pearl }}
              >
                <Heart size={28} style={{ color: P.roseDeep }} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl mb-1" style={{ fontWeight: 600 }}>Pas fan des abonnements ? On comprend.</h3>
                <p className="text-sm" style={{ color: P.inkSoft, fontFamily: SANS }}>
                  <strong style={{ color: P.ink }}>Pack Découverte — {packDecouverte.credits} fiches pour {packDecouverte.price}</strong>, paiement unique,
                  valables {packDecouverte.validityMonths} mois, export CSV inclus. Vous payez une fois, vous utilisez à votre rythme. C&apos;est tout.
                </p>
              </div>
              <button
                onClick={() => handlePackPurchase(packDecouverte)}
                disabled={busy}
                className="shrink-0 inline-flex items-center gap-2 rounded-full py-3 px-6 text-sm hover:opacity-90"
                style={{ backgroundColor: P.ink, color: 'white', fontFamily: SANS, fontWeight: 600 }}
              >
                {loadingPriceId === packDecouverte.id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><span>Acheter le pack — {packDecouverte.price}</span><ArrowRight size={16} /></>
                }
              </button>
            </div>
          </div>
        </section>

        {/* ── Done-for-you ── */}
        <div className="text-center py-4" style={{ fontFamily: SANS }}>
          <p className="text-sm" style={{ color: P.inkSoft }}>
            <Sparkles size={14} className="inline mr-1" style={{ color: P.roseDeep }} />
            Pas le temps du tout ?{' '}
            <strong style={{ color: P.ink }}>On rédige vos 50 premières fiches pour vous</strong> — offre Atelier dès 199€.{' '}
            <a href="mailto:woosenteur@gmail.com" className="underline" style={{ color: P.roseDeep }}>
              Écrivez-nous
            </a>
          </p>
        </div>

        {/* ── Réassurance ── */}
        <section className="py-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid sm:grid-cols-3 gap-4 text-center text-sm" style={{ fontFamily: SANS, color: P.inkSoft }}>
              {[
                { title: 'Sans engagement', desc: 'Résiliez en 1 clic depuis votre espace.' },
                { title: 'Satisfait ou remboursé', desc: '14 jours pour changer d\'avis, sans question.' },
                { title: 'Vos fiches restent à vous', desc: 'Accès à vie à tout ce que vous avez créé.' },
              ].map(({ title, desc }) => (
                <div key={title} className="rounded-2xl py-5 px-4" style={{ backgroundColor: P.pearl }}>
                  <strong style={{ color: P.ink }}>{title}</strong>
                  <br />{desc}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ anti-objections ── */}
        <section className="py-10">
          <div className="max-w-2xl mx-auto px-6">
            <h3 className="text-2xl text-center mb-8" style={{ fontWeight: 600 }}>
              Les questions qu&apos;on nous pose vraiment
            </h3>
            <div className="space-y-4" style={{ fontFamily: SANS }}>
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.q}
                  className="rounded-2xl px-6 py-4 group"
                  style={{ backgroundColor: 'white', border: `1px solid ${P.pearl}` }}
                >
                  <summary className="cursor-pointer text-sm font-semibold list-none flex justify-between items-center">
                    {item.q}
                    <span className="text-xl transition-transform group-open:rotate-45 ml-4 shrink-0" style={{ color: P.roseDeep }}>+</span>
                  </summary>
                  <p className="text-sm mt-3" style={{ color: P.inkSoft }}>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="py-16 text-center">
          <button
            onClick={handleFreePlan}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-full py-4 px-10 text-base hover:opacity-90"
            style={{ backgroundColor: P.roseDeep, color: 'white', fontFamily: SANS, fontWeight: 600 }}
          >
            {loadingPriceId === 'free' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Commencer gratuitement — 5 fiches offertes'}
          </button>
          <p className="text-xs mt-3" style={{ color: P.inkSoft, fontFamily: SANS }}>
            Sans carte bancaire · Résultat en 30 secondes · Vous décidez après
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <PricingPageContent />
    </Suspense>
  );
}
