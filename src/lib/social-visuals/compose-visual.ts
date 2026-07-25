import sharp from 'sharp';
import { FORMAT_DIMENSIONS, type SocialVisualFormat } from './types';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function shade(rgb: { r: number; g: number; b: number }, factor: number) {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return {
    r: clamp(rgb.r * factor),
    g: clamp(rgb.g * factor),
    b: clamp(rgb.b * factor),
  };
}

function toHex({ r, g, b }: { r: number; g: number; b: number }) {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

// Relative luminance (WCAG) to decide whether overlay text should be light or dark.
function isDark({ r, g, b }: { r: number; g: number; b: number }) {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export interface ComposeVisualInput {
  sourceBuffer: Buffer;
  format: SocialVisualFormat;
  slogan: string;
  cta: string;
  domain: string;
}

export async function composeVisual({ sourceBuffer, format, slogan, cta, domain }: ComposeVisualInput): Promise<Buffer> {
  const { width, height } = FORMAT_DIMENSIONS[format];

  const normalizedSource = await sharp(sourceBuffer).rotate().png().toBuffer();
  const stats = await sharp(normalizedSource).stats();
  const dominant = stats.dominant;

  const backgroundTop = shade(dominant, 1.15);
  const backgroundBottom = shade(dominant, 0.55);
  const textIsLight = isDark(backgroundBottom);
  const textColor = textIsLight ? '#ffffff' : '#111111';
  const ctaBg = textIsLight ? '#ffffff' : '#111111';
  const ctaText = textIsLight ? '#111111' : '#ffffff';

  const margin = Math.round(width * 0.08);
  const productMaxWidth = width - margin * 2;
  const productMaxHeight = Math.round(height * 0.55);

  const productLayer = await sharp(normalizedSource)
    .resize({ width: productMaxWidth, height: productMaxHeight, fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  const productMeta = await sharp(productLayer).metadata();
  const productWidth = productMeta.width ?? productMaxWidth;
  const productHeight = productMeta.height ?? productMaxHeight;

  const productTop = Math.round(height * 0.08);
  const productLeft = Math.round((width - productWidth) / 2);

  const backgroundSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${toHex(backgroundTop)}" />
          <stop offset="100%" stop-color="${toHex(backgroundBottom)}" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
    </svg>
  `;

  const fontSize = Math.round(width * 0.055);
  const ctaFontSize = Math.round(width * 0.032);
  const domainFontSize = Math.round(width * 0.022);

  const sloganY = productTop + productHeight + Math.round(height * 0.09);
  const ctaY = sloganY + Math.round(height * 0.09);
  const ctaBoxWidth = Math.round(width * 0.55);
  const ctaBoxHeight = Math.round(height * 0.055);
  const ctaBoxX = Math.round((width - ctaBoxWidth) / 2);
  const ctaBoxY = ctaY - Math.round(ctaBoxHeight * 0.7);

  const textSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .slogan { font-family: 'Arial', sans-serif; font-weight: 700; fill: ${textColor}; }
        .cta { font-family: 'Arial', sans-serif; font-weight: 700; fill: ${ctaText}; }
        .domain { font-family: 'Arial', sans-serif; font-weight: 400; fill: ${textColor}; opacity: 0.75; }
      </style>
      <text x="50%" y="${sloganY}" text-anchor="middle" class="slogan" font-size="${fontSize}">${escapeXml(slogan)}</text>
      <rect x="${ctaBoxX}" y="${ctaBoxY}" width="${ctaBoxWidth}" height="${ctaBoxHeight}" rx="${Math.round(ctaBoxHeight / 2)}" fill="${ctaBg}" />
      <text x="50%" y="${ctaY}" text-anchor="middle" class="cta" font-size="${ctaFontSize}">${escapeXml(cta)}</text>
      ${domain ? `<text x="50%" y="${height - Math.round(height * 0.03)}" text-anchor="middle" class="domain" font-size="${domainFontSize}">${escapeXml(domain)}</text>` : ''}
    </svg>
  `;

  return sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: Buffer.from(backgroundSvg) },
      { input: productLayer, top: productTop, left: productLeft },
      { input: Buffer.from(textSvg) },
    ])
    .png()
    .toBuffer();
}
