'use client';

import { usePathname } from 'next/navigation';

/**
 * AuroraBg — ambient fixed aurora orbs + subtle grid overlay.
 * Only renders on dark-themed pages (dashboard, login, signup, etc.).
 * Hidden on the landing page which uses a warm light theme.
 */
export function AuroraBg() {
  const pathname = usePathname();
  // Landing page uses warm cream theme — no aurora
  if (pathname === '/') return null;

  return (
    <>
      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />
      {/* Aurora blobs */}
      <div aria-hidden className="aurora-bg">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
      </div>
    </>
  );
}
