
'use client';
import { Badge } from '@/components/ui/badge';
import { FileUp, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const BulkImport = () => (
    <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <Image 
                    src="https://res.cloudinary.com/dzagwz94z/image/upload/v1767464487/ChatGPT_Image_3_janv._2026_19_20_57_lhfmsj.png"
                    alt="Import en masse de produits via un fichier CSV"
                    width={600}
                    height={550}
                    className="rounded-lg shadow-2xl"
                    />
                </div>
                <div>
                    <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30">
                        Productivité Maximale
                    </Badge>
                    <h2 className="font-headline text-4xl font-bold text-gradient">Passez à la vitesse supérieure. Importez en masse.</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                    Fini l'upload fastidieux, fiche par fiche. Avec notre importateur CSV, transformez une simple liste de produits en des centaines de fiches optimisées et publiées en quelques minutes.
                    </p>
                    <ul className="mt-8 space-y-4">
                    <li className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1">
                            <FileUp className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Traitement par lots intelligent</h4>
                            <p className="text-muted-foreground">Téléversez un simple fichier CSV et laissez notre agent générer l'ensemble de votre catalogue.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Gain de temps exponentiel</h4>
                            <p className="text-muted-foreground">Idéal pour les lancements de collection ou les migrations de catalogue. Libérez-vous des tâches répétitives.</p>
                        </div>
                    </li>
                    </ul>
                    <Button size="lg" asChild className='mt-8 text-white shadow-lg shadow-secondary/30'>
                        <Link href="/pricing">Découvrir l'import en masse <ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                </div>
            </div>
        </div>
    </section>
);

export default BulkImport;
