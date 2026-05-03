'use client';

import Link from 'next/link';
import Logo from '@/components/logo';
import { useUser } from '@/firebase/auth/use-user';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function HeaderLanding() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const scrollToTrial = () => {
    setOpen(false);
    document.getElementById('essai-gratuit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: 'rgba(6,8,15,0.90)', backdropFilter: 'blur(12px)', borderColor: '#101E36' }}
    >
      <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo className="h-14 w-14" />
          <span
            className="font-bold text-lg hidden sm:block"
            style={{ color: '#E2EAF8' }}
          >
            Woosenteur
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/pricing" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#6B7FAD' }}>
            Tarifs
          </Link>
          <Link href="/#faq" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#6B7FAD' }}>
            FAQ
          </Link>
          <Link href="/blog" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#6B7FAD' }}>
            Blog
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'rgba(59,130,246,0.12)', color: '#60A5FA' }}
            >
              Mon espace →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: '#6B7FAD' }}
              >
                Connexion
              </Link>
              <button
                onClick={scrollToTrial}
                className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: '#2563EB', boxShadow: '0 3px 12px rgba(37,99,235,0.35)' }}
              >
                Essayer gratuitement
              </button>
            </>
          )}

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" style={{ color: '#E2EAF8' }} /> : <Menu className="h-5 w-5" style={{ color: '#E2EAF8' }} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t px-5 py-4 flex flex-col gap-3" style={{ background: '#0A0F1C', borderColor: '#101E36' }}>
          <Link href="/pricing" className="text-sm font-medium py-2" style={{ color: '#6B7FAD' }} onClick={() => setOpen(false)}>Tarifs</Link>
          <Link href="/#faq" className="text-sm font-medium py-2" style={{ color: '#6B7FAD' }} onClick={() => setOpen(false)}>FAQ</Link>
          <Link href="/blog" className="text-sm font-medium py-2" style={{ color: '#6B7FAD' }} onClick={() => setOpen(false)}>Blog</Link>
          {!user && (
            <>
              <Link href="/login" className="text-sm font-medium py-2" style={{ color: '#6B7FAD' }} onClick={() => setOpen(false)}>Connexion</Link>
              <button
                onClick={scrollToTrial}
                className="text-sm font-semibold px-5 py-3 rounded-xl text-white text-center"
                style={{ background: '#2563EB' }}
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
