'use client';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/types';

const STORAGE_KEY = 'woosenteur_trial_credits';
const MAX_TRIAL_CREDITS = 5;

export function useTrialCredits() {
  const { user } = useUser();
  const { data: profile } = useDoc<UserProfile>(user ? `users/${user.uid}` : null);

  const isAdmin =
    !!user &&
    (profile?.role === 'admin' ||
      profile?.role === 'superadmin' ||
      profile?.isUnlimited === true ||
      user.email === 'abderelmalki@gmail.com');

  const [creditsUsed, setCreditsUsed] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          setCreditsUsed(parsed);
        }
      }
    } catch {
      // localStorage unavailable
    }
    setIsHydrated(true);
  }, []);

  const consumeCredit = useCallback(() => {
    if (isAdmin) return creditsUsed; // pas de décompte pour l'admin
    const newCount = creditsUsed + 1;
    setCreditsUsed(newCount);
    try {
      localStorage.setItem(STORAGE_KEY, String(newCount));
    } catch {
      // Silently fail
    }
    return newCount;
  }, [creditsUsed, isAdmin]);

  if (isAdmin) {
    return {
      creditsUsed: 0,
      creditsRemaining: Infinity,
      canGenerate: true,
      consumeCredit,
      isLimitReached: false,
      isHydrated,
    };
  }

  return {
    creditsUsed,
    creditsRemaining: MAX_TRIAL_CREDITS - creditsUsed,
    canGenerate: creditsUsed < MAX_TRIAL_CREDITS,
    consumeCredit,
    isLimitReached: creditsUsed >= MAX_TRIAL_CREDITS,
    isHydrated,
  };
}
