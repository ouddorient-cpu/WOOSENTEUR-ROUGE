'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ImagePlus, Sparkles } from 'lucide-react';
import { FORMAT_LABELS, type SocialVisualFormat } from '@/lib/social-visuals/types';

interface SocialVisualFormProps {
  isGenerating: boolean;
  creditBalance?: number;
  isUnlimited?: boolean;
  onSubmit: (input: { file: File; productUrl: string; format: SocialVisualFormat }) => void;
}

export function SocialVisualForm({ isGenerating, creditBalance, isUnlimited, onSubmit }: SocialVisualFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState('');
  const [format, setFormat] = useState<SocialVisualFormat>('square');

  const canGenerate = isUnlimited || (creditBalance ?? 0) > 0;

  function handleFileChange(selected: File | null) {
    setFile(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !productUrl) return;
    onSubmit({ file, productUrl, format });
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Photo du produit</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center hover:border-primary/50 transition-colors"
            >
              {previewUrl ? (
                <div className="relative h-48 w-48">
                  <Image src={previewUrl} alt="Aperçu produit" fill unoptimized className="object-contain rounded-md" />
                </div>
              ) : (
                <>
                  <ImagePlus className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Cliquez pour importer une photo produit</p>
                  <p className="text-xs text-muted-foreground">PNG, JPEG ou WebP — 8 Mo max</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productUrl">Lien vers le produit</Label>
            <Input
              id="productUrl"
              type="url"
              placeholder="https://maboutique.fr/produit/mon-produit"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as SocialVisualFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(FORMAT_LABELS) as SocialVisualFormat[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {FORMAT_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isUnlimited && (
            <p className="text-sm text-muted-foreground">
              Coût : 1 crédit — solde actuel : {creditBalance ?? 0}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={!file || !productUrl || isGenerating || !canGenerate}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : !canGenerate ? (
              'Crédits insuffisants'
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Générer le visuel
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
