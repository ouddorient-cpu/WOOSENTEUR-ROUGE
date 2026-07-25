import type { Timestamp } from 'firebase/firestore';

export type SocialVisualFormat = 'square' | 'portrait' | 'story';

export const FORMAT_DIMENSIONS: Record<SocialVisualFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

export const FORMAT_LABELS: Record<SocialVisualFormat, string> = {
  square: 'Carré (1080×1080)',
  portrait: 'Portrait (1080×1350)',
  story: 'Story (1080×1920)',
};

export type SocialVisualStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Firestore: users/{userId}/socialVisuals/{id}
export type SocialVisual = {
  id: string;
  userId: string;
  sourceImageUrl: string;
  generatedImageUrl?: string;
  productUrl: string;
  format: SocialVisualFormat;
  slogan?: string;
  cta?: string;
  status: SocialVisualStatus;
  creditsUsed: number;
  createdAt: Timestamp;
  errorMessage?: string;
};
