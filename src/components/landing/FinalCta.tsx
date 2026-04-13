'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Rocket, Check } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase/auth/use-user';
import { WoodyPose } from '@/components/ui/woody-pose';

const FinalCta = () => {
  const { user } = useUser();

  const scrollToTrial = () => {
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 lg:py-24 relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-12 md:p-16 text-center text-white max-w-4xl mx-auto overflow-visible"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.2) 50%, rgba(59,130,246,0.25) 100%)',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 0 80px -20px rgba(139,92,246,0.4), 0 0 40px -15px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Animated gradient border glow */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15), transparent 50%, rgba(59,130,246,0.15))',
            }} />

          {/* Woody */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 hidden md:block z-10">
            <WoodyPose pose="sitting" width={130} className="drop-shadow-2xl" />
          </div>

          {user ? (
            <>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-white pt-8 md:pt-10">
                Générez votre prochaine fiche produit
              </h2>
              <p className="mt-4 mx-auto max-w-xl text-lg text-white/65">
                Accédez au générateur IA et créez des fiches produits optimisées SEO en quelques secondes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" asChild className="btn-primary-glow rounded-full px-8 text-white font-bold border-0">
                    <Link href="/dashboard/generate">
                      <Rocket className="mr-2 h-5 w-5" />
                      Générer maintenant
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-white pt-8 md:pt-10">
                Prêt à créer votre première{' '}
                <br className="hidden sm:block" />
                fiche Woosenteur ?
              </h2>
              <p className="mt-4 mx-auto max-w-xl text-lg text-white/65">
                Commencez gratuitement, sans inscription obligatoire.
              </p>
              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={scrollToTrial}
                  className="btn-primary-glow px-10 py-4 rounded-full text-white font-bold text-lg flex items-center gap-2 mx-auto"
                >
                  <Rocket className="h-5 w-5" />
                  Lancer l&apos;application
                </motion.button>
              </div>
              <div className="mt-8 flex justify-center items-center gap-x-6 gap-y-2 text-sm text-white/55 flex-wrap">
                {['5 fiches gratuites offertes', 'Sans carte bancaire', 'Sans engagement', 'Structure SEO complète'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-violet-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCta;