
'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Star, Loader2, Package } from 'lucide-react';
import HeaderLanding from '@/components/header-landing';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/footer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WelcomeBanner } from './welcome-banner';
import { PRICING_PLANS, CREDIT_PACKS, CreditPack } from '@/lib/pricing-config';

const C = {
  bg: '#07090F', bgAlt: '#0A0F1C', surface: '#0D1525',
  text: '#E2EAF8', muted: '#6B7FAD', border: '#101E36',
  sage: '#3B82F6', sagePale: 'rgba(59,130,246,0.10)',
  terra: '#2563EB', terraDark: '#1D4ED8',
};

function PricingPageContent() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const handleFreePlan = async () => {
    if (!user) {
      router.push('/signup?redirect=/pricing&new_user=true');
      return;
    }
    setLoadingPriceId('free');
    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch('/api/user/activate-free', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast({
        variant: 'success',
        title: "C'est parti ! 🎉",
        description: 'Vos 5 crédits gratuits ont été ajoutés. Vous allez être redirigé vers le générateur.',
      });
      setTimeout(() => router.push('/dashboard/onboarding'), 2000);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || "Impossible d'activer le plan gratuit.",
      });
    } finally {
      setLoadingPriceId(null);
    }
  };

  const handlePackPurchase = async (pack: CreditPack) => {
    if (!user) {
      router.push('/signup?redirect=/pricing');
      return;
    }
    setLoadingPriceId(pack.id);
    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch('/api/checkout/pack', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (error: any) {
      setLoadingPriceId(null);
      toast({ variant: 'destructive', title: 'Erreur', description: error.message || 'Impossible de lancer le paiement.' });
    }
  };

  const handlePaidPlan = (plan: typeof PRICING_PLANS[0]) => {
    if (!user) {
      router.push('/signup?redirect=/pricing');
      return;
    }
    if (!('paymentLink' in plan) || !plan.paymentLink) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Plan de paiement non configurable.' });
      return;
    }
    const link = plan.paymentLink[billingCycle];
    if (!link) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Lien de paiement non disponible pour ce cycle.' });
      return;
    }
    setLoadingPriceId(plan.id);
    try {
      const url = new URL(link);
      url.searchParams.set('prefilled_email', user.email || '');
      url.searchParams.set('client_reference_id', user.uid);
      window.location.assign(url.toString());
    } catch (error: any) {
      setLoadingPriceId(null);
      toast({ variant: 'destructive', title: 'Erreur de redirection', description: 'Impossible de vous rediriger vers la page de paiement. Veuillez réessayer.' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text }}>
      <HeaderLanding />
      <main className="flex-grow pt-24">

        {/* Hero */}
        <section className="py-16 md:py-20 text-center">
          <div className="container mx-auto px-4 md:px-6">
            <Suspense fallback={<div className="h-24" />}>
              <WelcomeBanner />
            </Suspense>
            <span
              className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide"
              style={{ background: C.sagePale, color: C.sage }}
            >
              ✦ Tarifs
            </span>
            <h1
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(2rem,6vw,3.2rem)', fontWeight: 700, color: C.text }}
            >
              Un tarif simple pour des{' '}
              <span style={{ color: C.terra }}>résultats professionnels</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg" style={{ color: C.muted }}>
              Commencez gratuitement, évoluez selon vos besoins. Sans engagement.
            </p>

            {/* Billing toggle */}
            <div className="mt-10 flex justify-center items-center gap-4">
              <Label
                htmlFor="billing-cycle"
                className="cursor-pointer text-sm font-medium"
                style={{ color: billingCycle === 'monthly' ? C.text : C.muted }}
              >
                Mensuel
              </Label>
              <Switch
                id="billing-cycle"
                checked={billingCycle === 'annually'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
              />
              <Label
                htmlFor="billing-cycle"
                className="cursor-pointer text-sm font-medium"
                style={{ color: billingCycle === 'annually' ? C.text : C.muted }}
              >
                Annuel{' '}
                <span
                  className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: C.sagePale, color: C.sage }}
                >
                  Économisez 2 mois
                </span>
              </Label>
            </div>
          </div>
        </section>

        {/* Credit Packs */}
        <section className="pb-10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 justify-center mb-6">
                <Package className="h-5 w-5" style={{ color: C.sage }} />
                <span className="text-base font-semibold" style={{ color: C.sage }}>Packs de crédits — paiement unique, sans abonnement</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {CREDIT_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className="relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: C.surface,
                      border: `2px solid ${pack.isPopular ? C.terra : C.border}`,
                      boxShadow: pack.isPopular ? '0 8px 24px -8px rgba(212,112,74,0.2)' : '0 2px 8px rgba(46,32,24,0.05)',
                    }}
                  >
                    {pack.isPopular && (
                      <span className="absolute -top-3 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: C.terra }}>
                        <Star className="w-3 h-3 fill-current" /> Le plus choisi
                      </span>
                    )}
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-extrabold" style={{ color: C.text }}>{pack.price}</span>
                      <span className="text-sm" style={{ color: C.muted }}>paiement unique</span>
                    </div>
                    <p className="font-bold text-base mb-3" style={{ color: C.text }}>{pack.name}</p>
                    <ul className="space-y-2 flex-grow mb-5">
                      {pack.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-5 w-5 shrink-0 mt-0.5" style={{ color: C.sage }} />
                          <span style={{ color: C.muted }} dangerouslySetInnerHTML={{ __html: f }} />
                        </li>
                      ))}
                    </ul>
                    <button
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200"
                      style={pack.isPopular
                        ? { background: C.terra, color: '#fff', boxShadow: '0 4px 16px -4px rgba(212,112,74,0.4)' }
                        : { background: C.sagePale, color: C.sage, border: `1px solid ${C.border}` }
                      }
                      disabled={!!loadingPriceId || userLoading}
                      onClick={() => handlePackPurchase(pack)}
                    >
                      {loadingPriceId === pack.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : pack.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 mb-6 flex items-center gap-4 max-w-7xl mx-auto">
              <div className="flex-1 border-t" style={{ borderColor: C.border }} />
              <span className="text-sm font-medium px-3" style={{ color: C.muted }}>ou choisissez un abonnement mensuel</span>
              <div className="flex-1 border-t" style={{ borderColor: C.border }} />
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="pb-20 md:pb-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 md:items-start max-w-7xl mx-auto">
              {PRICING_PLANS.map((plan) => {
                const price = plan.price[billingCycle];
                const priceDescription = plan.id === 'free' ? plan.priceDescription : `/${billingCycle === 'monthly' ? 'mois' : 'an'}`;

                return (
                  <div
                    key={plan.id}
                    className="relative flex flex-col transition-all duration-300 hover:-translate-y-1 rounded-2xl"
                    style={{
                      background: C.surface,
                      border: `2px solid ${plan.isPopular ? C.terra : C.border}`,
                      transform: plan.isPopular ? 'scale(1.04)' : undefined,
                      zIndex: plan.isPopular ? 10 : undefined,
                      boxShadow: plan.isPopular ? '0 8px 32px -8px rgba(212,112,74,0.25)' : '0 2px 12px rgba(46,32,24,0.06)',
                    }}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-0 right-0 flex justify-center">
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={{ background: C.terra }}
                        >
                          <Star className="w-3 h-3 fill-current" />
                          Populaire
                        </span>
                      </div>
                    )}

                    <div className="p-6 flex flex-col h-full">
                      <div className="mb-6">
                        <h3 className="text-xl font-bold" style={{ color: C.text }}>{plan.name}</h3>
                        <p className="text-sm mt-1 h-10 flex items-center" style={{ color: C.muted }}>{plan.description}</p>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold" style={{ color: C.text }}>{price}</span>
                          <span className="text-sm" style={{ color: C.muted }}>{priceDescription}</span>
                        </div>
                      </div>

                      <ul className="space-y-3 flex-grow">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-5 w-5 shrink-0 mt-0.5" style={{ color: C.sage }} />
                            <span style={{ color: C.muted }} dangerouslySetInnerHTML={{ __html: feature }} />
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 flex flex-col gap-2">
                        <button
                          className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200"
                          style={plan.isPopular
                            ? { background: C.terra, color: '#fff', boxShadow: '0 4px 16px -4px rgba(212,112,74,0.4)' }
                            : { background: C.sagePale, color: C.sage, border: `1px solid ${C.border}` }
                          }
                          disabled={!!loadingPriceId || userLoading}
                          onClick={() => plan.id === 'free' ? handleFreePlan() : handlePaidPlan(plan)}
                        >
                          {loadingPriceId === plan.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            plan.cta
                          )}
                        </button>
                        {plan.id !== 'free' && (
                          <p className="text-xs text-center" style={{ color: C.muted }}>
                            Sans engagement · résiliez quand vous voulez
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Guarantees strip */}
        <section className="py-12 border-t" style={{ borderColor: C.border, background: C.bgAlt }}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium" style={{ color: C.muted }}>
              {['✓ Sans engagement', '✓ Résiliez à tout moment', '✓ Support humain inclus', '✓ Données sécurisées'].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
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
