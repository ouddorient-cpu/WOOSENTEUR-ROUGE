'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, Star, ChevronRight, ChevronLeft, ClipboardList, Rocket, Key, Upload, Megaphone, FlaskConical, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'email' | 'briefing' | 'quality' | 'usability' | 'price' | 'value' | 'recommend' | 'marketing' | 'marketing_tool' | 'comments' | 'done';

interface FormData {
  email: string;
  platform: string;
  role: string;
  expertise: string;
  // Section 1 – Qualité
  q_global: number;
  q_description: number;
  q_seo: number;
  q_title: number;
  // Section 2 – Facilité d'utilisation
  u_api: number;
  u_csv: number;
  u_general: number;
  u_interface: number;
  // Section 3 – Prix
  p_willing: string;
  p_amount: string;
  // Section 4 – Valeur
  v_utility: number;
  v_time: number;
  v_vs_current: number;
  // Section 5 – Recommandation
  r_nps: number;
  r_use_self: string;
  // Section 6 – Marketing / landing page
  m_first_impression: number;
  m_clarity_value: number;
  m_clarity_howitworks: number;
  m_comparatif: number;
  m_pricing_clarity: number;
  m_design: number;
  m_convinced: string;
  m_convinced_by: string;
  m_missing: string;
  // Section 7 – Outil marketing IA
  mt_quality: number;
  mt_relevance: number;
  mt_tone: number;
  mt_originality: number;
  mt_would_use: string;
  mt_best_format: string;
  mt_speed: number;
  mt_missing: string;
  mt_improve: string;
  // Section 8 – Commentaires
  c_good: string;
  c_improve: string;
  c_features: string;
}

const INITIAL: FormData = {
  email: '',
  platform: '',
  role: '',
  expertise: '',
  q_global: 0, q_description: 0, q_seo: 0, q_title: 0,
  u_api: 0, u_csv: 0, u_general: 0, u_interface: 0,
  p_willing: '', p_amount: '',
  v_utility: 0, v_time: 0, v_vs_current: 0,
  r_nps: 0, r_use_self: '',
  m_first_impression: 0, m_clarity_value: 0, m_clarity_howitworks: 0,
  m_comparatif: 0, m_pricing_clarity: 0, m_design: 0,
  m_convinced: '', m_convinced_by: '', m_missing: '',
  mt_quality: 0, mt_relevance: 0, mt_tone: 0, mt_originality: 0,
  mt_would_use: '', mt_best_format: '', mt_speed: 0,
  mt_missing: '', mt_improve: '',
  c_good: '', c_improve: '', c_features: '',
};

const STEPS: Step[] = ['email', 'briefing', 'quality', 'usability', 'price', 'value', 'recommend', 'marketing', 'marketing_tool', 'comments', 'done'];
const STEP_LABELS: Record<Step, string> = {
  email: 'Identification',
  briefing: 'Ta mission',
  quality: 'Qualité des fiches',
  usability: "Facilité d'utilisation",
  price: 'Prix',
  value: 'Valeur',
  recommend: 'Recommandation',
  marketing: 'Page marketing',
  marketing_tool: 'Outil marketing IA',
  comments: 'Commentaires',
  done: 'Terminé',
};

// ─── Star rating component ────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 focus:outline-none"
          >
            <Star
              className={cn(
                'h-7 w-7 transition-colors',
                (hovered || value) >= n
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-muted-foreground',
              )}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 self-center text-sm text-muted-foreground">{value}/5</span>
        )}
      </div>
    </div>
  );
}

// ─── NPS component ────────────────────────────────────────────────────────────

function NpsRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'h-10 w-10 rounded-lg border text-sm font-semibold transition-colors',
              value === n
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:border-primary hover:text-primary',
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0 – Pas du tout</span>
        <span>10 – Absolument</span>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function SurveyPage() {
  const [step, setStep] = useState<Step>('email');
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof FormData, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const currentIndex = STEPS.indexOf(step);
  const progress = (currentIndex / (STEPS.length - 2)) * 100;

  const goNext = () => {
    const next = STEPS[currentIndex + 1];
    if (next) setStep(next);
  };
  const goPrev = () => {
    const prev = STEPS[currentIndex - 1];
    if (prev) setStep(prev);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      setStep('done');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Email gate ──────────────────────────────────────────────────────────────
  if (step === 'email') {
    return (
      <PageShell>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ClipboardList className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Questionnaire bêta-testeur</CardTitle>
          <CardDescription className="mt-2 text-base">
            Merci de tester <strong>Woosenteur</strong> ! Ce questionnaire prend environ{' '}
            <strong>3 minutes</strong>. Vos retours sont précieux pour améliorer l&apos;outil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Votre adresse e-mail *</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Utilisé uniquement pour vous recontacter si besoin. Jamais revendu.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Votre plateforme e-commerce *</Label>
            <RadioGroup
              value={form.platform}
              onValueChange={(v) => set('platform', v)}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {['WooCommerce', 'Shopify', 'PrestaShop', 'Autre'].map((p) => (
                <Label
                  key={p}
                  htmlFor={`platform-${p}`}
                  className={cn(
                    'flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors',
                    form.platform === p
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  <RadioGroupItem id={`platform-${p}`} value={p} className="sr-only" />
                  {p}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Votre rôle *</Label>
            <RadioGroup
              value={form.role}
              onValueChange={(v) => set('role', v)}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { value: 'owner', label: '🏪 Propriétaire de boutique' },
                { value: 'developer', label: '💻 Développeur / Intégrateur' },
                { value: 'marketer', label: '📣 Expert marketing / SEO' },
                { value: 'agency', label: '🏢 Agence / Freelance' },
                { value: 'creator', label: '🎨 Créateur de contenu' },
                { value: 'other', label: '🙂 Autre' },
              ].map((r) => (
                <Label
                  key={r.value}
                  htmlFor={`role-${r.value}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors',
                    form.role === r.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  <RadioGroupItem id={`role-${r.value}`} value={r.value} className="sr-only" />
                  {r.label}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Niveau de maîtrise e-commerce *</Label>
            <RadioGroup
              value={form.expertise}
              onValueChange={(v) => set('expertise', v)}
              className="space-y-2"
            >
              {[
                {
                  value: 'beginner',
                  label: 'Débutant',
                  desc: "Je débute ou j'explore l'e-commerce",
                },
                {
                  value: 'intermediate',
                  label: 'Intermédiaire',
                  desc: "J'ai une boutique active, je me débrouille",
                },
                {
                  value: 'expert',
                  label: 'Expert',
                  desc: 'Je gère plusieurs boutiques ou des clients e-commerce',
                },
              ].map((e) => (
                <Label
                  key={e.value}
                  htmlFor={`exp-${e.value}`}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                    form.expertise === e.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  <RadioGroupItem id={`exp-${e.value}`} value={e.value} className="mt-0.5 shrink-0" />
                  <div>
                    <p className={cn('text-sm font-semibold', form.expertise === e.value && 'text-primary')}>
                      {e.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{e.desc}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!form.email.includes('@') || !form.platform || !form.role || !form.expertise}
            onClick={goNext}
          >
            Commencer le questionnaire
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </PageShell>
    );
  }

  // ── Done ────────────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <PageShell>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <CardTitle className="text-2xl">Merci beaucoup ! 🙏</CardTitle>
          <CardDescription className="text-base">
            Votre retour a bien été enregistré. Il m&apos;aide énormément à améliorer l&apos;outil.
            <br />
            <br />
            Si vous avez des questions ou remarques supplémentaires, n&apos;hésitez pas à me
            contacter directement.
          </CardDescription>
        </CardContent>
      </PageShell>
    );
  }

  // ── Multi-step form ─────────────────────────────────────────────────────────
  return (
    <PageShell>
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>
            Étape {currentIndex} / {STEPS.length - 2}
          </span>
          <span>{STEP_LABELS[step]}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Briefing / mission ──────────────────────────────────────────── */}
        {step === 'briefing' && (
          <BriefingStep platform={form.platform} />
        )}

        {/* ── Section 1 – Qualité ─────────────────────────────────────────── */}
        {step === 'quality' && (
          <>
            <SectionTitle>⭐ Qualité des fiches générées</SectionTitle>
            <p className="text-sm text-muted-foreground">
              Évaluez la qualité des fiches produits que l&apos;IA a générées pour votre boutique.
            </p>
            <div className="space-y-5">
              <StarRating
                label="Note globale de la fiche générée"
                value={form.q_global}
                onChange={(v) => set('q_global', v)}
              />
              <StarRating
                label="Précision et exactitude de la description"
                value={form.q_description}
                onChange={(v) => set('q_description', v)}
              />
              <StarRating
                label="Pertinence des mots-clés / optimisation SEO"
                value={form.q_seo}
                onChange={(v) => set('q_seo', v)}
              />
              <StarRating
                label="Qualité du titre produit généré"
                value={form.q_title}
                onChange={(v) => set('q_title', v)}
              />
            </div>
          </>
        )}

        {/* ── Section 2 – Facilité d'utilisation ──────────────────────────── */}
        {step === 'usability' && (
          <>
            <SectionTitle>🛠 Facilité d&apos;utilisation</SectionTitle>
            <p className="text-sm text-muted-foreground">
              Comment s&apos;est passée votre expérience lors de la prise en main de l&apos;outil ?
            </p>
            <div className="space-y-5">
              <StarRating
                label="Configuration de la clé API (WooCommerce / Shopify)"
                value={form.u_api}
                onChange={(v) => set('u_api', v)}
              />
              <StarRating
                label="Import / upload du fichier CSV produits"
                value={form.u_csv}
                onChange={(v) => set('u_csv', v)}
              />
              <StarRating
                label="Facilité d'utilisation générale"
                value={form.u_general}
                onChange={(v) => set('u_general', v)}
              />
              <StarRating
                label="Clarté de l'interface (navigation, boutons…)"
                value={form.u_interface}
                onChange={(v) => set('u_interface', v)}
              />
            </div>
          </>
        )}

        {/* ── Section 3 – Prix ─────────────────────────────────────────────── */}
        {step === 'price' && (
          <>
            <SectionTitle>💰 Prix &amp; modèle économique</SectionTitle>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Seriez-vous prêt(e) à payer pour ce service ?
                </Label>
                <RadioGroup
                  value={form.p_willing}
                  onValueChange={(v) => set('p_willing', v)}
                  className="space-y-2"
                >
                  {[
                    { value: 'yes', label: 'Oui, définitivement' },
                    { value: 'maybe', label: 'Peut-être, selon le prix' },
                    { value: 'freemium', label: 'Seulement si plan gratuit disponible' },
                    { value: 'no', label: 'Non, je ne paierais pas' },
                  ].map((o) => (
                    <div key={o.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={o.value} id={`willing-${o.value}`} />
                      <Label htmlFor={`willing-${o.value}`} className="font-normal cursor-pointer">
                        {o.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Quel tarif mensuel vous semblerait juste ? (par tranche de fiches)
                </Label>
                <RadioGroup
                  value={form.p_amount}
                  onValueChange={(v) => set('p_amount', v)}
                  className="space-y-2"
                >
                  {[
                    { value: 'lt5', label: 'Moins de 5 €/mois' },
                    { value: '5-15', label: '5 € – 15 €/mois' },
                    { value: '15-30', label: '15 € – 30 €/mois' },
                    { value: '30-50', label: '30 € – 50 €/mois' },
                    { value: 'credits', label: 'Je préfère payer au crédit (à la fiche)' },
                    { value: 'na', label: 'Je ne sais pas' },
                  ].map((o) => (
                    <div key={o.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={o.value} id={`amount-${o.value}`} />
                      <Label htmlFor={`amount-${o.value}`} className="font-normal cursor-pointer">
                        {o.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </>
        )}

        {/* ── Section 4 – Valeur ──────────────────────────────────────────── */}
        {step === 'value' && (
          <>
            <SectionTitle>📈 Valeur &amp; intérêt</SectionTitle>
            <p className="text-sm text-muted-foreground">
              Évaluez l&apos;utilité concrète de l&apos;outil pour votre activité.
            </p>
            <div className="space-y-5">
              <StarRating
                label="Utilité de l'outil pour votre boutique"
                value={form.v_utility}
                onChange={(v) => set('v_utility', v)}
              />
              <StarRating
                label="Gain de temps par rapport à la rédaction manuelle"
                value={form.v_time}
                onChange={(v) => set('v_time', v)}
              />
              <StarRating
                label="Qualité par rapport à votre méthode actuelle"
                value={form.v_vs_current}
                onChange={(v) => set('v_vs_current', v)}
              />
            </div>
          </>
        )}

        {/* ── Section 5 – Recommandation ───────────────────────────────────── */}
        {step === 'recommend' && (
          <>
            <SectionTitle>🤝 Recommandation</SectionTitle>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Sur une échelle de 0 à 10, recommanderiez-vous Woosenteur à un(e) ami(e) ou
                  collègue e-commerçant ?
                </Label>
                <NpsRating value={form.r_nps} onChange={(v) => set('r_nps', v)} />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Utiliseriez-vous cet outil vous-même dès sa sortie officielle ?
                </Label>
                <RadioGroup
                  value={form.r_use_self}
                  onValueChange={(v) => set('r_use_self', v)}
                  className="space-y-2"
                >
                  {[
                    { value: 'yes_paid', label: 'Oui, je suis prêt(e) à payer pour y avoir accès' },
                    { value: 'yes_free', label: 'Oui, si une version gratuite existe' },
                    { value: 'maybe', label: "Peut-être, j'aimerais voir plus de fonctionnalités" },
                    { value: 'no', label: "Non, ce n'est pas adapté à mon usage" },
                  ].map((o) => (
                    <div key={o.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={o.value} id={`use-${o.value}`} />
                      <Label htmlFor={`use-${o.value}`} className="font-normal cursor-pointer">
                        {o.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </>
        )}

        {/* ── Section 6 – Marketing / landing page ────────────────────────── */}
        {step === 'marketing' && (
          <>
            <SectionTitle>🖥 Page marketing (woosenteur.fr)</SectionTitle>
            <p className="text-sm text-muted-foreground">
              Avant de tester l&apos;outil, vous avez visité la page d&apos;accueil. Évaluez-la
              indépendamment de l&apos;outil lui-même.
            </p>
            <div className="space-y-5">
              <StarRating
                label="Première impression générale de la page"
                value={form.m_first_impression}
                onChange={(v) => set('m_first_impression', v)}
              />
              <StarRating
                label="Clarté du message : avez-vous compris à quoi sert l'outil immédiatement ?"
                value={form.m_clarity_value}
                onChange={(v) => set('m_clarity_value', v)}
              />
              <StarRating
                label='Section "Comment ça marche" (3 étapes) — est-elle claire ?'
                value={form.m_clarity_howitworks}
                onChange={(v) => set('m_clarity_howitworks', v)}
              />
              <StarRating
                label="Tableau comparatif (vs rédaction manuelle / ChatGPT) — utile et crédible ?"
                value={form.m_comparatif}
                onChange={(v) => set('m_comparatif', v)}
              />
              <StarRating
                label="Clarté de la section tarifs (prix, crédits, offres)"
                value={form.m_pricing_clarity}
                onChange={(v) => set('m_pricing_clarity', v)}
              />
              <StarRating
                label="Design et esthétique globale de la page"
                value={form.m_design}
                onChange={(v) => set('m_design', v)}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium">
                La page vous a-t-elle donné envie de tester l&apos;outil ?
              </Label>
              <RadioGroup
                value={form.m_convinced}
                onValueChange={(v) => set('m_convinced', v)}
                className="space-y-2"
              >
                {[
                  { value: 'yes_strong', label: 'Oui, immédiatement — le message est clair et convaincant' },
                  { value: 'yes_partial', label: "Plutôt oui, mais j'avais quelques doutes" },
                  { value: 'neutral', label: "Neutre — j'ai testé par curiosité, pas convaincu par la page" },
                  { value: 'no', label: "Non, c'est autre chose qui m'a motivé à tester" },
                ].map((o) => (
                  <div key={o.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={o.value} id={`conv-${o.value}`} />
                    <Label htmlFor={`conv-${o.value}`} className="font-normal cursor-pointer">
                      {o.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Quel élément de la page vous a le plus convaincu ?
              </Label>
              <RadioGroup
                value={form.m_convinced_by}
                onValueChange={(v) => set('m_convinced_by', v)}
                className="space-y-2"
              >
                {[
                  { value: 'hero', label: 'Le titre principal (hero)' },
                  { value: 'features', label: 'Les arguments / fonctionnalités (gain de temps, SEO…)' },
                  { value: 'howitworks', label: 'La section "Comment ça marche"' },
                  { value: 'comparatif', label: 'Le tableau comparatif vs ChatGPT / rédaction manuelle' },
                  { value: 'pricing', label: 'Le prix / le plan gratuit' },
                  { value: 'founder', label: "L'intro du fondateur (crédibilité)" },
                  { value: 'nothing', label: "Aucun élément en particulier" },
                ].map((o) => (
                  <div key={o.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={o.value} id={`by-${o.value}`} />
                    <Label htmlFor={`by-${o.value}`} className="font-normal cursor-pointer">
                      {o.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="m_missing">
                Qu&apos;est-ce qui manquait ou était peu clair sur la page marketing ?
              </Label>
              <Textarea
                id="m_missing"
                placeholder="Informations manquantes, sections confuses, questions sans réponse…"
                rows={3}
                value={form.m_missing}
                onChange={(e) => set('m_missing', e.target.value)}
              />
            </div>
          </>
        )}

        {/* ── Section 7 – Outil marketing IA ───────────────────────────────── */}
        {step === 'marketing_tool' && (
          <>
            <SectionTitle>🎯 Outil de génération marketing IA</SectionTitle>
            <p className="text-sm text-muted-foreground">
              Vous avez généré 5 contenus publicitaires dans <strong>Dashboard → Marketing</strong>.
              Évaluez maintenant la qualité de cet outil.
            </p>
            <div className="space-y-5">
              <StarRating
                label="Qualité globale des contenus générés"
                value={form.mt_quality}
                onChange={(v) => set('mt_quality', v)}
              />
              <StarRating
                label="Pertinence du message par rapport au produit"
                value={form.mt_relevance}
                onChange={(v) => set('mt_relevance', v)}
              />
              <StarRating
                label="Ton et style adaptés à votre audience / marché"
                value={form.mt_tone}
                onChange={(v) => set('mt_tone', v)}
              />
              <StarRating
                label="Originalité et créativité du contenu"
                value={form.mt_originality}
                onChange={(v) => set('mt_originality', v)}
              />
              <StarRating
                label="Rapidité de génération (vitesse ressentie)"
                value={form.mt_speed}
                onChange={(v) => set('mt_speed', v)}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium">
                Utiliseriez-vous ces contenus publicitaires ?
              </Label>
              <RadioGroup
                value={form.mt_would_use}
                onValueChange={(v) => set('mt_would_use', v)}
                className="space-y-2"
              >
                {[
                  { value: 'yes_direct', label: 'Oui, directement sans modification' },
                  { value: 'yes_edited', label: 'Oui, avec quelques retouches' },
                  { value: 'maybe', label: 'Peut-être — trop génériques pour l\'instant' },
                  { value: 'no_offtopic', label: 'Non, le contenu était hors sujet' },
                  { value: 'no_quality', label: 'Non, la qualité n\'est pas au niveau' },
                ].map((o) => (
                  <div key={o.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={o.value} id={`mt-use-${o.value}`} />
                    <Label htmlFor={`mt-use-${o.value}`} className="font-normal cursor-pointer">
                      {o.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Quel format publicitaire a donné les meilleurs résultats ?
              </Label>
              <RadioGroup
                value={form.mt_best_format}
                onValueChange={(v) => set('mt_best_format', v)}
                className="space-y-2"
              >
                {[
                  { value: 'facebook_post', label: '📘 Post Facebook / Instagram' },
                  { value: 'google_ads', label: '🔍 Accroche Google Ads' },
                  { value: 'email', label: '📧 Objet / corps d\'email marketing' },
                  { value: 'product_desc', label: '🛒 Description produit enrichie' },
                  { value: 'visual_ad', label: '🖼 Visuel publicitaire (image générée)' },
                  { value: 'all_equal', label: '✅ Tous les formats étaient bons' },
                  { value: 'none', label: '❌ Aucun format ne m\'a convaincu' },
                ].map((o) => (
                  <div key={o.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={o.value} id={`mt-fmt-${o.value}`} />
                    <Label htmlFor={`mt-fmt-${o.value}`} className="font-normal cursor-pointer">
                      {o.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mt_missing">
                Qu&apos;est-ce qui manque dans le module marketing ?
              </Label>
              <Textarea
                id="mt_missing"
                placeholder="Ex : intégration Meta Ads, planification de posts, A/B testing, autres langues…"
                rows={3}
                value={form.mt_missing}
                onChange={(e) => set('mt_missing', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mt_improve">
                Que feriez-vous pour améliorer cet outil marketing ?
              </Label>
              <Textarea
                id="mt_improve"
                placeholder="Idées, fonctionnalités souhaitées, comparaison avec d'autres outils…"
                rows={3}
                value={form.mt_improve}
                onChange={(e) => set('mt_improve', e.target.value)}
              />
            </div>
          </>
        )}

        {/* ── Section 8 – Commentaires libres ──────────────────────────────── */}
        {step === 'comments' && (
          <>
            <SectionTitle>💬 Commentaires libres</SectionTitle>
            <p className="text-sm text-muted-foreground">
              Ces retours sont les plus précieux — ne vous censurez pas !
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="c_good">Ce qui vous a le plus plu</Label>
                <Textarea
                  id="c_good"
                  placeholder="Points forts, fonctionnalités appréciées…"
                  rows={3}
                  value={form.c_good}
                  onChange={(e) => set('c_good', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c_improve">Ce qui doit être amélioré</Label>
                <Textarea
                  id="c_improve"
                  placeholder="Bugs rencontrés, points de friction, UX à revoir…"
                  rows={3}
                  value={form.c_improve}
                  onChange={(e) => set('c_improve', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c_features">Fonctionnalités que vous aimeriez voir</Label>
                <Textarea
                  id="c_features"
                  placeholder="Idées, intégrations souhaitées, cas d'usage spécifiques…"
                  rows={3}
                  value={form.c_features}
                  onChange={(e) => set('c_features', e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </>
        )}

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={goPrev} disabled={currentIndex <= 1}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Précédent
          </Button>

          {step !== 'comments' ? (
            <Button onClick={goNext}>
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi…
                </>
              ) : (
                <>
                  Envoyer mes réponses
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </PageShell>
  );
}

// ─── Briefing component ───────────────────────────────────────────────────────

function BriefingStep({ platform }: { platform: string }) {
  const isWoo = platform === 'WooCommerce';
  const isShopify = platform === 'Shopify';

  return (
    <div className="space-y-5">
      <div>
        <SectionTitle>🚀 Ta mission de bêta-testeur</SectionTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Lis attentivement avant de commencer — ça prend 2 minutes et tu sauras exactement quoi
          faire pour que tes retours soient utiles.
        </p>
      </div>

      {/* Étape 1 – Créer un compte */}
      <BriefingCard
        icon={<Key className="h-5 w-5 text-primary" />}
        step="1"
        title="Créer ton compte Woosenteur"
        badge="Déjà fait ? Passe à l'étape 2"
      >
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          <li>Va sur <strong>woosenteur.com</strong> et clique sur <em>"Essai gratuit"</em></li>
          <li>Crée ton compte (tu reçois <strong>5 crédits offerts</strong>, sans carte)</li>
        </ol>
      </BriefingCard>

      {/* Étape 2 – Configurer la connexion */}
      <BriefingCard
        icon={<Upload className="h-5 w-5 text-blue-500" />}
        step="2"
        title={
          isWoo
            ? 'Connecter ta boutique WooCommerce'
            : isShopify
            ? 'Préparer ton export Shopify'
            : 'Choisir ton mode d\'export'
        }
      >
        {isWoo && (
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
            <li>
              Dans ton WordPress : <strong>WooCommerce → Réglages → Avancé → REST API</strong>
            </li>
            <li>
              Clique <em>"Ajouter une clé"</em>, donne-lui un nom, choisis{' '}
              <strong>Accès "Lecture/Écriture"</strong>
            </li>
            <li>
              Copie la <strong>Consumer Key (CK)</strong> et la{' '}
              <strong>Consumer Secret (CS)</strong>
            </li>
            <li>
              Dans Woosenteur : <strong>Dashboard → Profil → Connecter ma boutique</strong>
            </li>
            <li>
              Colle l&apos;URL de ta boutique + CK + CS, et valide
            </li>
          </ol>
        )}
        {isShopify && (
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
            <li>
              Dans Woosenteur, génère tes fiches normalement (pas besoin de clé API pour Shopify)
            </li>
            <li>
              À la fin, clique <strong>"Exporter CSV Shopify"</strong>
            </li>
            <li>
              Dans ton admin Shopify : <strong>Produits → Importer → sélectionne le fichier CSV</strong>
            </li>
          </ol>
        )}
        {!isWoo && !isShopify && (
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
            <li>Génère tes fiches dans Woosenteur</li>
            <li>
              Utilise l&apos;export <strong>CSV universel</strong> pour les importer dans ta
              plateforme
            </li>
            <li>
              Si ta plateforme ne supporte pas le CSV, note-le dans le questionnaire — c&apos;est
              une info précieuse !
            </li>
          </ol>
        )}
      </BriefingCard>

      {/* Étape 3 – Générer 5 fiches produits */}
      <BriefingCard
        icon={<FlaskConical className="h-5 w-5 text-emerald-500" />}
        step="3"
        title="Générer 5 fiches produits — en variant les cas"
      >
        <p className="text-sm text-muted-foreground mb-2">
          Varie les scénarios pour tester l&apos;IA dans différentes situations :
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">✓</span>
            <span>
              <strong>1–2 produits que tu connais très bien</strong> — pour vérifier si l&apos;IA
              est précise (description, caractéristiques, usage…)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">?</span>
            <span>
              <strong>1–2 produits peu connus / niche</strong> — pour voir comment l&apos;IA se
              débrouille sans infos faciles à trouver
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-bold">⟳</span>
            <span>
              <strong>1 produit avec une photo uploadée</strong> — teste si l&apos;analyse d&apos;image
              améliore la fiche
            </span>
          </li>
        </ul>
        <div className="mt-3 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <AlertCircle className="inline h-3.5 w-3.5 mr-1 align-text-top" />
          Note mentalement la qualité de chaque fiche — tu vas les évaluer dans le questionnaire juste après.
        </div>
      </BriefingCard>

      {/* Étape 4 – Tester le marketing */}
      <BriefingCard
        icon={<Megaphone className="h-5 w-5 text-purple-500" />}
        step="4"
        title="Tester la section Marketing (génération de pubs)"
      >
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
          <li>
            Va dans <strong>Dashboard → Marketing</strong>
          </li>
          <li>
            Sélectionne un de tes produits générés (ou entre un produit manuellement)
          </li>
          <li>
            Génère au moins <strong>5 contenus publicitaires</strong> — teste différents styles
            et formats (post Facebook, visuel pub, accroche Google Ads…)
          </li>
          <li>Note la qualité, la pertinence et si tu l&apos;utiliserais vraiment</li>
        </ol>
      </BriefingCard>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
        <p className="font-medium text-primary">Une fois tes tests terminés, reviens ici et remplis le questionnaire.</p>
        <p className="mt-1 text-muted-foreground">
          Tu peux garder cet onglet ouvert pendant que tu testes.
        </p>
      </div>
    </div>
  );
}

function BriefingCard({
  icon,
  step,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode;
  step: string;
  title: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
          {step}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-sm">
              {icon}
              {title}
            </span>
            {badge && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="pl-11">{children}</div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-xl shadow-lg">{children}</Card>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}
