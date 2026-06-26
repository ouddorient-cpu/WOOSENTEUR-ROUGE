'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { Loading } from '@/components/ui/loading';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

const PUBLIC_MOBILE_PATHS = ['/m/login', '/m/onboarding'];
const ONBOARDING_FLAG = 'woosenteur_onboarded';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_MOBILE_PATHS.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname === '/m/onboarding') return;
    if (!window.localStorage.getItem(ONBOARDING_FLAG)) {
      router.replace('/m/onboarding');
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!isPublic && !loading && !user) {
      router.replace('/m/login');
    }
  }, [isPublic, loading, user, router]);

  if (!isPublic && (loading || !user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loading screenHFull={false} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 overflow-y-auto pb-24">{children}</main>
      {!isPublic && <MobileBottomNav />}
    </div>
  );
}
