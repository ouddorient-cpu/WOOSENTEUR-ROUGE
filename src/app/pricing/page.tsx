
'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, Star, Loader2, Rocket } from 'lucide-react';
import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/footer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WelcomeBanner } from './welcome-banner';
import { PRICING_PLANS } from '@/lib/pricing-config';


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
                variant: "success",
                title: "C'est parti ! 🎉",
                description: "Vos 5 crédits gratuits ont été ajoutés. Vous allez être redirigé vers le générateur.",
            });
            setTimeout(() => router.push('/dashboard/onboarding'), 2000);

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Erreur',
                description: error.message || 'Impossible d\'activer le plan gratuit.',
            });
        } finally {
            setLoadingPriceId(null);
        }
    };
    
    const handlePaidPlan = (plan: typeof PRICING_PLANS[0]) => {
        if (!user) {
            router.push(`/signup?redirect=/pricing`);
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
            console.error("Stripe redirection error:", error);
            toast({
                variant: 'destructive',
                title: 'Erreur de redirection',
                description: 'Impossible de vous rediriger vers la page de paiement. Veuillez réessayer.'
            });
        }
    };


    return (
        <div className="bg-background text-foreground min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-24">
                <section className="py-16 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 text-center">
                        <Suspense fallback={<div className="h-24"></div>}>
                            <WelcomeBanner />
                        </Suspense>
                        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-gradient">
                            Un tarif simple pour des résultats professionnels
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                            Chaque plan est conçu pour s'adapter à votre croissance. Commencez gratuitement, évoluez selon vos besoins.
                        </p>
                        <div className="mt-10 flex justify-center items-center gap-4">
                            <Label htmlFor="billing-cycle" className={`cursor-pointer ${billingCycle === 'monthly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                Mensuel
                            </Label>
                            <Switch
                                id="billing-cycle"
                                checked={billingCycle === 'annually'}
                                onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
                            />
                            <Label htmlFor="billing-cycle" className={`cursor-pointer ${billingCycle === 'annually' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                Annuel <Badge variant="outline" className="ml-1 -translate-y-px bg-green-100/80 text-green-700 border-green-300">Économisez 2 mois</Badge>
                            </Label>
                        </div>
                    </div>
                </section>

                <section className="pb-16 md:pb-20">
                  <div className="container mx-auto px-4 md:px-6">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 md:items-start max-w-7xl mx-auto">
                        {PRICING_PLANS.map((plan) => {
                             const price = plan.price[billingCycle];
                             const priceDescription = plan.id === 'free' ? plan.priceDescription : `/${billingCycle === 'monthly' ? 'mois' : 'an'}`;

                            return (
                            <Card
                                key={plan.id}
                                className={`relative flex flex-col h-full text-left transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${plan.isPopular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'}`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                                        <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                                            <Star className="w-3 h-3 mr-1 fill-current" />
                                            Populaire
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1 h-10">
                                        {plan.description}
                                    </CardDescription>
                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-4xl font-extrabold">{price}</span>
                                        <span className="ml-1 text-muted-foreground text-sm">{priceDescription}</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-grow">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: feature }} />
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter className="flex flex-col gap-2">
                                    <Button
                                        className={`w-full ${plan.isPopular ? 'shadow-lg shadow-primary/30' : ''}`}
                                        variant={plan.isPopular ? 'default' : 'outline'}
                                        disabled={!!loadingPriceId || userLoading}
                                        onClick={() => plan.id === 'free' ? handleFreePlan() : handlePaidPlan(plan)}
                                    >
                                        {loadingPriceId === plan.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            plan.cta
                                        )}
                                    </Button>
                                    {plan.id !== 'free' && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            Sans engagement · résiliez quand vous voulez
                                        </p>
                                    )}
                                </CardFooter>
                            </Card>
                        )})}
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
