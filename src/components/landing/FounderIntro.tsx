
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card'; // Added import for Card

const FounderIntro = () => {
    return (
        <section className="py-20 lg:py-24 relative overflow-hidden bg-background"> {/* Added bg-background */}
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
                <div className="text-center">
                    <h2 className="font-headline text-3xl font-bold text-gradient">Bonjour, je m'appelle Abderrahmane, fondateur de Woosenteur v2.</h2>
                    {/* Replaced p tag with Card component and added studio-card class */}
                    <Card className="studio-card overflow-hidden border-none max-w-5xl mx-auto shadow-2xl mt-4 p-6">
                        <p className="text-lg text-muted-foreground">
                            J'ai créé cet outil après avoir passé des heures à rédiger des fiches produits pour l'e-commerce, jonglant entre les sites de fournisseurs et les outils SEO. Aujourd'hui, notre agent vous fait gagner un temps précieux avec des fiches produits structurées pour Rank Math — titre, méta, slug, JSON-LD, tout est généré.
                        </p>
                    </Card>
                    <Button variant="link" asChild className="mt-4 text-lg px-0">
                        <Link href="/about">
                            Découvrir mon histoire <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FounderIntro;
