
'use client';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, Zap, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const OneClickPublish = () => (
    <section className="py-20 lg:py-24 relative overflow-hidden">
       <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dzagwz94z/image/upload/v1767267988/ChatGPT_Image_29_d%C3%A9c._2025_23_42_04_dku5kn.png"
            alt="Fond texturé"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-10"
          />
           <div className="absolute inset-0 bg-background/80"></div>
        </div>
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30">
                Workflow Optimisé
            </Badge>
            <h2 className="font-headline text-4xl font-bold text-gradient">De la Génération à la Publication, sans Friction</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ne perdez plus de temps avec les copier-coller. WooSenteur intègre une publication directe. Une fois votre fiche produit validée, publiez-la **instantanément** sur votre boutique WooCommerce. Mettez vos produits en ligne plus vite que jamais.
            </p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Publication en 1 Clic</h4>
                  <p className="text-muted-foreground">Envoyez le titre, les descriptions, l'image, la catégorie et les métadonnées SEO directement vers WooCommerce.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Synchronisation Intelligente</h4>
                  <p className="text-muted-foreground">Mettez à jour vos fiches produits existantes ou créez-en de nouvelles sans quitter notre interface.</p>
                </div>
              </li>
            </ul>
             <Button size="lg" asChild className='mt-8 text-white shadow-lg shadow-secondary/30'>
                <Link href="/pricing">Automatisez votre boutique <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
          <div>
            <Image 
              src="https://res.cloudinary.com/dzagwz94z/image/upload/v1766243660/woosenterur_pfjcmr.png"
              alt="Publication en un clic de la fiche produit vers WooCommerce"
              width={600}
              height={550}
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
);

export default OneClickPublish;
