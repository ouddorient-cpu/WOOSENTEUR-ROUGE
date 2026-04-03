'use client';

import { Badge } from '@/components/ui/badge';
import { Layers, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const BeforeAfter = () => (
  <section className="py-20 lg:py-24 relative overflow-hidden bg-background">
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-1 md:order-2">
          <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30">
            La Différence WooSenteur
          </Badge>
          <h2 className="font-headline text-4xl font-bold text-foreground">
            Passez d&apos;une simple description à{' '}
            <span className="text-gradient">une fiche qui convertit.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Notre agent IA ne se contente pas de rédiger. Il analyse, structure et optimise chaque élément pour maximiser votre visibilité et persuader vos clients.
          </p>
          <ul className="mt-8 space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">Structure SEO Complète</h4>
                <p className="text-muted-foreground">Titre, méta-description, slug optimisé, balises alt image — tout ce qu'il faut pour ranker sur Google.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">Contenu Riche et Persuasif</h4>
                <p className="text-muted-foreground">Description longue structurée, bénéfices produit, conseils d'utilisation — adaptés à chaque catégorie.</p>
              </div>
            </li>
          </ul>
          <Button size="lg" asChild className='mt-8 text-white shadow-lg shadow-secondary/30'>
            <Link href="/pricing">Voir la transformation <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
        <div className="order-2 md:order-1">
          <div className="bg-muted/40 rounded-2xl p-4 md:p-8 border border-border">
            <Image
              src="https://res.cloudinary.com/dzagwz94z/image/upload/v1767178954/ChatGPT_Image_31_d%C3%A9c._2025_12_01_35_as1mxu.png"
              alt="Comparaison avant et après d'une fiche produit optimisée par WooSenteur"
              width={600}
              height={550}
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default BeforeAfter;
