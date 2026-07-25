import type { SocialVisualFormat } from './types';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 Mo
const MIN_DIMENSION_PX = 300;

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Format de fichier non supporté. Utilisez une image PNG, JPEG ou WebP.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'Image trop lourde (8 Mo maximum).';
  }
  return null;
}

export function validateImageDimensions(width: number, height: number): string | null {
  if (width < MIN_DIMENSION_PX || height < MIN_DIMENSION_PX) {
    return `Image trop petite (minimum ${MIN_DIMENSION_PX}×${MIN_DIMENSION_PX}px).`;
  }
  return null;
}

export function validateProductUrl(url: string): string | null {
  if (!url) return 'Le lien vers le produit est requis.';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'Le lien doit commencer par http:// ou https://.';
    }
  } catch {
    return 'Le lien vers le produit est invalide.';
  }
  return null;
}

export function getSimplifiedDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

const VALID_FORMATS: SocialVisualFormat[] = ['square', 'portrait', 'story'];

export function validateFormat(format: string): format is SocialVisualFormat {
  return VALID_FORMATS.includes(format as SocialVisualFormat);
}
