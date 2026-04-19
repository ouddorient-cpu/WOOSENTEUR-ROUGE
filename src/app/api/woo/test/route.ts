
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const adminApp = initFirebaseAdminApp();
    if (!adminApp) return NextResponse.json({ error: 'Config serveur incomplète.' }, { status: 500 });

    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const decoded = await auth.verifyIdToken(authHeader.split('Bearer ')[1]);
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    const woo = userDoc.data()?.wooCommerce;

    if (!woo?.storeUrl || !woo?.consumerKey || !woo?.consumerSecret) {
      return NextResponse.json({
        ok: false,
        step: 'credentials',
        error: 'Credentials WooCommerce absents dans Firestore.',
        stored: { storeUrl: !!woo?.storeUrl, consumerKey: !!woo?.consumerKey, consumerSecret: !!woo?.consumerSecret },
      });
    }

    const baseUrl = woo.storeUrl.replace(/\/$/, '');
    const auth64 = Buffer.from(`${woo.consumerKey}:${woo.consumerSecret}`).toString('base64');

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/wp-json/wc/v3/system_status`, {
        headers: { 'Authorization': `Basic ${auth64}` },
        signal: AbortSignal.timeout(10000),
      });
    } catch (fetchErr: any) {
      return NextResponse.json({
        ok: false,
        step: 'fetch',
        error: fetchErr.message,
        storeUrl: baseUrl,
      });
    }

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({
        ok: false,
        step: 'auth',
        httpStatus: res.status,
        error: `WooCommerce a répondu HTTP ${res.status}`,
        body: body.slice(0, 300),
        storeUrl: baseUrl,
      });
    }

    const data = await res.json();
    return NextResponse.json({
      ok: true,
      storeUrl: baseUrl,
      wcVersion: data.environment?.wc_version || '?',
      wpVersion: data.environment?.wp_version || '?',
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, step: 'server', error: error.message }, { status: 500 });
  }
}
