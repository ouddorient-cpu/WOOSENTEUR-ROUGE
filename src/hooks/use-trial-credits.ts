'use client';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'woosenteur_trial_credits';
const MAX_TRIAL_CREDITS = 5;

export function useTrialCredits() {
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
      // localStorage unavailable (e.g. private browsing)
    }
    setIsHydrated(true);
  }, []);

  const consumeCredit = useCallback(() => {
    const newCount = creditsUsed + 1;
    setCreditsUsed(newCount);
    try {
      localStorage.setItem(STORAGE_KEY, String(newCount));
    } catch {
      // Silently fail
    }
    return newCount;
  }, [creditsUsed]);

  return {
    creditsUsed,
    creditsRemaining: MAX_TRIAL_CREDITS - creditsUsed,
    canGenerate: creditsUsed < MAX_TRIAL_CREDITS,
    consumeCredit,
    isLimitReached: creditsUsed >= MAX_TRIAL_CREDITS,
    isHydrated,
  };
}
