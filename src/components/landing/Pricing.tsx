'use client';
import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PRICING_PLANS } from '@/lib/pricing-config';
import { motion } from 'framer-motion';

const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    return (
        <section id="pricing" className="py-20 lg:py-24 relative z-10">
            {/* Section glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-[700px] h-[300px] opacity-10 blur-[100px] rounded-full"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }} />
            </div>

            <div className="container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="section-label mb-4 inline-block">Tarifs</span>
                    <h2 className="font-headline text-4xl font-bold text-white">
                        Des tarifs simples{' '}
                        <span className="text-gradient">et transparents.</span>
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-white/50">
                        Choisissez le plan qui correspond à vos besoins. Pas de frais cachés, pas de contrats.
                    </p>
                </motion.div>

                {/* Billing toggle */}
                <div className="mt-10 flex justify-center items-center gap-4">
                    <Label htmlFor="billing-cycle-landing" className={`cursor-pointer text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-white/40'}`}>
                        Mensuel
                    </Label>
                    <Switch
                        id="billing-cycle-landing"
                        checked={billingCycle === 'annually'}
                        onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
                        className="data-[state=checked]:bg-violet-600"
                    />
                    <Label htmlFor="billing-cycle-landing" className={`cursor-pointer text-sm font-medium ${billingCycle === 'annually' ? 'text-white' : 'text-white/40'}`}>
                        Annuel{' '}
                        <span className="ml-1 text-xs font-bold bg-violet-500/15 text-violet-300 border border-violet-500/25 px-2 py-0.5 rounded-full">
                            Économisez 2 mois
                        </span>
                    </Label>
                </div>

                {/* Plans grid */}
                <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4 md:items-start max-w-7xl mx-auto">
                    {PRICING_PLANS.map((plan, i) => {
                        const price = plan.price[billingCycle];
                        const priceDescription = plan.id === 'free' ? plan.priceDescription : `/${billingCycle === 'monthly' ? 'mois' : 'an'}`;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className={`relative flex flex-col text-left transition-all duration-300 ${
                                    plan.isPopular
                                        ? 'glass-card-featured scale-[1.04] z-10'
                                        : 'glass-card hover:-translate-y-1'
                                }`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white"
                                            style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', boxShadow: '0 4px 16px -4px rgba(139,92,246,0.5)' }}>
                                            <Star className="w-3 h-3 fill-current" />
                                            Populaire
                                        </span>
                                    </div>
                                )}

                                <div className="p-6 flex flex-col h-full">
                                    {/* Header */}
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                        <p className="text-sm text-white/45 mt-1 h-10 flex items-center">{plan.description}</p>
                                        <div className="mt-4 flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold text-white">{price}</span>
                                            <span className="text-white/40 text-sm">{priceDescription}</span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 flex-grow">
                                        {plan.features.map((feature, fi) => (
                                            <li key={fi} className="flex items-start gap-2 text-sm">
                                                <Check className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                                                <span className="text-white/55" dangerouslySetInnerHTML={{ __html: feature }} />
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <div className="mt-6 flex flex-col gap-2">
                                        <Link
                                            href="/pricing"
                                            className={`w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all duration-200 ${
                                                plan.isPopular
                                                    ? 'btn-primary-glow text-white'
                                                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-violet-500/30'
                                            }`}
                                            style={plan.isPopular ? { background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' } : {}}
                                        >
                                            {plan.cta}
                                        </Link>
                                        {plan.id !== 'free' && (
                                            <p className="text-xs text-white/25 text-center">
                                                Sans engagement · résiliez quand vous voulez
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
