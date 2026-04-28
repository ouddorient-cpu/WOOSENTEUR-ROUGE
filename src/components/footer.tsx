'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

const Footer = () => {
    const t = useT();
    return (
        <footer className="relative z-10 border-t border-white/[0.06] bg-[#060612]/80 backdrop-blur-sm py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <p className="font-headline text-lg font-bold text-white">Woosenteur v2</p>
                        <p className="mt-2 text-sm text-white/45">
                            {t.footer.tagline}
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
                        <p className="font-semibold text-sm text-white/70 mb-3">{t.footer.productSection}</p>
                        <nav className="flex flex-col gap-2">
                            {[
                                { href: '/#features', label: t.footer.features },
                                { href: '/pricing', label: t.footer.pricing },
                                { href: '/about', label: t.footer.about },
                            ].map(l => (
                                <Link key={l.href} href={l.href} className="text-sm text-white/40 hover:text-violet-400 transition-colors">
                                    {l.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <p className="font-semibold text-sm text-white/70 mb-3">{t.footer.legalSection}</p>
                        <nav className="flex flex-col gap-2">
                            {[
                                { href: '/legal/terms', label: t.footer.terms },
                                { href: '/legal/privacy', label: t.footer.privacy },
                                { href: '/legal/cookies', label: t.footer.cookies },
                                { href: '/legal/notice', label: t.footer.notice },
                            ].map(l => (
                                <Link key={l.href} href={l.href} className="text-sm text-white/40 hover:text-violet-400 transition-colors">
                                    {l.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/[0.06] text-center md:text-left">
                    <p className="text-sm text-white/30">{t.footer.rights}</p>
                    <p className="text-xs text-white/20 mt-1">{t.footer.disclaimer}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
