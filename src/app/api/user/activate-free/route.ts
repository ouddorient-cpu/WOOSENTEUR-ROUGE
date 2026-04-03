
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';


export async function POST(req: NextRequest) {
    console.log('--- Free Plan Activation Request ---');

    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }
        const idToken = authHeader.split('Bearer ')[1];

        // Use the centralized and robust init function
        const adminApp = initFirebaseAdminApp();
        if (!adminApp) {
            console.error('Firebase Admin SDK not initialized. Check server configuration.');
            return NextResponse.json({ error: 'Configuration du serveur incomplète. Impossible d\'activer le plan gratuit.' }, { status: 500 });
        }
        const auth = getAuth(adminApp);
        const db = getFirestore(adminApp);

        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        console.log(`Token verified for UID: ${uid}`);

        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'Profil utilisateur non trouvé' }, { status: 404 });
        }

        const userData = userDoc.data();
        
        // This endpoint should only be used if for some reason the user didn't get credits at signup.
        // It's a fallback. A user cannot claim free credits if they have ever had an active subscription,
        // or if their credit balance is already positive.
        if (userData?.subscriptionStatus === 'active' || (userData?.creditBalance && userData.creditBalance > 0)) {
             return NextResponse.json({ error: 'Vous avez déjà bénéficié de l\'offre d\'essai ou avez un plan actif.' }, { status: 400 });
        }

        await userRef.update({
            creditBalance: FieldValue.increment(5),
            subscriptionStatus: 'trialing',
            subscriptionPlan: 'free'
        });
        console.log(`✅ Free plan activated for user: ${uid}`);

        return NextResponse.json({ success: true, message: '5 crédits ont été ajoutés à votre compte.' });

    } catch (error: any) {
        console.error('Free Plan Activation Error:', error);

        // Add more specific logging for auth errors
        if (error.code === 'auth/id-token-expired') {
             return NextResponse.json({ error: 'Votre session a expiré. Veuillez vous reconnecter.' }, { status: 401 });
        }
        if (error.code?.startsWith('auth/')) {
            return NextResponse.json({ error: 'Erreur d\'authentification. Impossible de vérifier votre identité.' }, { status: 403 });
        }
        
        return NextResponse.json({
            error: 'Erreur Interne du Serveur',
            details: error.message,
        }, { status: 500 });
    }
}
