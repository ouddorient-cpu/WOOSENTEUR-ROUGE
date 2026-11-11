'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Sparkles,
  Zap,
  Check,
  Star,
  ExternalLink,
  Gift,
  ArrowRight,
  Shield,
  Loader2,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  Settings,
  Flame,
} from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PRICING_PLANS, CREDIT_PACKS, CreditPack, PricingPlan } from '@/lib/pricing-config';
import { CoinIndicator } from '@/components/ui/coin-indicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { SubscriptionCancellation } from '@/components/dashboard/SubscriptionCancellation';

const C = {
  sage: '#C2553B',
  sagePale: 'rgba(194,85,59,0.10)',
  terra: '#A23F29',
};

export default function BillingPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfilePath);

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [promoMsg, setPromoMsg] = useState('');
  const [isCancellationOpen, setIsCancellationOpen] = useState(false);

  const isSuperAdmin = !!(userProfile?.isUnlimited || userProfile?.role === 'superadmin');
  const creditBalance = userProfile?.creditBalance ?? 0;
  const currentPlanId = userProfile?.subscriptionPlan || 'free';
  const customerPortalLink = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_LINK;

  // Maximum credits according to plan for the visual progress bar
  const planCreditsQuota = (() => {
    if (isSuperAdmin) return 999;
    if (currentPlanId === 'premium') return 999;
    if (currentPlanId === 'standard') return 200;
    if (currentPlanId === 'essential') return 50;
    return 5;
  })();

  const usagePercent = isSuperAdmin
    ? 100
    : Math.min(100, Math.round((creditBalance / planCreditsQuota) * 100));

  // Handler: Purchase a Credit Pack (Top-up on demand)
  const handlePackPurchase = async (pack: CreditPack) => {
    if (!user) {
      router.push('/login?redirect=/dashboard/billing');
      return;
    }
    setLoadingAction(pack.id);
    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch('/api/checkout/pack', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création de la session de paiement.');
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de paiement',
        description: err.message || 'Impossible de lancer le paiement Stripe.',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  // Handler: Subscribe / Upgrade to a Plan
  const handlePlanSubscribe = (plan: PricingPlan) => {
    if (!user) {
      router.push('/login?redirect=/dashboard/billing');
      return;
    }
    if (plan.id === 'free') {
      toast({
        title: 'Plan Gratuit déjà activé',
        description: 'Vous bénéficiez déjà des fonctionnalités de base ou vous pouvez recharger avec un pack.',
      });
      return;
    }
    if (!plan.paymentLink) {
      toast({
        variant: 'destructive',
        title: 'Plan indisponible',
        description: 'Lien de paiement non configuré pour cette formule.',
      });
      return;
    }

    const link = plan.paymentLink[billingCycle];
    if (!link) {
      toast({
        variant: 'destructive',
        title: 'Plan indisponible',
        description: 'Lien Stripe indisponible pour ce cycle.',
      });
      return;
    }

    setLoadingAction(plan.id);
    try {
      const url = new URL(link);
      url.searchParams.set('prefilled_email', user.email || '');
      url.searchParams.set('client_reference_id', user.uid);
      window.location.assign(url.toString());
    } catch (err: any) {
      setLoadingAction(null);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de vous rediriger vers Stripe.',
      });
    }
  };

  // Handler: Stripe Customer Portal
  const handleOpenCustomerPortal = () => {
    if (customerPortalLink && user?.email) {
      window.open(`${customerPortalLink}?prefilled_email=${encodeURIComponent(user.email)}`, '_blank');
    } else {
      toast({
        variant: 'warning',
        title: 'Portail client',
        description: 'Le lien du portail de facturation Stripe est en cours de configuration.',
      });
    }
  };

  // Handler: Promo Code redemption
  const handleRedeemPromo = useCallback(async () => {
    if (!promoCode.trim() || !user) return;
    setPromoStatus('loading');
    setPromoMsg('');
    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch('/api/redeem-promo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible d'appliquer ce code promo.");

      setPromoStatus('success');
      setPromoMsg(`+${data.creditsAdded} crédits ajoutés avec succès ! 🎉`);
      setPromoCode('');
      toast({
        variant: 'success',
        title: 'Code activé !',
        description: `Votre solde a été crédité de ${data.creditsAdded} crédits.`,
      });
    } catch (err: any) {
      setPromoStatus('error');
      setPromoMsg(err.message || 'Code invalide ou déjà utilisé.');
    }
  }, [promoCode, user, toast]);

  if (userLoading || profileLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C2553B]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 max-w-6xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: C.sagePale, color: C.sage }}>
            <Zap className="h-3.5 w-3.5 fill-current" />
            Studio Billing & Crédits
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Facturation & Crédits
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Suivez votre solde en temps réel, rechargez des fiches à la demande ou gérez votre abonnement.
          </p>
        </div>

        {customerPortalLink && (
          <Button variant="outline" size="sm" onClick={handleOpenCustomerPortal} className="self-start md:self-auto gap-2">
            <Settings className="h-4 w-4" />
            Factures & Moyens de paiement
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* ── SECTION 1 : VUE D'ENSEMBLE DU SOLDE (STYLE CAMB.AI) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Solde de crédits */}
        <Card className="md:col-span-2 border-2 relative overflow-hidden bg-card/60 backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <CoinsIcon className="w-32 h-32" />
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Solde Disponible</span>
              <Badge variant={creditBalance > 0 || isSuperAdmin ? 'default' : 'destructive'} className="text-xs">
                {isSuperAdmin ? 'Compte Illimité' : creditBalance > 0 ? 'Prêt à générer' : 'Crédits épuisés'}
              </Badge>
            </div>
            <CardTitle className="text-4xl md:text-5xl font-black tracking-tight text-foreground flex items-center gap-3 pt-2">
              {isSuperAdmin ? (
                <span className="text-[#C2553B]">Illimité (Admin)</span>
              ) : (
                <>
                  <CoinIndicator amount={creditBalance} showLabel={false} className="border-none bg-transparent p-0 shadow-none scale-125 origin-left" />
                  <span>{creditBalance} <span className="text-xl font-medium text-muted-foreground">crédits</span></span>
                </>
              )}
            </CardTitle>
            <CardDescription className="text-xs pt-1">
              1 crédit = 1 fiche produit SEO complète (Rank Math 88%+ · Export CSV · Publication 1-clic WooCommerce)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {!isSuperAdmin && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Quota estimé : {creditBalance} / {planCreditsQuota}</span>
                  <span>{usagePercent}% disponible</span>
                </div>
                <Progress value={usagePercent} className="h-2.5 rounded-full" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="sm" className="bg-[#C2553B] hover:bg-[#A23F29] text-white">
                <a href="#recharge-packs">
                  <Flame className="h-4 w-4 mr-1.5 fill-current" />
                  Recharger des crédits (dès 4,90 €)
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/generate">
                  <Sparkles className="h-4 w-4 mr-1.5 text-[#C2553B]" />
                  Aller au Générateur
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Formule Active & Code Promo */}
        <div className="space-y-6">
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Formule Actuelle</span>
              <div className="flex items-center justify-between pt-1">
                <CardTitle className="text-2xl font-bold capitalize text-foreground">
                  {isSuperAdmin ? 'SuperAdmin' : currentPlanId === 'standard' ? 'Boutique' : currentPlanId === 'premium' ? 'Pro' : currentPlanId}
                </CardTitle>
                <Badge variant={userProfile?.subscriptionStatus === 'active' ? 'default' : 'secondary'} className="capitalize">
                  {isSuperAdmin ? 'VIP' : userProfile?.subscriptionStatus || 'Essai'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-3">
              <p>
                {isSuperAdmin
                  ? 'Accès complet et illimité à tous les modules Woosenteur.'
                  : currentPlanId === 'standard'
                  ? 'Plan idéal avec 200 fiches / mois et publication automatique.'
                  : currentPlanId === 'essential'
                  ? 'Plan découverte avec 50 fiches / mois.'
                  : 'Mode gratuit : vous pouvez recharger à l\'usage ou vous abonner.'}
              </p>
              <Button asChild variant="ghost" size="sm" className="w-full justify-between text-xs px-0 hover:bg-transparent text-[#C2553B]">
                <a href="#plans">
                  Changer de formule d'abonnement
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Widget Code Promo */}
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Gift className="h-4 w-4 text-[#C2553B]" />
                Activer un Code Promo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="EXEMPLE10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="text-xs uppercase"
                  disabled={promoStatus === 'loading'}
                />
                <Button size="sm" onClick={handleRedeemPromo} disabled={!promoCode.trim() || promoStatus === 'loading'} className="text-xs shrink-0 bg-[#C2553B] hover:bg-[#A23F29] text-white">
                  {promoStatus === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Valider'}
                </Button>
              </div>
              {promoMsg && (
                <p className={`text-xs ${promoStatus === 'success' ? 'text-green-600 font-medium' : 'text-destructive'}`}>
                  {promoMsg}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── SECTION 2 : RECHARGES IMMÉDIATES / TOP-UP (SANS ENGAGEMENT) ── */}
      <section id="recharge-packs" className="space-y-6 pt-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: C.sagePale, color: C.sage }}>
            <Zap className="h-3.5 w-3.5" />
            Packs de Recharge Immédiate (Top-Up)
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Rechargez vos crédits en 1 clic
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Besoin de fiches ponctuelles sans modifier votre abonnement ? Achetez un pack sans engagement, vos crédits s'ajoutent instantanément à votre compte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {CREDIT_PACKS.map((pack) => {
            const isBusy = loadingAction === pack.id;
            return (
              <Card
                key={pack.id}
                className={`relative flex flex-col justify-between border-2 transition-all duration-200 hover:-translate-y-1 ${
                  pack.isPopular ? 'border-[#C2553B] shadow-lg shadow-[#C2553B]/10 bg-card' : 'bg-card/70'
                }`}
              >
                {pack.isPopular && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-white bg-[#C2553B] shadow-sm">
                    <Star className="w-3 h-3 fill-current" /> Le plus populaire
                  </span>
                )}

                <CardHeader>
                  <div className="flex items-baseline justify-between mb-2">
                    <CardTitle className="text-xl font-bold text-foreground">{pack.name}</CardTitle>
                    <div className="text-right">
                      <span className="text-3xl font-black text-foreground">{pack.price}</span>
                      <span className="text-xs text-muted-foreground block">paiement unique</span>
                    </div>
                  </div>
                  <CardDescription className="text-sm">{pack.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50 border flex items-center justify-between">
                    <span className="text-sm font-medium">Quantité :</span>
                    <span className="text-base font-extrabold text-[#C2553B]">+{pack.credits} crédits</span>
                  </div>

                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {pack.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-[#C2553B] shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: feat }} />
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    onClick={() => handlePackPurchase(pack)}
                    disabled={isBusy}
                    className={`w-full font-semibold ${
                      pack.isPopular ? 'bg-[#C2553B] hover:bg-[#A23F29] text-white' : ''
                    }`}
                    variant={pack.isPopular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ouverture Stripe...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4 fill-current" />
                        {pack.cta}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 3 : FORFAITS & ABONNEMENTS RÉCURRENTS ── */}
      <section id="plans" className="space-y-6 pt-8 border-t">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: C.sagePale, color: C.sage }}>
              <Layers className="h-3.5 w-3.5" />
              Abonnements Réguliers
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Formules Mensuelles & Annuelles
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Des crédits renouvelés chaque mois pour automatiser tout votre catalogue de parfums et cosmétiques.
            </p>
          </div>

          {/* Toggle Mensuel / Annuel */}
          <div className="flex items-center gap-3 bg-muted/60 p-1.5 rounded-full border self-start md:self-auto">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition-colors ${
                billingCycle === 'monthly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Mensuel
            </span>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1.5 ${
                billingCycle === 'annually' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
              onClick={() => setBillingCycle('annually')}
            >
              Annuel
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#C2553B] text-white">
                -20%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PRICING_PLANS.filter((p) => p.id !== 'free').map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const isBusy = loadingAction === plan.id;
            const priceLabel = plan.price[billingCycle];

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between border-2 transition-all duration-200 hover:-translate-y-1 ${
                  plan.isPopular ? 'border-[#C2553B] shadow-xl shadow-[#C2553B]/10 bg-card' : 'bg-card/70'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-white bg-[#C2553B] shadow-sm">
                    <Star className="w-3 h-3 fill-current" /> Recommandé
                  </span>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="outline" className="border-green-600 text-green-600 font-bold text-xs">
                        Plan Actuel
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs min-h-[32px]">{plan.description}</CardDescription>

                  <div className="pt-4 pb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-foreground">{priceLabel}</span>
                      <span className="text-xs text-muted-foreground">
                        {billingCycle === 'monthly' ? '/mois' : '/an'}
                      </span>
                    </div>
                    {billingCycle === 'annually' && (
                      <p className="text-[11px] text-[#C2553B] font-medium mt-0.5">Équivaut à 2 mois offerts</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="p-2.5 rounded-lg bg-muted/40 border text-xs flex items-center justify-between">
                    <span className="font-medium text-foreground">Quota mensuel :</span>
                    <span className="font-bold text-[#C2553B]">
                      {plan.id === 'premium' ? 'Illimité ∞' : `${plan.credits.monthly} crédits / mois`}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#C2553B] shrink-0 mt-0.5" />
                        <span dangerouslySetInnerHTML={{ __html: feat }} />
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-3">
                  <Button
                    onClick={() => handlePlanSubscribe(plan)}
                    disabled={isBusy || (isCurrent && userProfile?.subscriptionStatus === 'active')}
                    className={`w-full font-semibold ${
                      plan.isPopular ? 'bg-[#C2553B] hover:bg-[#A23F29] text-white' : ''
                    }`}
                    variant={isCurrent ? 'secondary' : plan.isPopular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirection Stripe...
                      </>
                    ) : isCurrent ? (
                      'Votre formule active'
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 4 : TRANSPARENCE SUR LES CRÉDITS (BARÈME SAAS) ── */}
      <section className="space-y-4 pt-8 border-t">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-[#C2553B]" />
          Comment sont consommés vos crédits ?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border bg-card/60 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Génération Produit</div>
            <div className="text-lg font-bold text-foreground">1 Crédit</div>
            <p className="text-xs text-muted-foreground">
              Titre SEO, description narrative, notes olfactives, balises Rank Math et FAQ schema.
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-card/60 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Publication WooCommerce</div>
            <div className="text-lg font-bold text-green-600">0 Crédit (Gratuit)</div>
            <p className="text-xs text-muted-foreground">
              Envoi automatique et instantané vers votre boutique WordPress/WooCommerce.
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-card/60 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Export Fichiers CSV</div>
            <div className="text-lg font-bold text-green-600">0 Crédit (Gratuit)</div>
            <p className="text-xs text-muted-foreground">
              Téléchargement illimité au format officiel WooCommerce FR et Shopify.
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-card/60 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Validation Image IA</div>
            <div className="text-lg font-bold text-green-600">0 Crédit (Gratuit)</div>
            <p className="text-xs text-muted-foreground">
              Analyse de l'esthétique et génération du texte ALT optimisé pour le référencement.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 5 : GESTION STRIPE & RÉSILIATION ── */}
      {!isSuperAdmin && (
        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#C2553B]" />
            <span>Paiements sécurisés par carte bancaire via Stripe. Sans engagement.</span>
          </div>
          {customerPortalLink && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleOpenCustomerPortal}
                className="underline hover:text-foreground transition-colors"
              >
                Télécharger mes factures
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setIsCancellationOpen(true)}
                className="text-muted-foreground/80 hover:text-destructive transition-colors"
              >
                Résilier l'abonnement
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modale de résiliation Stripe */}
      {user && customerPortalLink && (
        <SubscriptionCancellation
          isOpen={isCancellationOpen}
          onOpenChange={setIsCancellationOpen}
          stripePortalUrl={`${customerPortalLink}?prefilled_email=${encodeURIComponent(user.email || '')}`}
        />
      )}
    </div>
  );
}

function CoinsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}
