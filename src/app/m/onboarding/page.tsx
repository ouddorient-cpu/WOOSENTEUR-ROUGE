'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, History } from 'lucide-react';

const ONBOARDING_FLAG = 'woosenteur_onboarded';

const SLIDES = [
  {
    icon: Sparkles,
    title: 'Crée une fiche en quelques secondes',
    description: 'Décris ton produit en quelques mots, Woosenteur rédige une fiche claire et prête à publier.',
  },
  {
    icon: Copy,
    title: 'Copie, partage, exporte',
    description: 'Récupère ta fiche en un tap et utilise-la où tu veux : WooCommerce, Shopify, réseaux sociaux.',
  },
  {
    icon: History,
    title: 'Retrouve tes dernières fiches',
    description: 'Toutes tes fiches sont synchronisées avec ton compte woosenteur.fr.',
  },
];

export default function MobileOnboardingPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [step, setStep] = useState(0);

  const finish = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ONBOARDING_FLAG, '1');
    }
    if (!loading && user) {
      router.replace('/m/accueil');
    } else {
      router.replace('/m/login');
    }
  };

  const slide = SLIDES[step];
  const Icon = slide.icon;
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#C2553B]/10">
              <Icon className="h-10 w-10 text-[#C2553B]" />
            </div>
            <h1 className="font-headline text-2xl font-bold">{slide.title}</h1>
            <p className="max-w-xs text-muted-foreground">{slide.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-[#C2553B]' : 'w-1.5 bg-muted'}`}
            />
          ))}
        </div>
        <Button
          className="w-full bg-[#C2553B] hover:bg-[#A23F29] text-white"
          size="lg"
          onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
        >
          {isLast ? 'Commencer' : 'Continuer'}
        </Button>
        {!isLast && (
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={finish}>
            Passer
          </Button>
        )}
      </div>
    </div>
  );
}
