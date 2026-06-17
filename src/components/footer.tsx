'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

const Footer = () => {
    const t = useT();
    return (
        <footer
            className="relative z-10 py-12"
            style={{ background: 'var(--ls-bg-alt)', borderTop: '1px solid var(--ls-border-color)' }}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <p
                            className="text-lg font-bold"
                            style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: 'var(--ls-text)' }}
                        >
                            Woosenteur
                        </p>
                        <p className="mt-2 text-sm" style={{ color: 'var(--ls-muted)' }}>
                            {t.footer.tagline}
                        </p>
                        <a
                            href="mailto:contact@woosenteur.fr"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
                            style={{ color: 'var(--ls-muted)' }}
                        >
                            <Mail className="h-4 w-4" />
                            contact@woosenteur.fr
                        </a>
                    </div>

                    <div>
                        <p className="font-semibold text-sm mb-3" style={{ color: 'var(--ls-text)' }}>{t.footer.productSection}</p>
                        <nav className="flex flex-col gap-2">
                            {[
                                { href: '/#features', label: t.footer.features },
                                { href: '/pricing', label: t.footer.pricing },
                                { href: '/about', label: t.footer.about },
                            ].map(l => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="text-sm transition-colors hover:opacity-80"
                                    style={{ color: 'var(--ls-muted)' }}
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <p className="font-semibold text-sm mb-3" style={{ color: 'var(--ls-text)' }}>{t.footer.legalSection}</p>
                        <nav className="flex flex-col gap-2">
                            {[
                                { href: '/legal/terms', label: t.footer.terms },
                                { href: '/legal/privacy', label: t.footer.privacy },
                                { href: '/legal/cookies', label: t.footer.cookies },
                                { href: '/legal/notice', label: t.footer.notice },
                            ].map(l => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="text-sm transition-colors hover:opacity-80"
                                    style={{ color: 'var(--ls-muted)' }}
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="mt-10 pt-6 text-center md:text-left" style={{ borderTop: '1px solid var(--ls-border-color)' }}>
                    <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>{t.footer.rights}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--ls-muted)', opacity: 0.7 }}>{t.footer.disclaimer}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
