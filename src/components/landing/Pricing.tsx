'use client';
import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PRICING_PLANS } from '@/lib/pricing-config';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n/useT';

const C = {
  bg: '#FAF6F0', bgAlt: '#F3ECE4', surface: '#FDF9F5',
  text: '#2E2018', muted: '#7A6D62', border: '#E5DDD4',
  sage: '#7D9B76', sagePale: '#EDF2EC',
  terra: '#D4704A', terraDark: '#BF5E3A',
};

const Pricing = () => {
  const t = useT();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  return (
    <section id="pricing" className="py-20 lg:py-24 relative" style={{ background: C.bgAlt }}>
      <div className="container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span
            className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide"
            style={{ background: C.sagePale, color: C.sage }}
          >
            ✦ {t.pricing.label}
          </span>
          <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 700, color: C.text }}>
            {t.pricing.title}{' '}
            <span style={{ color: C.terra }}>{t.pricing.titleGradient}</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg" style={{ color: C.muted }}>
            {t.pricing.sub}
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="mt-10 flex justify-center items-center gap-4">
          <Label htmlFor="billing-cycle-landing" className="cursor-pointer text-sm font-medium" style={{ color: billingCycle === 'monthly' ? C.text : C.muted }}>
            {t.pricing.monthly}
          </Label>
          <Switch
            id="billing-cycle-landing"
            checked={billingCycle === 'annually'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
          />
          <Label htmlFor="billing-cycle-landing" className="cursor-pointer text-sm font-medium" style={{ color: billingCycle === 'annually' ? C.text : C.muted }}>
            {t.pricing.annually}{' '}
            <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: C.sagePale, color: C.sage }}>
              {t.pricing.save2months}
            </span>
          </Label>
        </div>

        {/* Plans grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4 md:items-start max-w-7xl mx-auto">
          {PRICING_PLANS.map((plan, i) => {
            const price = plan.price[billingCycle];
            const priceDescription = plan.id === 'free' ? plan.priceDescription : `/${billingCycle === 'monthly' ? t.pricing.perMonth : t.pricing.perYear}`;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative flex flex-col text-left transition-all duration-300 hover:-translate-y-1 rounded-2xl"
                style={{
                  background: C.surface,
                  border: `2px solid ${plan.isPopular ? C.terra : C.border}`,
                  transform: plan.isPopular ? 'scale(1.04)' : undefined,
                  zIndex: plan.isPopular ? 10 : undefined,
                  boxShadow: plan.isPopular ? `0 8px 32px -8px rgba(212,112,74,0.25)` : '0 2px 12px rgba(46,32,24,0.06)',
                }}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: C.terra }}>
                      <Star className="w-3 h-3 fill-current" />
                      {t.pricing.popular}
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
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: C.sage }} />
                        <span style={{ color: C.muted }} dangerouslySetInnerHTML={{ __html: feature }} />
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      href="/pricing"
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all duration-200"
                      style={plan.isPopular
                        ? { background: C.terra, color: '#fff', boxShadow: `0 4px 16px -4px rgba(212,112,74,0.4)` }
                        : { background: C.sagePale, color: C.sage, border: `1px solid ${C.border}` }
                      }
                    >
                      {plan.cta}
                    </Link>
                    {plan.id !== 'free' && (
                      <p className="text-xs text-center" style={{ color: C.muted }}>
                        {t.pricing.noCommitment}
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
