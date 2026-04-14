/**
 * Générateur d'images finales
 * Combine: image originale + slogan + éléments olfactifs
 * Utilise Canvas API (côté client) ou Sharp (serveur)
 */

import type { MarketingContent, VisualElement } from '@/types/marketing';

export async function generateFinalImage(
  baseImageBase64: string,
  content: MarketingContent,
  options: {
    sloganPosition?: 'top' | 'bottom';
    width?: number;
    height?: number;
  } = {}
): Promise<string> {
  const { sloganPosition = 'bottom', width = 1080, height = 1080 } = options;

  // TODO: Implémentation avec Canvas ou serveur
  // Pour maintenant, retourner l'image de base

  // En produit, utiliser:
  // - Sharp (node) pour le serveur
  // - Canvas API ou Konva.js (client) pour le client
  // - Replicate pour génération IA

  return baseImageBase64;
}

export function renderOlfactoryElements(
  ctx: CanvasRenderingContext2D,
  elements: VisualElement[],
  canvasWidth: number,
  canvasHeight: number
) {
  elements.forEach((elem) => {
    const x = (elem.position.x / 100) * canvasWidth;
    const y = (elem.position.y / 100) * canvasHeight;

    // Taille de l'élément selon le type
    const baseSizeMap = {
      small: 24,
      medium: 36,
      large: 48,
    };

    const size = baseSizeMap[elem.size];
    const fontSize = size;

    // Dessiner les éléments olfactifs
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(elem.icon, x, y);

    // Petite ombre pour meilleure lisibilité
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x - size / 2, y + size / 2 - 5, size, 2);
  });
}

export function renderSlogan(
  ctx: CanvasRenderingContext2D,
  slogan: string,
  canvasWidth: number,
  canvasHeight: number,
  position: 'top' | 'bottom' = 'bottom'
) {
  const padding = 20;
  const fontSize = 24;
  const lineHeight = fontSize + 10;

  // Configuration du texte
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';

  // Position Y
  const y = position === 'top' ? padding + fontSize : canvasHeight - padding;

  // Découper le texte si trop long
  const maxWidth = canvasWidth - padding * 2;
  const words = slogan.split(' ');
  let lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);

  // Fond opaque pour le texte
  const totalHeight = lines.length * lineHeight;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(
    padding,
    y - fontSize / 2 - padding / 2,
    canvasWidth - padding * 2,
    totalHeight + padding
  );

  // Afficher le texte
  ctx.fillStyle = 'white';
  lines.forEach((line, idx) => {
    ctx.fillText(line, canvasWidth / 2, y + idx * lineHeight);
  });
}
