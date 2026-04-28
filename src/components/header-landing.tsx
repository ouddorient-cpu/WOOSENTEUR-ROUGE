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
      style={{ background: 'rgba(250,246,240,0.92)', backdropFilter: 'blur(12px)', borderColor: '#E5DDD4' }}
    >
      <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo className="h-14 w-14" />
          <span
            className="font-bold text-lg hidden sm:block"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#2E2018' }}
          >
            Woosenteur
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/pricing" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#7A6D62' }}>
            Tarifs
          </Link>
          <Link href="/#faq" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#7A6D62' }}>
            FAQ
          </Link>
          <Link href="/blog" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#7A6D62' }}>
            Blog
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{ background: '#EDF2EC', color: '#7D9B76' }}
            >
              Mon espace →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: '#7A6D62' }}
              >
                Connexion
              </Link>
              <button
                onClick={scrollToTrial}
                className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: '#D4704A', boxShadow: '0 3px 12px rgba(212,112,74,0.25)' }}
              >
                Essayer gratuitement
              </button>
            </>
          )}

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" style={{ color: '#2E2018' }} /> : <Menu className="h-5 w-5" style={{ color: '#2E2018' }} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t px-5 py-4 flex flex-col gap-3" style={{ background: '#FAF6F0', borderColor: '#E5DDD4' }}>
          <Link href="/pricing" className="text-sm font-medium py-2" style={{ color: '#7A6D62' }} onClick={() => setOpen(false)}>Tarifs</Link>
          <Link href="/#faq" className="text-sm font-medium py-2" style={{ color: '#7A6D62' }} onClick={() => setOpen(false)}>FAQ</Link>
          <Link href="/blog" className="text-sm font-medium py-2" style={{ color: '#7A6D62' }} onClick={() => setOpen(false)}>Blog</Link>
          {!user && (
            <>
              <Link href="/login" className="text-sm font-medium py-2" style={{ color: '#7A6D62' }} onClick={() => setOpen(false)}>Connexion</Link>
              <button
                onClick={scrollToTrial}
                className="text-sm font-semibold px-5 py-3 rounded-xl text-white text-center"
                style={{ background: '#D4704A' }}
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
