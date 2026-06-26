'use client';

import { usePathname } from 'next/navigation';
import { AuroraBg } from '@/components/ui/aurora-bg';
import { CookieConsent } from '@/components/CookieConsent';
import { GlobalChatbot } from '@/components/chatbot/global-chatbot';

const MOBILE_PREFIX = '/m';

export function ChromeAuroraBg() {
  const pathname = usePathname();
  if (pathname?.startsWith(MOBILE_PREFIX)) return null;
  return <AuroraBg />;
}

export function ChromeFooterWidgets() {
  const pathname = usePathname();
  if (pathname?.startsWith(MOBILE_PREFIX)) return null;
  return (
    <>
      <CookieConsent />
      <GlobalChatbot />
    </>
  );
}
