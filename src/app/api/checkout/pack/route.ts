
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';
import { CREDIT_PACKS } from '@/lib/pricing-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const adminApp = initFirebaseAdminApp();
    if (!adminApp) {
      return NextResponse.json({ error: 'Configuration serveur incomplète.' }, { status: 500 });
    }
    const auth = getAuth(adminApp);

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const { packId } = await req.json();
    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) {
      return NextResponse.json({ error: 'Pack introuvable.' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://woosenteur.fr';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: pack.priceId, quantity: 1 }],
      client_reference_id: uid,
      metadata: {
        packId: pack.id,
        credits: String(pack.credits),
        validityMonths: String(pack.validityMonths),
        userId: uid,
      },
      success_url: `${baseUrl}/dashboard?pack_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Pack checkout error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
