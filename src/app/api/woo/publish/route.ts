
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const adminApp = initFirebaseAdminApp();
    if (!adminApp) return NextResponse.json({ error: 'Config serveur incomplète.' }, { status: 500 });

    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    const woo = userData?.wooCommerce;

    if (!woo?.storeUrl || !woo?.consumerKey || !woo?.consumerSecret) {
      return NextResponse.json({ error: 'Boutique WooCommerce non configurée dans votre profil.' }, { status: 400 });
    }

    const { products } = await req.json();
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Aucun produit fourni.' }, { status: 400 });
    }

    const baseUrl = woo.storeUrl.replace(/\/$/, '');
    const auth64 = Buffer.from(`${woo.consumerKey}:${woo.consumerSecret}`).toString('base64');
    const wooHeaders = { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth64}` };

    const results = await Promise.allSettled(
      products.map(async (p: any) => {
        // seo peut être { success, data } ou directement SeoData
        const seo = p.seo?.data ?? p.seo ?? {};

        const tags = seo.tags
          ? seo.tags.split(',').map((t: string) => ({ name: t.trim() })).filter((t: any) => t.name)
          : [];

        const body: Record<string, any> = {
          name: seo.productTitle || p.productName,
          type: 'simple',
          status: 'publish',
          short_description: seo.shortDescription || '',
          description: seo.longDescription || '',
          categories: [{ name: 'Parfums' }],
          tags,
          meta_data: [
            { key: 'rank_math_focus_keyword', value: seo.focusKeyword || '' },
            { key: 'rank_math_description', value: seo.shortDescription || '' },
            { key: '_woosenteur_generated', value: '1' },
          ],
        };

        if (p.price) body.regular_price = String(p.price);
        if (p.imageUrl) body.images = [{ src: p.imageUrl }];

        const res = await fetch(`${baseUrl}/wp-json/wc/v3/products`, {
          method: 'POST',
          headers: wooHeaders,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Erreur HTTP ${res.status}`);
        }

        const created = await res.json();
        return { id: created.id, name: created.name, permalink: created.permalink };
      })
    );

    const succeeded = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value);

    const failed = results
      .map((r, i) =>
        r.status === 'rejected'
          ? { name: products[i].productName, error: (r as PromiseRejectedResult).reason?.message }
          : null
      )
      .filter(Boolean);

    return NextResponse.json({ succeeded, failed, total: products.length });
  } catch (error: any) {
    console.error('WooCommerce publish error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
