'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { SocialVisualForm } from '@/components/social-visuals/social-visual-form';
import { GeneratedVisualResult } from '@/components/social-visuals/generated-visual-result';
import { SocialVisualsHistory } from '@/components/social-visuals/social-visuals-history';
import type { SocialVisual, SocialVisualFormat } from '@/lib/social-visuals/types';
import type { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type Step = 'form' | 'generating' | 'result';

type GenerationResult = {
  generatedImageUrl: string;
  slogan: string;
  cta: string;
  productUrl: string;
};

export default function SocialVisualsPage() {
  const { user, loading: isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('form');
  const [result, setResult] = useState<GenerationResult | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) router.push('/login');
  }, [user, isUserLoading, router]);

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: userProfile } = useDoc<UserProfile>(userProfilePath);

  const visualsPath = useMemo(() => (user ? `users/${user.uid}/socialVisuals` : null), [user]);
  const { data: visuals, isLoading: visualsLoading } = useCollection<SocialVisual>(
    visualsPath ? query(collection(firestore, visualsPath), orderBy('createdAt', 'desc')) : null
  );

  async function handleGenerate({ file, productUrl, format }: { file: File; productUrl: string; format: SocialVisualFormat }) {
    if (!user) return;
    setStep('generating');
    try {
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('image', file);
      formData.append('productUrl', productUrl);
      formData.append('format', format);

      const res = await fetch('/api/social-visuals/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "La génération du visuel a échoué.");
      }

      setResult({
        generatedImageUrl: data.generatedImageUrl,
        slogan: data.slogan,
        cta: data.cta,
        productUrl: data.productUrl,
      });
      setStep('result');
    } catch (err: any) {
      toast({ title: 'Erreur de génération', description: err.message, variant: 'destructive' });
      setStep('form');
    }
  }

  function handleCreateNew() {
    setResult(null);
    setStep('form');
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Visuel réseaux sociaux</h1>
        <p className="text-muted-foreground">
          Transformez une photo produit en visuel publicitaire prêt à publier.
        </p>
      </div>

      <div className="mx-auto max-w-md">
        {step === 'result' && result ? (
          <GeneratedVisualResult
            generatedImageUrl={result.generatedImageUrl}
            slogan={result.slogan}
            cta={result.cta}
            productUrl={result.productUrl}
            onCreateNew={handleCreateNew}
          />
        ) : (
          <SocialVisualForm
            isGenerating={step === 'generating'}
            creditBalance={userProfile?.creditBalance}
            isUnlimited={userProfile?.isUnlimited || userProfile?.role === 'superadmin'}
            onSubmit={handleGenerate}
          />
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Historique</h2>
        <SocialVisualsHistory userId={user.uid} visuals={visuals} isLoading={visualsLoading} />
      </div>
    </div>
  );
}
