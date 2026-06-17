'use client';

import Link from 'next/link';
import Logo from '@/components/logo';
import { useUser } from '@/firebase/auth/use-user';
import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function HeaderLanding() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const scrollToTrial = () => {
    setOpen(false);
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: 'var(--ls-header-bg)', backdropFilter: 'blur(14px)', borderColor: 'var(--ls-header-border)' }}
    >
      <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo className="h-14 w-14" />
          <span
            className="font-bold text-lg hidden sm:block"
            style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', color: 'var(--ls-text)' }}
          >
            Woosenteur
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/pricing" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--ls-muted)' }}>
            Tarifs
          </Link>
          <Link href="/#faq" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--ls-muted)' }}>
            FAQ
          </Link>
          <Link href="/blog" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--ls-muted)' }}>
            Blog
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'rgba(194,85,59,0.12)', color: '#D98F73' }}
            >
              Mon espace →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: 'var(--ls-muted)' }}
              >
                Connexion
              </Link>
              <button
                onClick={scrollToTrial}
                className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: '#A23F29', boxShadow: '0 3px 12px rgba(162,63,41,0.35)' }}
              >
                Essayer gratuitement
              </button>
            </>
          )}

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg transition-colors hover:bg-black/5"
              aria-label="Changer le thème"
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {theme === 'dark'
                ? <Sun className="h-4 w-4" style={{ color: 'var(--ls-muted)' }} />
                : <Moon className="h-4 w-4" style={{ color: 'var(--ls-muted)' }} />
              }
            </button>
          )}

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" style={{ color: 'var(--ls-text)' }} /> : <Menu className="h-5 w-5" style={{ color: 'var(--ls-text)' }} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t px-5 py-4 flex flex-col gap-3" style={{ background: 'var(--ls-bg-alt)', borderColor: 'var(--ls-header-border)' }}>
          <Link href="/pricing" className="text-sm font-medium py-2" style={{ color: 'var(--ls-muted)' }} onClick={() => setOpen(false)}>Tarifs</Link>
          <Link href="/#faq" className="text-sm font-medium py-2" style={{ color: 'var(--ls-muted)' }} onClick={() => setOpen(false)}>FAQ</Link>
          <Link href="/blog" className="text-sm font-medium py-2" style={{ color: 'var(--ls-muted)' }} onClick={() => setOpen(false)}>Blog</Link>
          {!user && (
            <>
              <Link href="/login" className="text-sm font-medium py-2" style={{ color: 'var(--ls-muted)' }} onClick={() => setOpen(false)}>Connexion</Link>
              <button
                onClick={scrollToTrial}
                className="text-sm font-semibold px-5 py-3 rounded-xl text-white text-center"
                style={{ background: '#A23F29' }}
              >
                Essayer gratuitement
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
