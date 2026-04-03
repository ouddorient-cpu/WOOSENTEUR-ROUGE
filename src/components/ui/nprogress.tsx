'use client';

import NProgress from 'nprogress';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

function NProgressComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPath = useRef(pathname + searchParams.toString());

  useEffect(() => {
    const newPath = pathname + searchParams.toString();
    if (previousPath.current !== newPath) {
      // Start NProgress
      NProgress.start();
      previousPath.current = newPath;
    }
  });

  useEffect(() => {
    // Stop NProgress on mount
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}

export { NProgressComponent as NProgress };
