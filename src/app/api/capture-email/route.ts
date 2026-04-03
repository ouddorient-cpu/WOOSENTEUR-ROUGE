import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, source, productName } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 });
    }

    const adminApp = initFirebaseAdminApp();
    if (!adminApp) {
      return NextResponse.json({ error: 'Configuration serveur incomplète.' }, { status: 500 });
    }
    const db = getFirestore(adminApp);

    // Upsert: on évite les doublons par email
    const emailRef = db.collection('emailCaptures').doc(
      email.toLowerCase().replace(/[^a-z0-9@._-]/g, '_')
    );

    const existing = await emailRef.get();

    if (existing.exists) {
      // Mise à jour : compte le nombre de visites
      await emailRef.update({
        lastSeen: FieldValue.serverTimestamp(),
        visitCount: FieldValue.increment(1),
        sources: FieldValue.arrayUnion(source ?? 'trial-generator'),
      });
      return NextResponse.json({ success: true, isNew: false });
    }

    await emailRef.set({
      email: email.toLowerCase().trim(),
      source: source ?? 'trial-generator',
      sources: [source ?? 'trial-generator'],
      productName: productName ?? null,
      visitCount: 1,
      converted: false,       // passe à true quand il s'inscrit
      createdAt: FieldValue.serverTimestamp(),
      lastSeen: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, isNew: true });

  } catch (error: any) {
    console.error('Capture email error:', error);
    return NextResponse.json({ error: 'Erreur serveur.', details: error.message }, { status: 500 });
  }
}
