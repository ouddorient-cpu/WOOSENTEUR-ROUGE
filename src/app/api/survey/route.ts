import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initFirebaseAdminApp } from '@/lib/firebase-admin';

// ─── Helper: send notification email via Resend ───────────────────────────────

async function sendNotificationEmail(data: Record<string, unknown>, responseCount: number) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifEmail = process.env.SURVEY_NOTIFICATION_EMAIL;
  const notifEmail2 = process.env.SURVEY_NOTIFICATION_EMAIL_2;

  if (!apiKey || !notifEmail) {
    console.warn('⚠️  RESEND_API_KEY ou SURVEY_NOTIFICATION_EMAIL non configurés — email ignoré.');
    return;
  }

  const recipients = [notifEmail, ...(notifEmail2 ? [notifEmail2] : [])].filter(Boolean);

  const isGoal = responseCount === 10;
  const subject = isGoal
    ? `🎉 Objectif atteint ! 10 réponses bêta reçues`
    : `📋 Nouvelle réponse bêta Woosenteur (#${responseCount})`;

  const ratingRow = (label: string, val: unknown) =>
    `<tr><td style="padding:4px 8px;color:#555;">${label}</td><td style="padding:4px 8px;font-weight:600;">${val ?? '—'}/5 ⭐</td></tr>`;

  const textRow = (label: string, val: unknown) =>
    val
      ? `<tr><td style="padding:4px 8px;color:#555;vertical-align:top;">${label}</td><td style="padding:4px 8px;">${String(val).replace(/\n/g, '<br>')}</td></tr>`
      : '';

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;">
      <h2 style="color:#1a1a1a;">${subject}</h2>
      <p style="color:#555;">Réponse n°<strong>${responseCount}</strong> — ${new Date().toLocaleString('fr-FR')}</p>

      <h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Profil</h3>
      <table><tbody>
        <tr><td style="padding:4px 8px;color:#555;">Email</td><td style="padding:4px 8px;font-weight:600;">${data.email}</td></tr>
        <tr><td style="padding:4px 8px;color:#555;">Plateforme</td><td style="padding:4px 8px;font-weight:600;">${data.platform}</td></tr>
        <tr><td style="padding:4px 8px;color:#555;">Rôle</td><td style="padding:4px 8px;font-weight:600;">${data.role ?? '—'}</td></tr>
        <tr><td style="padding:4px 8px;color:#555;">Niveau</td><td style="padding:4px 8px;font-weight:600;">${data.expertise ?? '—'}</td></tr>
      </tbody></table>

      <h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Qualité des fiches</h3>
      <table><tbody>
        ${ratingRow('Note globale', data.q_global)}
        ${ratingRow('Description', data.q_description)}
        ${ratingRow('SEO / mots-clés', data.q_seo)}
        ${ratingRow('Titre produit', data.q_title)}
      </tbody></table>

      <h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Facilité d'utilisation</h3>
      <table><tbody>
        ${ratingRow('Config. API', data.u_api)}
        ${ratingRow('Import CSV', data.u_csv)}
        ${ratingRow('Facilité générale', data.u_general)}
        ${ratingRow('Interface', data.u_interface)}
      </tbody></table>

      <h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Prix</h3>
      <table><tbody>
        <tr><td style="padding:4px 8px;color:#555;">Prêt à payer ?</td><td style="padding:4px 8px;font-weight:600;">${data.p_willing ?? '—'}</td></tr>
        <tr><td style="padding:4px 8px;color:#555;">Budget mensuel</td><td style="padding:4px 8px;font-weight:600;">${data.p_amount ?? '—'}</td></tr>
      </tbody></table>

      <h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Valeur</h3>
      <table><tbody>
        ${ratingRow('Utilité', data.v_utility)}
        ${ratingRow('Gain de temps', data.v_time)}
        ${ratingRow('vs méthode actuelle', data.v_vs_current)}
      </tbody></table>

      <h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Recommandation</h3>
      <table><tbody>
        <tr><td style="padding:4px 8px;color:#555;">NPS (0–10)</td><td style="padding:4px 8px;font-weight:600;">${data.r_nps ?? '—'}</td></tr>
        <tr><td style="padding:4px 8px;color:#555;">Utiliserait l'outil ?</td><td style="padding:4px 8px;font-weight:600;">${data.r_use_self ?? '—'}</td></tr>
      </tbody></table>

      <h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Page marketing</h3>
      <table><tbody>
        ${ratingRow('Première impression', data.m_first_impression)}
        ${ratingRow('Clarté du message / proposition de valeur', data.m_clarity_value)}
        ${ratingRow('"Comment ça marche" (3 étapes)', data.m_clarity_howitworks)}
        ${ratingRow('Tableau comparatif (vs ChatGPT / manuel)', data.m_comparatif)}
        ${ratingRow('Clarté des tarifs', data.m_pricing_clarity)}
        ${ratingRow('Design', data.m_design)}
        <tr><td style="padding:4px 8px;color:#555;">Donné envie de tester ?</td><td style="padding:4px 8px;font-weight:600;">${data.m_convinced ?? '—'}</td></tr>
        <tr><td style="padding:4px 8px;color:#555;">Élément le plus convaincant</td><td style="padding:4px 8px;font-weight:600;">${data.m_convinced_by ?? '—'}</td></tr>
        ${textRow('Ce qui manquait / était peu clair', data.m_missing)}
      </tbody></table>

      <h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Outil marketing IA</h3>
      <table><tbody>
        ${ratingRow('Qualité globale des contenus', data.mt_quality)}
        ${ratingRow('Pertinence du message', data.mt_relevance)}
        ${ratingRow('Ton et style', data.mt_tone)}
        ${ratingRow('Originalité / créativité', data.mt_originality)}
        ${ratingRow('Rapidité de génération', data.mt_speed)}
        <tr><td style="padding:4px 8px;color:#555;">Utiliserait les contenus ?</td><td style="padding:4px 8px;font-weight:600;">${data.mt_would_use ?? '—'}</td></tr>
        <tr><td style="padding:4px 8px;color:#555;">Meilleur format</td><td style="padding:4px 8px;font-weight:600;">${data.mt_best_format ?? '—'}</td></tr>
        ${textRow('Ce qui manque dans le module marketing', data.mt_missing)}
        ${textRow('Améliorations souhaitées', data.mt_improve)}
      </tbody></table>

      <h3 style="margin-top:20px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Commentaires</h3>
      <table><tbody>
        ${textRow('Ce qui a plu', data.c_good)}
        ${textRow('À améliorer', data.c_improve)}
        ${textRow('Fonctionnalités souhaitées', data.c_features)}
      </tbody></table>

      ${isGoal ? '<p style="margin-top:24px;padding:12px;background:#d1fae5;border-radius:6px;color:#065f46;font-weight:600;">🎉 Félicitations ! Tu as atteint ton objectif de 10 réponses !</p>' : ''}

      <p style="margin-top:24px;font-size:12px;color:#9ca3af;">Woosenteur · Réponses bêta-testeurs</p>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Woosenteur Survey <onboarding@resend.dev>',
      to: recipients,
      subject,
      html,
    }),
  });
}

// ─── POST /api/survey ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.email || !body.platform) {
    return NextResponse.json({ error: 'Email et plateforme sont requis.' }, { status: 400 });
  }

  const adminApp = initFirebaseAdminApp();
  if (!adminApp) {
    return NextResponse.json(
      { error: 'Configuration serveur incomplète.' },
      { status: 500 },
    );
  }

  const db = getFirestore(adminApp);

  // Save response
  const docRef = await db.collection('beta_surveys').add({
    ...body,
    submittedAt: FieldValue.serverTimestamp(),
    ip: req.headers.get('x-forwarded-for') ?? 'unknown',
  });

  // Increment counter
  const counterRef = db.collection('beta_surveys').doc('__meta__');
  await counterRef.set({ count: FieldValue.increment(1) }, { merge: true });
  const counterSnap = await counterRef.get();
  const count = (counterSnap.data()?.count as number) ?? 1;

  // Send email notification
  try {
    await sendNotificationEmail(body, count);
  } catch (err) {
    console.error('Email notification failed:', err);
    // Non-blocking — don't fail the request because of email
  }

  return NextResponse.json({ success: true, id: docRef.id, responseCount: count });
}
