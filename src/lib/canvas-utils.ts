/**
 * Canvas utilities for creating composite ad images with text overlays.
 */

interface TextOverlayOptions {
  headline: string;
  body?: string;
  cta: string;
  style: 'luxe' | 'clean' | 'fun' | 'science';
  format: 'instagram_post' | 'instagram_story' | 'facebook_ad';
}

interface StyleConfig {
  bgGradient: [string, string];
  headlineColor: string;
  bodyColor: string;
  ctaColor: string;
  ctaBgColor: string;
  fontFamily: string;
}

const STYLE_CONFIGS: Record<string, StyleConfig> = {
  luxe: {
    bgGradient: ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)'],
    headlineColor: '#FFD700',
    bodyColor: '#FFFFFF',
    ctaColor: '#000000',
    ctaBgColor: '#FFD700',
    fontFamily: 'Georgia, serif',
  },
  clean: {
    bgGradient: ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.6)'],
    headlineColor: '#1a5a3a',
    bodyColor: '#333333',
    ctaColor: '#FFFFFF',
    ctaBgColor: '#1a5a3a',
    fontFamily: 'system-ui, sans-serif',
  },
  fun: {
    bgGradient: ['rgba(236,72,153,0.8)', 'rgba(168,85,247,0.6)'],
    headlineColor: '#FFFFFF',
    bodyColor: '#FFFFFF',
    ctaColor: '#ec4899',
    ctaBgColor: '#FFFFFF',
    fontFamily: 'system-ui, sans-serif',
  },
  science: {
    bgGradient: ['rgba(15,23,42,0.85)', 'rgba(30,41,59,0.6)'],
    headlineColor: '#60A5FA',
    bodyColor: '#E2E8F0',
    ctaColor: '#FFFFFF',
    ctaBgColor: '#3B82F6',
    fontFamily: 'system-ui, sans-serif',
  },
};

const FORMAT_DIMENSIONS = {
  instagram_post: { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  facebook_ad: { width: 1200, height: 628 },
};

/**
 * Creates a composite image with text overlay on the provided background image
 */
export async function createAdComposite(
  imageUrl: string,
  options: TextOverlayOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const dimensions = FORMAT_DIMENSIONS[options.format] || FORMAT_DIMENSIONS.instagram_post;
        const canvas = document.createElement('canvas');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Unable to create canvas context'));
          return;
        }

        // Draw background image (cover fit)
        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Apply style-specific overlay gradient
        const styleConfig = STYLE_CONFIGS[options.style] || STYLE_CONFIGS.luxe;
        const gradient = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
        gradient.addColorStop(0, styleConfig.bgGradient[1]);
        gradient.addColorStop(1, styleConfig.bgGradient[0]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6);

        // Text positioning - bottom portion of the image
        const padding = canvas.width * 0.06;
        const textAreaTop = canvas.height * 0.55;
        const textAreaHeight = canvas.height * 0.4;
        const maxTextWidth = canvas.width - padding * 2;

        // Draw headline
        const headlineSize = Math.round(canvas.width * 0.055);
        ctx.font = `bold ${headlineSize}px ${styleConfig.fontFamily}`;
        ctx.fillStyle = styleConfig.headlineColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const headlineLines = wrapText(ctx, options.headline, maxTextWidth);
        let currentY = textAreaTop;

        headlineLines.forEach((line) => {
          ctx.fillText(line, canvas.width / 2, currentY);
          currentY += headlineSize * 1.3;
        });

        // Draw body text if provided
        if (options.body) {
          currentY += headlineSize * 0.3;
          const bodySize = Math.round(canvas.width * 0.035);
          ctx.font = `${bodySize}px ${styleConfig.fontFamily}`;
          ctx.fillStyle = styleConfig.bodyColor;

          const bodyLines = wrapText(ctx, options.body, maxTextWidth);
          const maxBodyLines = Math.min(bodyLines.length, 3);

          for (let i = 0; i < maxBodyLines; i++) {
            ctx.fillText(bodyLines[i], canvas.width / 2, currentY);
            currentY += bodySize * 1.4;
          }
        }

        // Draw CTA button
        currentY += padding * 0.5;
        const ctaSize = Math.round(canvas.width * 0.04);
        ctx.font = `bold ${ctaSize}px ${styleConfig.fontFamily}`;
        const ctaMetrics = ctx.measureText(options.cta);
        const ctaPadding = ctaSize * 0.8;
        const ctaWidth = ctaMetrics.width + ctaPadding * 2;
        const ctaHeight = ctaSize * 2;
        const ctaX = (canvas.width - ctaWidth) / 2;
        const ctaY = Math.min(currentY, canvas.height - ctaHeight - padding);

        // CTA button background with rounded corners
        ctx.fillStyle = styleConfig.ctaBgColor;
        roundRect(ctx, ctaX, ctaY, ctaWidth, ctaHeight, ctaSize * 0.4);
        ctx.fill();

        // CTA text
        ctx.fillStyle = styleConfig.ctaColor;
        ctx.textBaseline = 'middle';
        ctx.fillText(options.cta, canvas.width / 2, ctaY + ctaHeight / 2);

        // Export as data URL
        const dataUrl = canvas.toDataURL('image/png', 0.95);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

/**
 * Wraps text to fit within a maximum width
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
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

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Draws a rounded rectangle path
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// ─────────────────────────────────────────────────────────────────────────────
// DUPE OVERLAY — Viral comparison card
// Layout: [dark top hook] [product photo center] [gradient bottom solution]
// ─────────────────────────────────────────────────────────────────────────────

export interface DupeOverlayOptions {
  /** "Tu aimes SAUVAGE d'YSL mais pas son prix 320€ ?" */
  hookTop: string;
  /** "✅ LA SOLUTION : SALVO DE ALHAMBRA" */
  solutionBottom: string;
  /** "49€ seulement" — optional price tag */
  priceTag?: string;
  /** Visual format — defaults to instagram_post */
  format?: 'instagram_post' | 'instagram_story' | 'facebook_ad';
  /** Accent color for the bottom band (hex). Defaults to purple. */
  accentColor?: string;
}

