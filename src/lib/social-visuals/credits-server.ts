import { DocumentReference, FieldValue } from 'firebase-admin/firestore';

export function hasUnlimitedCredits(profile: any): boolean {
  return profile?.isUnlimited === true || profile?.role === 'superadmin';
}

export function hasEnoughCredits(profile: any): boolean {
  return hasUnlimitedCredits(profile) || (profile?.creditBalance ?? 0) > 0;
}

// Debit exactly once, only after a successful generation, mirroring src/app/api/mobile/generate/route.ts.
export async function debitCreditIfNeeded(userRef: DocumentReference, profile: any): Promise<number> {
  if (hasUnlimitedCredits(profile)) return 0;
  await userRef.update({ creditBalance: FieldValue.increment(-1) });
  return 1;
}
