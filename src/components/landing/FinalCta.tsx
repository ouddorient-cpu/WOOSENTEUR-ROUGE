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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const input = document.querySelector('input[name="productName"]') as HTMLInputElement;
      input?.focus();
    }, 600);
  };

  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-violet-700 p-12 md:p-16 text-center text-white max-w-4xl mx-auto relative overflow-visible"
        >
          {/* Woody assis sur le bord supérieur de la card */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 hidden md:block">
            <WoodyPose pose="sitting" width={130} className="drop-shadow-xl" />
          </div>
          {user ? (
            <>
              <h2 className="font-headline text-3xl md:text-4xl font-bold">
                Générez votre prochaine fiche produit
              </h2>
              <p className="mt-4 mx-auto max-w-xl text-lg text-white/80">
                Accédez au générateur IA et créez des fiches produits optimisées SEO en quelques secondes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="secondary" asChild className="rounded-full px-8">
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
              <h2 className="font-headline text-3xl md:text-4xl font-bold">
                Prêt à créer votre première{' '}
                <br className="hidden sm:block" />
                fiche Woosenteur ?
              </h2>
              <p className="mt-4 mx-auto max-w-xl text-lg text-white/80">
                Commencez gratuitement, sans inscription obligatoire.
              </p>
              <div className="mt-8">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full px-8 py-6 text-lg"
                    onClick={scrollToTrial}
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Lancer l'application
                  </Button>
                </motion.div>
              </div>
              <div className="mt-8 flex justify-center items-center gap-x-6 gap-y-2 text-sm text-white/80 flex-wrap">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>5 fiches gratuites offertes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Sans carte bancaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Sans engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Structure SEO complète</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCta;
