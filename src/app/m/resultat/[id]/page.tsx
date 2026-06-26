'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase';
import type { Product } from '@/lib/types';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Share2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MobileResultatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const productPath = user && id ? `users/${user.uid}/products/${id}` : null;
  const { data: product, isLoading } = useDoc<Product>(productPath);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <MobileHeader title="Résultat" showBack />
        <div className="p-4 text-sm text-muted-foreground">Cette fiche n'existe pas ou plus.</div>
      </div>
    );
  }

  const seo = product.seo;
  const plainText = `${seo?.productTitle || product.name}\n\n${seo?.shortDescription || ''}\n\n${(seo?.longDescription || '').replace(/<[^>]+>/g, '')}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(plainText);
    toast({ title: 'Copié !', description: 'La fiche a été copiée dans le presse-papier.' });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: seo?.productTitle || product.name, text: plainText });
      } catch {
        // partage annulé par l'utilisateur, rien à faire
      }
    } else {
      handleCopy();
    }
  };

  const handleExport = () => {
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(seo?.slug || product.name).replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export prêt', description: 'Le fichier texte a été téléchargé.' });
  };

  return (
    <div>
      <MobileHeader title="Ta fiche est prête" showBack />
      <div className="space-y-4 p-4">
        <div>
          <Badge variant="secondary" className="mb-2">{product.productType}</Badge>
          <h2 className="font-headline text-xl font-bold">{seo?.productTitle || product.name}</h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="mr-1.5 h-4 w-4" /> Copier
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-1.5 h-4 w-4" /> Partager
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" /> Exporter
          </Button>
        </div>

        <Tabs defaultValue="description">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
            <TabsTrigger value="seo" className="flex-1">SEO</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <Card>
              <CardContent className="space-y-3 p-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Description courte</p>
                  <p className="text-sm">{seo?.shortDescription}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Description longue</p>
                  <div
                    className="prose prose-sm max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: seo?.longDescription || '' }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="seo">
            <Card>
              <CardContent className="space-y-2 p-4 text-sm">
                <p><span className="font-semibold">Mot-clé principal :</span> {seo?.focusKeyword}</p>
                {seo?.tags && <p><span className="font-semibold">Tags :</span> {seo.tags}</p>}
                {seo?.slug && <p><span className="font-semibold">Slug :</span> {seo.slug}</p>}
                {seo?.imageAltText && <p><span className="font-semibold">Texte alt image :</span> {seo.imageAltText}</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
