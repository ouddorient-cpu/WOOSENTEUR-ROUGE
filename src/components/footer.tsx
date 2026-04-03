
'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="py-10 border-t bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <p className="font-headline text-lg font-bold">Woosenteur v2</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Fiches produits SEO optimisées par IA pour WooCommerce et Shopify.
                        </p>
                        <a
                            href="mailto:contact@woosenteur.fr"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                        >
                            <Mail className="h-4 w-4" />
                            contact@woosenteur.fr
                        </a>
                    </div>

                    <div>
                        <p className="font-semibold text-sm mb-3">Produit</p>
                        <nav className="flex flex-col gap-2">
                            <Link href="/#features" className="text-sm text-muted-foreground hover:text-primary">Fonctionnalites</Link>
                            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">Tarifs</Link>
                            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">A Propos</Link>
                        </nav>
                    </div>

                    <div>
                        <p className="font-semibold text-sm mb-3">Legal</p>
                        <nav className="flex flex-col gap-2">
                            <Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-primary">Conditions d'utilisation</Link>
                            <Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-primary">Confidentialite</Link>
                            <Link href="/legal/cookies" className="text-sm text-muted-foreground hover:text-primary">Cookies</Link>
                            <Link href="/legal/notice" className="text-sm text-muted-foreground hover:text-primary">Mentions Legales</Link>
                        </nav>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t text-center md:text-left">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Woosenteur v2*. Tous droits reserves.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        *Woosenteur v2 est une application independante et n'est pas affiliee a WooCommerce ou Automattic Inc.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
