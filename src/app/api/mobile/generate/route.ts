
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';
import { generateSeoOptimizedProductDescription } from '@/ai/flows/generate-seo-optimized-product-description';

export async function POST(req: NextRequest) {
  try {
    const adminApp = initFirebaseAdminApp();
    if (!adminApp) return NextResponse.json({ error: 'Config serveur incomplète.' }, { status: 500 });

    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const profile = userSnap.data();

    const isUnlimited = profile?.isUnlimited === true || profile?.role === 'superadmin';
    if (!isUnlimited && (profile?.creditBalance ?? 0) <= 0) {
      return NextResponse.json({ error: 'Crédits insuffisants. Rechargez votre compte sur woosenteur.fr.' }, { status: 402 });
    }

    const body = await req.json();
    const { productName, brand, productMode, category, productDescription, certifications, vibe } = body;

    if (!productName || !category) {
      return NextResponse.json({ error: 'Le nom du produit et la catégorie sont requis.' }, { status: 400 });
    }

    const result = await generateSeoOptimizedProductDescription({
      productName,
      brand,
      productMode: productMode || 'mon-produit',
      category,
      productDescription,
      certifications,
      vibe,
      language: 'French',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    if (!isUnlimited) {
      await userRef.update({ creditBalance: FieldValue.increment(-1) });
    }

    const productRef = userRef.collection('products').doc();
    const productData = {
      id: productRef.id,
      userId: uid,
      name: productName,
      brand: brand || '',
      productType: category,
      createdAt: FieldValue.serverTimestamp(),
      seo: result.data,
    };
    await productRef.set(productData);

    return NextResponse.json({ id: productRef.id, seo: result.data });
  } catch (error: any) {
    console.error('Mobile generate error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
