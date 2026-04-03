
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loading } from '@/components/ui/loading';
import DashboardSidebar, { MobileNav } from '@/components/dashboard-sidebar';
import FeedbackButton from '@/components/dashboard/FeedbackButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/40">
        <Loading screenHFull={false} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <MobileNav />
            <main className="flex-grow p-4 pb-24 sm:px-6 sm:pt-0 md:gap-8">
                {children}
            </main>
        </div>
        <FeedbackButton />
    </div>
  );
}
