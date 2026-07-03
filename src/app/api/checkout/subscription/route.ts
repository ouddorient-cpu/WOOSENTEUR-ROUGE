
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';
import { PRICING_PLANS } from '@/lib/pricing-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const adminApp = initFirebaseAdminApp();
    if (!adminApp) {
      return NextResponse.json({ error: 'Configuration serveur incomplète.' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await getAuth(adminApp).verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email || '';

    const { planId, billingCycle } = await req.json() as { planId: string; billingCycle: 'monthly' | 'annually' };

    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan || !plan.priceId) {
      return NextResponse.json({ error: 'Plan introuvable ou non configuré.' }, { status: 400 });
    }

    const priceId = plan.priceId[billingCycle];
    if (!priceId) {
      return NextResponse.json({ error: `Tarif ${billingCycle} non disponible pour ce plan.` }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://woosenteur.fr';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: uid,
      customer_email: email,
      metadata: { planId, billingCycle, userId: uid },
      success_url: `${baseUrl}/dashboard?sub_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
