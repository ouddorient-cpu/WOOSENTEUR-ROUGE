import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import sharp from 'sharp';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';
import { generateSocialVisualCopy } from '@/ai/flows/generate-social-visual-copy';
import { composeVisual } from '@/lib/social-visuals/compose-visual';
import { hasEnoughCredits, debitCreditIfNeeded } from '@/lib/social-visuals/credits-server';
import { validateImageFile, validateImageDimensions, validateProductUrl, validateFormat, getSimplifiedDomain } from '@/lib/social-visuals/validate-input';

export async function POST(req: NextRequest) {
  try {
    const adminApp = initFirebaseAdminApp();
    if (!adminApp) {
      return NextResponse.json({ error: 'Config serveur incomplète.' }, { status: 500 });
    }

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

    if (!hasEnoughCredits(profile)) {
      return NextResponse.json({ error: 'Crédits insuffisants. Rechargez votre compte sur woosenteur.fr.' }, { status: 402 });
    }

    const formData = await req.formData();
    const file = formData.get('image');
    const productUrl = String(formData.get('productUrl') || '');
    const format = String(formData.get('format') || 'square');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image produit requise.' }, { status: 400 });
    }

    const fileError = validateImageFile({ type: file.type, size: file.size });
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }

    const urlError = validateProductUrl(productUrl);
    if (urlError) {
      return NextResponse.json({ error: urlError }, { status: 400 });
    }

    if (!validateFormat(format)) {
      return NextResponse.json({ error: 'Format invalide.' }, { status: 400 });
    }

    const sourceBuffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(sourceBuffer).metadata();
    const dimensionError = validateImageDimensions(metadata.width ?? 0, metadata.height ?? 0);
    if (dimensionError) {
      return NextResponse.json({ error: dimensionError }, { status: 400 });
    }

    const domain = getSimplifiedDomain(productUrl);
    const visualRef = userRef.collection('socialVisuals').doc();

    let copy: { slogan: string; cta: string };
    let generatedBuffer: Buffer;
    try {
      const generatedCopy = await generateSocialVisualCopy({});
      if (!generatedCopy.slogan || !generatedCopy.cta) {
        throw new Error("La génération du texte publicitaire a échoué.");
      }
      copy = { slogan: generatedCopy.slogan, cta: generatedCopy.cta };
      generatedBuffer = await composeVisual({
        sourceBuffer,
        format,
        slogan: copy.slogan,
        cta: copy.cta,
        domain,
      });
    } catch (genError: any) {
      console.error('Social visual generation error:', genError);
      return NextResponse.json({ error: genError.message || "La génération du visuel a échoué." }, { status: 422 });
    }

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const bucket = getStorage(adminApp).bucket(bucketName);

    const sourcePath = `users/${uid}/socialVisuals/${visualRef.id}/source.png`;
    const generatedPath = `users/${uid}/socialVisuals/${visualRef.id}/generated.png`;

    const normalizedSource = await sharp(sourceBuffer).rotate().png().toBuffer();
    await bucket.file(sourcePath).save(normalizedSource, { contentType: 'image/png' });
    await bucket.file(generatedPath).save(generatedBuffer, { contentType: 'image/png' });

    const [sourceUrl] = await bucket.file(sourcePath).getSignedUrl({ action: 'read', expires: '03-01-2500' });
    const [generatedUrl] = await bucket.file(generatedPath).getSignedUrl({ action: 'read', expires: '03-01-2500' });

    const creditsUsed = await debitCreditIfNeeded(userRef, profile);

    await visualRef.set({
      id: visualRef.id,
      userId: uid,
      sourceImageUrl: sourceUrl,
      generatedImageUrl: generatedUrl,
      productUrl,
      format,
      slogan: copy.slogan,
      cta: copy.cta,
      status: 'completed',
      creditsUsed,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: visualRef.id,
      generatedImageUrl: generatedUrl,
      slogan: copy.slogan,
      cta: copy.cta,
      productUrl,
      format,
    });
  } catch (error: any) {
    console.error('Social visual generate error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