/**
 * Creates a viral "dupe" comparison card:
 *  - Top band: dark overlay with hook question
 *  - Center: product photo (cover fit, clearly visible)
 *  - Bottom band: colored gradient with solution + product name
 */
export async function createDupeOverlay(
  imageSource: string,
  options: DupeOverlayOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const dims = FORMAT_DIMENSIONS[options.format || 'instagram_post'];
        const W = dims.width;
        const H = dims.height;

        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context unavailable')); return; }

        // ── Band heights ──────────────────────────────────────────────────────
        const topBandH  = Math.round(H * 0.15);   // ~15% for hook
        const botBandH  = Math.round(H * 0.18);   // ~18% for solution
        const centerH   = H - topBandH - botBandH; // remaining for photo

        // ── 1. Draw product image in center (cover fill) ───────────────────
        // Clip to center area
        ctx.save();
        ctx.rect(0, topBandH, W, centerH);
        ctx.clip();
        const scale = Math.max(W / img.width, H / img.height);
        const ix = (W  - img.width  * scale) / 2;
        const iy = (H  - img.height * scale) / 2;
        ctx.drawImage(img, ix, iy, img.width * scale, img.height * scale);
        ctx.restore();

        // Slight vignette on center image edges (makes text bands pop)
        const vigTop = ctx.createLinearGradient(0, topBandH, 0, topBandH + 60);
        vigTop.addColorStop(0, 'rgba(0,0,0,0.3)');
        vigTop.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = vigTop;
        ctx.fillRect(0, topBandH, W, 60);

        const vigBot = ctx.createLinearGradient(0, H - botBandH - 60, 0, H - botBandH);
        vigBot.addColorStop(0, 'rgba(0,0,0,0)');
        vigBot.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = vigBot;
        ctx.fillRect(0, H - botBandH - 60, W, 60);

        // ── 2. Top band (dark) ─────────────────────────────────────────────
        ctx.fillStyle = 'rgba(10, 10, 15, 0.92)';
        ctx.fillRect(0, 0, W, topBandH);

        // Red "X" accent line on left of top band
        ctx.fillStyle = '#FF3B3B';
        ctx.fillRect(0, 0, 8, topBandH);

        // Hook text — centered, white, bold
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const hookFontSize = Math.round(W * 0.043);
        ctx.font = `800 ${hookFontSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
        ctx.fillStyle = '#FFFFFF';

        // Shadow for legibility
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6;

        const hookLines = wrapText(ctx, options.hookTop.toUpperCase(), W - W * 0.10);
        const hookLineH = hookFontSize * 1.25;
        const hookTotalH = hookLines.length * hookLineH;
        let hy = topBandH / 2 - hookTotalH / 2 + hookFontSize / 2;
        hookLines.forEach(line => {
          ctx.fillText(line, W / 2, hy);
          hy += hookLineH;
        });

        ctx.shadowBlur = 0;

        // ── 3. Bottom band (accent gradient) ──────────────────────────────
        const accent = options.accentColor || '#5B21B6'; // deep purple default
        const accentLight = hexToRgba(accent, 0.95);
        const accentDark  = hexToRgba(accent, 1.0);

        const botGrad = ctx.createLinearGradient(0, H - botBandH, 0, H);
        botGrad.addColorStop(0, accentDark);
        botGrad.addColorStop(1, accentLight);
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, H - botBandH, W, botBandH);

        // Green check accent line on left of bottom band
        ctx.fillStyle = '#22C55E';
        ctx.fillRect(0, H - botBandH, 8, botBandH);

        // Solution text
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 4;

        const solFontSize = Math.round(W * 0.044);
        ctx.font = `800 ${solFontSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const solLines = wrapText(ctx, options.solutionBottom, W - W * 0.10);
        const botY0 = H - botBandH + Math.round(botBandH * 0.12);
        const solLineH = solFontSize * 1.2;
        let sy = botY0;
        solLines.forEach(line => {
          ctx.fillText(line, W / 2, sy);
          sy += solLineH;
        });

        // Price tag (if provided) — yellow pill
        if (options.priceTag) {
          ctx.shadowBlur = 0;
          const priceFontSize = Math.round(W * 0.038);
          ctx.font = `700 ${priceFontSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
          const priceMetrics = ctx.measureText(options.priceTag);
          const pillW = priceMetrics.width + priceFontSize * 1.6;
          const pillH = priceFontSize * 1.8;
          const pillX = (W - pillW) / 2;
          const pillY = sy + Math.round(solFontSize * 0.3);

          // Yellow pill background
          ctx.fillStyle = '#FCD34D';
          roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
          ctx.fill();

          // Price text
          ctx.fillStyle = '#1C1917';
          ctx.textBaseline = 'middle';
          ctx.fillText(options.priceTag, W / 2, pillY + pillH / 2);
        }

        ctx.shadowBlur = 0;

        resolve(canvas.toDataURL('image/png', 0.95));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Impossible de charger l\'image produit.'));
    img.src = imageSource;
  });
}

/** Converts a hex color to rgba() string */
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(91,33,182,${alpha})`;
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FACEBOOK POST VISUAL — 1200×628
// Layout: product photo (background, cover) + bottom gradient + text overlay
// ─────────────────────────────────────────────────────────────────────────────

export interface FacebookPostVisualOptions {
  /** Main headline — max ~55 chars, displayed large at bottom */
  headline: string;
  /** Subline below headline — max ~80 chars */
  subline?: string;
  /** Optional price pill (yellow), e.g. "49€" */
  priceTag?: string;
  /** Left accent bar color (hex). Defaults to Facebook blue. */
  accentColor?: string;
}

export async function createFacebookPostVisual(
  imageSource: string,
  options: FacebookPostVisualOptions
): Promise<string> {
  const W = 1200, H = 628;
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas unavailable')); return; }

        // 1. Background image (cover fit)
        const scale = Math.max(W / img.width, H / img.height);
        ctx.drawImage(img, (W - img.width * scale) / 2, (H - img.height * scale) / 2, img.width * scale, img.height * scale);

        // 2. Bottom gradient overlay
        const grad = ctx.createLinearGradient(0, H * 0.3, 0, H);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.55, 'rgba(0,0,0,0.65)');
        grad.addColorStop(1, 'rgba(0,0,0,0.90)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // 3. Left accent bar
        ctx.fillStyle = options.accentColor || '#1877F2';
        ctx.fillRect(0, 0, 7, H);

        const pad = 48;
        const textX = pad + 16;
        ctx.textAlign = 'left';
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = 8;
        let y = H - pad;

        // 4. Headline (rendered bottom-up)
        const hlSize = Math.round(W * 0.046);
        ctx.font = `800 ${hlSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'bottom';
        const hlLines = wrapText(ctx, options.headline, W - pad * 2 - 30);
        for (let i = hlLines.length - 1; i >= 0; i--) {
          ctx.fillText(hlLines[i], textX, y);
          y -= hlSize * 1.22;
        }

        // 5. Subline
        if (options.subline) {
          y -= 4;
          const slSize = Math.round(W * 0.027);
          ctx.font = `400 ${slSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.82)';
          const slLines = wrapText(ctx, options.subline, W - pad * 2 - 30);
          for (let i = slLines.length - 1; i >= 0; i--) {
            ctx.fillText(slLines[i], textX, y);
            y -= slSize * 1.3;
          }
        }

        // 6. Price pill
        if (options.priceTag) {
          ctx.shadowBlur = 0;
          y -= 14;
          const ptSize = Math.round(W * 0.024);
          ctx.font = `700 ${ptSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
          const ptM = ctx.measureText(options.priceTag);
          const pw = ptM.width + ptSize * 1.8;
          const ph = ptSize * 1.8;
          const py2 = y - ph;
          ctx.fillStyle = '#FCD34D';
          roundRect(ctx, textX, py2, pw, ph, ph / 2);
          ctx.fill();
          ctx.fillStyle = '#1C1917';
          ctx.textBaseline = 'middle';
          ctx.fillText(options.priceTag, textX + ptSize * 0.9, py2 + ph / 2);
        }

        ctx.shadowBlur = 0;
        resolve(canvas.toDataURL('image/png', 0.95));
      } catch (err) { reject(err); }
    };
    img.onerror = () => reject(new Error('Image load error'));
    img.src = imageSource;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FACEBOOK POLL VISUAL — 1200×628
// Layout: [product photo top 56%] [dark card bottom 44% — question + 2 pills]
// ─────────────────────────────────────────────────────────────────────────────

export interface FacebookPollVisualOptions {
  question: string;
  optionA: string;
  optionB: string;
  /** Accent color for pill A + badge (hex). Defaults to Facebook blue. */
  accentColor?: string;
}

export async function createFacebookPollVisual(
  imageSource: string,
  options: FacebookPollVisualOptions
): Promise<string> {
  const W = 1200, H = 628;
  const imgH = Math.round(H * 0.56);
  const cardH = H - imgH;

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas unavailable')); return; }

        const accent = options.accentColor || '#1877F2';

        // 1. Product image clipped to top band
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, imgH);
        ctx.clip();
        const scale = Math.max(W / img.width, H / img.height);
        ctx.drawImage(img, (W - img.width * scale) / 2, (H - img.height * scale) / 2 - (H - imgH) * 0.15, img.width * scale, img.height * scale);
        ctx.restore();

        // Dark overlay on photo
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(0, 0, W, imgH);

        // Vignette at bottom of photo
        const vig = ctx.createLinearGradient(0, imgH - 50, 0, imgH);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, imgH - 50, W, 50);

        // 2. "SONDAGE" badge top-left
        const badgeFontSize = Math.round(W * 0.022);
        ctx.font = `700 ${badgeFontSize}px -apple-system, sans-serif`;
        const badgeLabel = '🗳️  SONDAGE';
        const bw = ctx.measureText(badgeLabel).width + 28;
        const bh = 42;
        ctx.fillStyle = accent;
        roundRect(ctx, 22, 20, bw, bh, 8);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeLabel, 36, 20 + bh / 2);

        // 3. Dark poll card background
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, imgH, W, cardH);
        ctx.fillStyle = accent;
        ctx.fillRect(0, imgH, W, 4);

        // 4. Question text
        const qSize = Math.round(W * 0.034);
        ctx.font = `700 ${qSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
        ctx.fillStyle = '#F9FAFB';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 4;
        const qLines = wrapText(ctx, options.question, W - 80);
        const qLineH = qSize * 1.28;
        const qY0 = imgH + cardH * 0.11;
        qLines.forEach((line, i) => ctx.fillText(line, W / 2, qY0 + i * qLineH));
        ctx.shadowBlur = 0;

        // 5. Option pills
        const pillH = Math.round(cardH * 0.28);
        const pillW = Math.round(W * 0.43);
        const pillGap = Math.round(W * 0.028);
        const pillY = imgH + cardH - pillH - Math.round(cardH * 0.10);
        const pillAx = W / 2 - pillW - pillGap / 2;
        const pillBx = W / 2 + pillGap / 2;
        const pFontSize = Math.round(W * 0.024);

        ctx.fillStyle = accent;
        roundRect(ctx, pillAx, pillY, pillW, pillH, 12);
        ctx.fill();

        ctx.fillStyle = '#374151';
        roundRect(ctx, pillBx, pillY, pillW, pillH, 12);
        ctx.fill();

        ctx.font = `700 ${pFontSize}px -apple-system, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const pillCy = pillY + pillH / 2;
        const maxPW = pillW - 24;

        const aLines = wrapText(ctx, options.optionA, maxPW);
        const aLH = pFontSize * 1.2;
        aLines.forEach((line, i) => ctx.fillText(line, pillAx + pillW / 2, pillCy - (aLines.length - 1) * aLH / 2 + i * aLH));

        const bLines = wrapText(ctx, options.optionB, maxPW);
        const bLH = pFontSize * 1.2;
        bLines.forEach((line, i) => ctx.fillText(line, pillBx + pillW / 2, pillCy - (bLines.length - 1) * bLH / 2 + i * bLH));

        resolve(canvas.toDataURL('image/png', 0.95));
      } catch (err) { reject(err); }
    };
    img.onerror = () => reject(new Error('Image load error'));
    img.src = imageSource;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FACEBOOK FLASH OFFER VISUAL — 1200×628
// Layout: product photo bg + red top banner + round discount badge (top-right)
//         + dark gradient bottom with headline / prices / urgency
// ─────────────────────────────────────────────────────────────────────────────

export interface FacebookFlashVisualOptions {
  /** e.g. "-30%" — displayed in the big red circle */
  discountBadge: string;
  /** Main headline — max ~42 chars */
  headline: string;
  /** Original price (will be struck through) e.g. "89€" */
  originalPrice?: string;
  /** Sale price (highlighted in yellow) e.g. "62€" */
  salePrice?: string;
  /** Urgency line e.g. "⏰ Offre valable ce soir minuit" */
  urgencyLine?: string;
}

export async function createFacebookFlashVisual(
  imageSource: string,
  options: FacebookFlashVisualOptions
): Promise<string> {
  const W = 1200, H = 628;
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas unavailable')); return; }

        // 1. Background image (cover fit)
        const scale = Math.max(W / img.width, H / img.height);
        ctx.drawImage(img, (W - img.width * scale) / 2, (H - img.height * scale) / 2, img.width * scale, img.height * scale);

        // 2. Gradient overlay bottom
        const grad = ctx.createLinearGradient(0, H * 0.25, 0, H);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, 'rgba(5,5,5,0.72)');
        grad.addColorStop(1, 'rgba(5,5,5,0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // 3. "OFFRE FLASH" top banner
        const bannerH = 52;
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(0, 0, W, bannerH);
        const bannerFS = Math.round(W * 0.024);
        ctx.font = `800 ${bannerFS}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡  OFFRE FLASH  ⚡', W / 2, bannerH / 2);

        // 4. Round discount badge (top-right)
        const badgeR = Math.round(W * 0.092);
        const badgeCx = W - badgeR - 28;
        const badgeCy = bannerH + badgeR + 20;

        ctx.beginPath();
        ctx.arc(badgeCx, badgeCy, badgeR + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(badgeCx, badgeCy, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(badgeCx, badgeCy, badgeR - 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        const bdSize = Math.round(W * 0.062);
        ctx.font = `900 ${bdSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 5;
        ctx.fillText(options.discountBadge, badgeCx, badgeCy);
        ctx.shadowBlur = 0;

        // 5. Bottom text (bottom-up)
        const pad = 48;
        const textX = pad;
        ctx.textAlign = 'left';
        let y = H - pad;

        if (options.urgencyLine) {
          const ulSize = Math.round(W * 0.024);
          ctx.font = `500 ${ulSize}px -apple-system, sans-serif`;
          ctx.fillStyle = '#FCA5A5';
          ctx.textBaseline = 'bottom';
          ctx.fillText(options.urgencyLine, textX, y);
          y -= ulSize * 1.6;
        }

        if (options.salePrice || options.originalPrice) {
          y -= 6;
          const salePriceSize = Math.round(W * 0.054);
          const origPriceSize = Math.round(W * 0.028);

          if (options.salePrice) {
            ctx.font = `900 ${salePriceSize}px -apple-system, sans-serif`;
            ctx.fillStyle = '#FCD34D';
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 4;
            ctx.textBaseline = 'bottom';
            ctx.fillText(options.salePrice, textX, y);
            ctx.shadowBlur = 0;
          }

          if (options.originalPrice) {
            const saleW = options.salePrice ? ctx.measureText(options.salePrice).width + 20 : 0;
            ctx.font = `500 ${origPriceSize}px -apple-system, sans-serif`;
            ctx.fillStyle = 'rgba(255,255,255,0.48)';
            const origX = textX + saleW;
            const origY = y - (salePriceSize - origPriceSize) * 0.5;
            ctx.textBaseline = 'bottom';
            ctx.fillText(options.originalPrice, origX, origY);
            const origM = ctx.measureText(options.originalPrice);
            const strikeY = origY - origPriceSize * 0.45;
            ctx.beginPath();
            ctx.moveTo(origX, strikeY);
            ctx.lineTo(origX + origM.width, strikeY);
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          y -= salePriceSize * 1.3;
        }

        y -= 8;
        const hlSize = Math.round(W * 0.045);
        ctx.font = `800 ${hlSize}px -apple-system, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 7;
        ctx.textBaseline = 'bottom';
        const maxHlW = W - pad * 2 - badgeR * 2 - 40;
        const hlLines = wrapText(ctx, options.headline, maxHlW);
        for (let i = hlLines.length - 1; i >= 0; i--) {
          ctx.fillText(hlLines[i], textX, y);
          y -= hlSize * 1.2;
        }

        ctx.shadowBlur = 0;
        resolve(canvas.toDataURL('image/png', 0.95));
      } catch (err) { reject(err); }
    };
    img.onerror = () => reject(new Error('Image load error'));
    img.src = imageSource;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP TEXT OVERLAY — TikTok / Instagram / Snapchat
// Texte en HAUT de l'image (comme @dubainegoce sur TikTok)
// ─────────────────────────────────────────────────────────────────────────────

export type VisualAdFormat = 'story' | 'square' | 'landscape';

const VISUAL_AD_DIMENSIONS: Record<VisualAdFormat, { width: number; height: number }> = {
  story:     { width: 1080, height: 1920 }, // TikTok / Snap
  square:    { width: 1080, height: 1080 }, // Instagram
  landscape: { width: 1200, height: 628  }, // Facebook
};

/**
 * Creates an image with 3 lines of bold text overlaid at the TOP.
 * Dark gradient from top → transparent covers ~38% of the image height.
 * Style: gros caractères blancs avec ombre — format @dubainegoce TikTok.
 */
export async function createTopTextOverlay(
  imageUrl: string,
  lines: string[],
  format: VisualAdFormat = 'story'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const { width: W, height: H } = VISUAL_AD_DIMENSIONS[format];
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context unavailable')); return; }

        // 1. Draw image (cover fit)
        const scale = Math.max(W / img.width, H / img.height);
        const ix = (W - img.width * scale) / 2;
        const iy = (H - img.height * scale) / 2;
        ctx.drawImage(img, ix, iy, img.width * scale, img.height * scale);

        // 2. Dark gradient overlay — top 38%
        const gradH = H * 0.38;
        const grad = ctx.createLinearGradient(0, 0, 0, gradH);
        grad.addColorStop(0,   'rgba(0, 0, 0, 0.82)');
        grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.55)');
        grad.addColorStop(1,   'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, gradH);

        // 3. Text overlay — centered, top area
        const fontSize  = Math.round(W * 0.072); // gros caractères
        const lineHeight = fontSize * 1.28;
        const padding   = W * 0.06;
        const maxWidth  = W - padding * 2;
        const totalTextH = lines.length * lineHeight;
        const topPadding = H * 0.05; // 5% from top
        let y = topPadding + fontSize;

        ctx.textAlign    = 'center';
        ctx.textBaseline = 'top';
        ctx.font         = `900 ${fontSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;

        lines.forEach((line) => {
          if (!line.trim()) { y += lineHeight; return; }

          // Text shadow for legibility
          ctx.shadowColor  = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur   = 18;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = '#FFFFFF';

          // Auto-wrap if line is too long
          const wrappedLines = wrapText(ctx, line, maxWidth);
          wrappedLines.forEach((wl) => {
            ctx.fillText(wl, W / 2, y);
            y += lineHeight;
          });
        });

        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        resolve(canvas.toDataURL('image/png', 0.95));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error("Impossible de charger l'image."));
    img.src = imageUrl;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SPLIT AD CANVAS — Comparaison Orignal vs Dupe (gauche / droite)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a split canvas: left = original luxury perfume, right = dupe.
 * Text overlay at the TOP spans full width.
 * Optional "VS" badge in the center divider.
 */
export async function createSplitAdCanvas(
  leftImageUrl: string,
  rightImageUrl: string,
  lines: string[],
  showVsBadge = true,
  format: VisualAdFormat = 'square'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const leftImg  = new window.Image();
    const rightImg = new window.Image();
    leftImg.crossOrigin  = 'anonymous';
    rightImg.crossOrigin = 'anonymous';

    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount < 2) return;

      try {
        const { width: W, height: H } = VISUAL_AD_DIMENSIONS[format];
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context unavailable')); return; }

        const halfW = W / 2;

        // ── Helper: draw image clipped to left or right half ─────────────
        const drawHalf = (img: HTMLImageElement, offsetX: number) => {
          ctx.save();
          ctx.beginPath();
          ctx.rect(offsetX, 0, halfW, H);
          ctx.clip();
          const scale = Math.max(halfW / img.width, H / img.height);
          const ix = offsetX + (halfW - img.width * scale) / 2;
          const iy = (H - img.height * scale) / 2;
          ctx.drawImage(img, ix, iy, img.width * scale, img.height * scale);
          ctx.restore();
        };

        // 1. Draw left (original) + right (dupe)
        drawHalf(leftImg,  0);
        drawHalf(rightImg, halfW);

        // 2. Dark gradient at TOP (full width)
        const gradH = H * 0.40;
        const grad = ctx.createLinearGradient(0, 0, 0, gradH);
        grad.addColorStop(0,   'rgba(0, 0, 0, 0.88)');
        grad.addColorStop(0.65,'rgba(0, 0, 0, 0.55)');
        grad.addColorStop(1,   'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, gradH);

        // 3. Vertical divider line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(halfW - 1, 0, 2, H);

        // 4. VS badge in the center (optional)
        if (showVsBadge) {
          const badgeR = Math.round(W * 0.042);
          const cx = halfW;
          const cy = H / 2;

          // Outer circle (white border)
          ctx.beginPath();
          ctx.arc(cx, cy, badgeR + 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fill();

          // Inner circle (red background)
          ctx.beginPath();
          ctx.arc(cx, cy, badgeR, 0, Math.PI * 2);
          ctx.fillStyle = '#DC2626';
          ctx.fill();

          // VS text
          const vsFontSize = Math.round(badgeR * 1.0);
          ctx.font = `900 ${vsFontSize}px -apple-system, sans-serif`;
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('VS', cx, cy);
        }

        // 5. Text lines at top (full width)
        const fontSize   = Math.round(W * 0.068);
        const lineHeight = fontSize * 1.3;
        const padding    = W * 0.05;
        const maxWidth   = W - padding * 2;
        const topPadding = H * 0.045;
        let y = topPadding + fontSize * 0.2;

        ctx.textAlign    = 'center';
        ctx.textBaseline = 'top';
        ctx.font         = `900 ${fontSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;

        lines.forEach((line) => {
          if (!line.trim()) { y += lineHeight * 0.5; return; }

          ctx.shadowColor   = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur    = 16;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle     = '#FFFFFF';

          const wrappedLines = wrapText(ctx, line, maxWidth);
          wrappedLines.forEach((wl) => {
            ctx.fillText(wl, W / 2, y);
            y += lineHeight;
          });
        });

        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        resolve(canvas.toDataURL('image/png', 0.95));
      } catch (err) {
        reject(err);
      }
    };

    const onError = () => reject(new Error("Impossible de charger une des images."));
    leftImg.onload  = onLoad;
    rightImg.onload = onLoad;
    leftImg.onerror  = onError;
    rightImg.onerror = onError;
    leftImg.src  = leftImageUrl;
    rightImg.src = rightImageUrl;
  });
}

/**
 * Downloads an image from a data URL or remote URL
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}
