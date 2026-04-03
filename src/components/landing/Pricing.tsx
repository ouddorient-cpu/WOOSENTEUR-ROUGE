'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PRICING_PLANS } from '@/lib/pricing-config';

const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    return (
        <section id="pricing" className="py-20 lg:py-24">
            <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="font-headline text-4xl font-bold text-foreground">
                  Des tarifs simples{' '}
                  <span className="text-gradient">et transparents.</span>
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Choisissez le plan qui correspond à vos besoins. Pas de frais cachés, pas de contrats.
                </p>

                <div className="mt-10 flex justify-center items-center gap-4">
                    <Label htmlFor="billing-cycle-landing" className={`cursor-pointer ${billingCycle === 'monthly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        Mensuel
                    </Label>
                    <Switch
                        id="billing-cycle-landing"
                        checked={billingCycle === 'annually'}
                        onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
                    />
                    <Label htmlFor="billing-cycle-landing" className={`cursor-pointer ${billingCycle === 'annually' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        Annuel <Badge variant="outline" className="ml-1 -translate-y-px bg-green-500/10 text-green-600 border-green-500/20">Économisez 2 mois</Badge>
                    </Label>
                </div>

                <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4 md:items-start max-w-7xl mx-auto">
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
                                        asChild
                                    >
                                        <Link href="/pricing">{plan.cta}</Link>
                                    </Button>
                                    {plan.id !== 'free' && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            Sans engagement · résiliez quand vous voulez
                                        </p>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
