
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

// This webhook now primarily handles subscription status changes,
// as credit claims are handled by the /api/claim-credits endpoint.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      throw new Error('Stripe signature or webhook secret is missing.');
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Initialize Firebase Admin SDK
  const adminApp = initFirebaseAdminApp();
  if (!adminApp) {
      console.error('Firebase Admin SDK not initialized. Check server configuration. Cannot process webhook.');
      return NextResponse.json({ error: 'Configuration du serveur incomplète. Impossible de traiter le webhook.' }, { status: 500 });
  }
  const db = getFirestore(adminApp);

  const session = event.data.object as Stripe.Checkout.Session;
  const eventType = event.type;

  try {
    switch (eventType) {
      // The 'checkout.session.completed' event can still be used for logging
      // or other side-effects, but credit attribution is now handled client-side.
      case 'checkout.session.completed':
        console.log('✅ Checkout session completed:', session.id);
        const userId = session.client_reference_id;
        const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

        if (!userId) {
          console.error('❌ User ID (client_reference_id) not found in session.');
          break;
        }

        const userRef = db.collection('users').doc(userId);
        await userRef.update({ stripeCustomerId });
        console.log(`Updated stripeCustomerId for user ${userId}.`);
        
        break;

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user by stripeCustomerId to update their status
        const userQuery = db.collection('users').where('stripeCustomerId', '==', customerId);
        const userSnapshot = await userQuery.get();

        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            await userDoc.ref.update({
                subscriptionStatus: subscription.status,
            });
            console.log(`🔄 Subscription status updated to "${subscription.status}" for user ${userDoc.id}`);
        } else {
            console.log(`🤷‍♀️ No user found with stripeCustomerId: ${customerId} for subscription update.`);
        }
        break;

      default:
        console.log(`🤷‍♀️ Unhandled event type: ${eventType}`);
    }
  } catch (error: any) {
     console.error('Webhook handler error:', error.message);
     return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
