'use client';

import Image from 'next/image';
import { doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Trash2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { FORMAT_LABELS, type SocialVisual } from '@/lib/social-visuals/types';

interface SocialVisualsHistoryProps {
  userId: string;
  visuals: SocialVisual[] | null;
  isLoading: boolean;
}

export function SocialVisualsHistory({ userId, visuals, isLoading }: SocialVisualsHistoryProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(firestore, 'users', userId, 'socialVisuals', id));
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (!visuals || visuals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Aucun visuel généré pour le moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {visuals.map((visual) => (
        <Card key={visual.id} className="overflow-hidden">
          <div className="relative aspect-square bg-muted">
            {visual.generatedImageUrl && (
              <Image src={visual.generatedImageUrl} alt={visual.slogan || 'Visuel'} fill unoptimized className="object-cover" />
            )}
          </div>
          <CardContent className="p-3 space-y-2">
            <p className="text-xs text-muted-foreground truncate">{FORMAT_LABELS[visual.format]}</p>
            <div className="flex gap-2">
              {visual.generatedImageUrl && (
                <Button asChild size="icon" variant="outline" className="h-8 w-8">
                  <a href={visual.generatedImageUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleDelete(visual.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
