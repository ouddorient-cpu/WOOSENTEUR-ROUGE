'use client';

import { motion } from 'framer-motion';
import { Megaphone, Image as ImageIcon, Palette, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const features = [
  {
    icon: <Megaphone className="h-6 w-6" />,
    title: 'Textes publicitaires IA',
    description: 'Accroches, descriptions et hashtags générés automatiquement',
  },
  {
    icon: <ImageIcon className="h-6 w-6" />,
    title: 'Visuels IA (FLUX)',
    description: 'Images professionnelles générées pour Instagram et Facebook',
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: '3 styles créatifs',
    description: 'Luxe, Clean ou Fun - adaptés à votre marque',
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: 'Export facile',
    description: 'Téléchargez vos visuels et copiez vos textes en 1 clic',
  },
];

const MarketingFeature = () => {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Megaphone className="h-4 w-4" />
              Nouveau
            </span>

            <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">
              Génération de publicités{' '}
              <span className="text-primary">complète</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Créez des campagnes publicitaires professionnelles pour vos produits cosmétiques.
              Textes + images générés par notre agent, prêts à publier sur Instagram et Facebook.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button asChild size="lg" className="rounded-full">
                <Link href="/dashboard/marketing">
                  <Megaphone className="mr-2 h-5 w-5" />
                  Créer une campagne
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Visual mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card rounded-2xl shadow-2xl p-6 border border-border">
              {/* Mock header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                <div className="h-3 w-3 rounded-full bg-green-400"></div>
                <span className="ml-2 text-xs text-muted-foreground">Marketing IA</span>
              </div>

              {/* Mock content - 3 variant cards */}
              <div className="grid grid-cols-3 gap-3">
                {['Luxe', 'Clean', 'Fun'].map((style, index) => (
                  <div key={style} className="relative">
                    <div className={`aspect-square rounded-lg ${index === 0 ? 'bg-gradient-to-br from-amber-100 to-yellow-200' :
                      index === 1 ? 'bg-gradient-to-br from-green-100 to-emerald-200' :
                        'bg-gradient-to-br from-pink-100 to-rose-200'
                      } flex items-center justify-center`}>
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-foreground">{style}</div>
                      <div className="h-2 bg-gray-200 rounded mt-1 w-full"></div>
                      <div className="h-2 bg-gray-100 rounded mt-1 w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock progress bar */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>3 variantes générées</span>
                  <span className="text-primary font-medium">2 crédits</span>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 top-4 left-4 w-full h-full bg-primary/10 rounded-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MarketingFeature;
