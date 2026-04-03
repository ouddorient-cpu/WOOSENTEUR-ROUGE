import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    // — Auth check —
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];

    const adminApp = initFirebaseAdminApp();
    if (!adminApp) {
      return NextResponse.json({ error: 'Configuration serveur incomplète.' }, { status: 500 });
    }

    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // — Read request body —
    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code invalide.' }, { status: 400 });
    }
    const normalizedCode = code.trim().toUpperCase();

    // — Check user —
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
    }
    const userData = userDoc.data()!;

    // — Already used this code? —
    const usedCodes: string[] = userData.promoCodesUsed ?? [];
    if (usedCodes.includes(normalizedCode)) {
      return NextResponse.json({ error: 'Vous avez déjà utilisé ce code promo.' }, { status: 400 });
    }

    // — Check promo code in Firestore —
    const promoRef = db.collection('promoCodes').doc(normalizedCode);
    const promoDoc = await promoRef.get();
    if (!promoDoc.exists) {
      return NextResponse.json({ error: 'Code promo introuvable ou expiré.' }, { status: 404 });
    }
    const promo = promoDoc.data()!;

    if (!promo.active) {
      return NextResponse.json({ error: 'Ce code promo n\'est plus actif.' }, { status: 400 });
    }
    if (promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: 'Ce code promo a atteint son nombre maximum d\'utilisations.' }, { status: 400 });
    }

    const creditsToAdd: number = promo.credits ?? 0;
    const isBeta: boolean = promo.isBetaTester ?? false;

    // — Atomic updates —
    const batch = db.batch();

    // Add credits + mark code as used on user
    batch.update(userRef, {
      creditBalance: FieldValue.increment(creditsToAdd),
      promoCodesUsed: FieldValue.arrayUnion(normalizedCode),
      ...(isBeta && { isBetaTester: true }),
    });

    // Increment promo usage counter
    batch.update(promoRef, {
      usedCount: FieldValue.increment(1),
    });

    await batch.commit();

    console.log(`✅ Code "${normalizedCode}" racheté par ${uid} (+${creditsToAdd} crédits)`);

    return NextResponse.json({
      success: true,
      creditsAdded: creditsToAdd,
      message: `${creditsToAdd} crédits ajoutés à votre compte !`,
    });

  } catch (error: any) {
    console.error('Redeem promo error:', error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Session expirée. Reconnectez-vous.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur serveur.', details: error.message }, { status: 500 });
  }
}
