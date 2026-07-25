'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Share2, Copy, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedVisualResultProps {
  generatedImageUrl: string;
  slogan: string;
  cta: string;
  productUrl: string;
  onCreateNew: () => void;
}

export function GeneratedVisualResult({ generatedImageUrl, slogan, cta, productUrl, onCreateNew }: GeneratedVisualResultProps) {
  const { toast } = useToast();
  const [sharing, setSharing] = useState(false);

  async function handleDownload() {
    const res = await fetch(generatedImageUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visuel-woosenteur.png';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleShare() {
    setSharing(true);
    try {
      const shareData: ShareData = { title: slogan, text: `${slogan}\n${cta}`, url: productUrl };

      if (typeof navigator.canShare === 'function') {
        try {
          const res = await fetch(generatedImageUrl);
          const blob = await res.blob();
          const file = new File([blob], 'visuel-woosenteur.png', { type: blob.type || 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ ...shareData, files: [file] });
            return;
          }
        } catch {
          // fall through to text-only share
        }
      }

      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      toast({ title: 'Partage non disponible', description: "Utilisez les boutons Télécharger et Copier ci-dessous.", variant: 'destructive' });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        toast({ title: 'Erreur de partage', description: err.message, variant: 'destructive' });
      }
    } finally {
      setSharing(false);
    }
  }

  function handleCopyText() {
    navigator.clipboard.writeText(`${slogan}\n${cta}`);
    toast({ title: 'Texte copié' });
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(productUrl);
    toast({ title: 'Lien copié' });
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="relative mx-auto max-h-[70vh] w-fit overflow-hidden rounded-lg border">
          <Image src={generatedImageUrl} alt="Visuel généré" width={400} height={500} className="h-auto w-auto max-h-[70vh] object-contain" unoptimized />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleDownload} variant="default">
            <Download className="mr-2 h-4 w-4" />
            Télécharger en PNG
          </Button>
          <Button onClick={handleShare} variant="secondary" disabled={sharing}>
            <Share2 className="mr-2 h-4 w-4" />
            Partager
          </Button>
          <Button onClick={handleCopyText} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copier le texte
          </Button>
          <Button onClick={handleCopyLink} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copier le lien
          </Button>
        </div>

        <Button onClick={onCreateNew} variant="ghost" className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" />
          Créer un nouveau visuel
        </Button>
      </CardContent>
    </Card>
  );
}
