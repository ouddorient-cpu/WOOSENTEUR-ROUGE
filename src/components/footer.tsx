
'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative z-10 border-t border-white/[0.06] bg-[#060612]/80 backdrop-blur-sm py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <p className="font-headline text-lg font-bold text-white">Woosenteur v2</p>
                        <p className="mt-2 text-sm text-white/45">
                            Fiches produits SEO optimisées par IA pour WooCommerce et Shopify.
                        </p>
                        <a
                            href="mailto:contact@woosenteur.fr"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-violet-400 transition-colors"
                        >
                            <Mail className="h-4 w-4" />
                            contact@woosenteur.fr
                        </a>
                    </div>

                    <div>
                        <p className="font-semibold text-sm text-white/70 mb-3">Produit</p>
                        <nav className="flex flex-col gap-2">
                            {[
                                { href: '/#features', label: 'Fonctionnalités' },
                                { href: '/pricing', label: 'Tarifs' },
                                { href: '/about', label: 'À Propos' },
                            ].map(l => (
                                <Link key={l.href} href={l.href} className="text-sm text-white/40 hover:text-violet-400 transition-colors">
                                    {l.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <p className="font-semibold text-sm text-white/70 mb-3">Légal</p>
                        <nav className="flex flex-col gap-2">
                            {[
                                { href: '/legal/terms', label: "Conditions d'utilisation" },
                                { href: '/legal/privacy', label: 'Confidentialité' },
                                { href: '/legal/cookies', label: 'Cookies' },
                                { href: '/legal/notice', label: 'Mentions Légales' },
                            ].map(l => (
                                <Link key={l.href} href={l.href} className="text-sm text-white/40 hover:text-violet-400 transition-colors">
                                    {l.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/[0.06] text-center md:text-left">
                    <p className="text-sm text-white/30">
                        &copy; {new Date().getFullYear()} Woosenteur v2. Tous droits réservés.
                    </p>
                    <p className="text-xs text-white/20 mt-1">
                        Woosenteur v2 est une application indépendante et n&apos;est pas affiliée à WooCommerce ou Automattic Inc.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
