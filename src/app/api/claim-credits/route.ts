
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { priceToCreditsMap } from '@/lib/stripe-helpers';

// Initialize Stripe with the secret key from server-side environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
    console.log('--- Claim Credits Request Received ---');

    try {
        // Initialize Firebase Admin SDK using the robust singleton pattern
        const adminApp = initFirebaseAdminApp();
        if (!adminApp) {
            console.error('Firebase Admin SDK not initialized. Check server configuration.');
            return NextResponse.json({ error: 'Configuration du serveur incomplète. Impossible de traiter la requête.' }, { status: 500 });
        }
        const auth = getAuth(adminApp);
        const db = getFirestore(adminApp);

        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('Authorization header missing or malformed.');
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }
        const idToken = authHeader.split('Bearer ')[1];

        const { session_id } = await req.json();
        if (!session_id) {
            console.error('Session ID missing from request body.');
            return NextResponse.json({ error: 'ID de session manquant.' }, { status: 400 });
        }
        console.log(`Processing claim for session_id: ${session_id}`);

        // Verify the user's token
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        console.log(`Token verified for UID: ${uid}`);
        
        // Retrieve the Checkout Session from Stripe to verify it
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['line_items.data.price.product'],
        });
        console.log(`Stripe session retrieved. Status: ${session.status}, Payment Status: ${session.payment_status}`);

        // --- Security Checks ---
        if (session.payment_status !== 'paid') {
             console.warn(`Attempt to claim credits for unpaid session: ${session_id}`);
             return NextResponse.json({ error: 'Le paiement pour cette session n\'est pas confirmé.' }, { status: 400 });
        }

        if (session.client_reference_id !== uid) {
             console.error(`CRITICAL: User ID mismatch. Token UID: ${uid}, Session client_reference_id: ${session.client_reference_id}`);
             return NextResponse.json({ error: 'Incohérence de l\'utilisateur.' }, { status: 403 });
        }

        // --- Idempotency Check ---
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        if (userData?.claimedSessions && userData.claimedSessions.includes(session_id)) {
            console.log(`Session ${session_id} already claimed by user ${uid}.`);
            return NextResponse.json({ success: true, message: 'Crédits déjà attribués.' });
        }
        
        // --- Credit Calculation ---
        const lineItems = session.line_items?.data;
        if (!lineItems || lineItems.length === 0) {
            console.error(`No line items found for session: ${session_id}`);
            return NextResponse.json({ error: 'Aucun article trouvé dans cette commande.' }, { status: 400 });
        }

        const priceId = lineItems[0].price?.id;
        if (!priceId) {
             console.error(`No price ID found in line item for session: ${session_id}`);
             return NextResponse.json({ error: 'ID du prix non trouvé.' }, { status: 400 });
        }

        const creditsToAdd = priceToCreditsMap[priceId];
        if (creditsToAdd === undefined) { // Check for undefined specifically
            console.warn(`No credit mapping found for price ID: ${priceId}`);
            return NextResponse.json({ error: 'Plan tarifaire non reconnu.' }, { status: 400 });
        }
        console.log(`Calculated ${creditsToAdd} credits to add for price ID: ${priceId}`);
        
        // --- Update Firestore Database ---
        await userRef.update({
            creditBalance: FieldValue.increment(creditsToAdd),
            subscriptionStatus: 'active',
            subscriptionId: session.subscription, // Save subscription ID if it exists
            claimedSessions: FieldValue.arrayUnion(session_id), // Add session to claimed list
        });

        console.log(`✅ Successfully added ${creditsToAdd} credits to user ${uid}.`);
        return NextResponse.json({ success: true, message: `${creditsToAdd} crédits ont été ajoutés à votre compte.` });

    } catch (error: any) {
        console.error('Claim Credits Error:', error);
        
        // Differentiate Stripe and Firebase errors
        if (error.type === 'StripeInvalidRequestError') {
             return NextResponse.json({ error: 'ID de session invalide.' }, { status: 404 });
        }
        
        return NextResponse.json({
            error: 'Erreur Interne du Serveur',
            details: error.message,
        }, { status: 500 });
    }
}
