'use client';

/**
 * WoodyEmoji — sprite CSS 2×2 pour les 8 expressions de Woody
 *
 * Set 1 (woody-emotions1.png) : confused | excited | sad | shocked
 * Set 2 (woody-emotions2.png) : alert | secure | support | success
 *
 * Usage : <WoodyEmoji mood="excited" size={32} />
 */

export type WoodyMood =
  | 'confused'  // 🤔 perplexe         — set1, haut-gauche
  | 'excited'   // 🎉 euphorique        — set1, haut-droite
  | 'sad'       // 😟 inquiet           — set1, bas-gauche
  | 'shocked'   // 😱 surpris           — set1, bas-droite
  | 'alert'     // ⚠️  alerte/problème  — set2, haut-gauche
  | 'secure'    // 🛡️  sécurité         — set2, haut-droite
  | 'support'   // 🎧 support/aide      — set2, bas-gauche
  | 'success';  // 🏆 félicitations     — set2, bas-droite

const E1 = 'https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544331/woody-emotions1-removebg-preview_txxiqw.png';
const E2 = 'https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544331/woody-emotions2-removebg-preview_vmoijj.png';

const MOOD_MAP: Record<WoodyMood, { src: string; x: string; y: string }> = {
  confused: { src: E1, x: '0%',   y: '0%'   },
  excited:  { src: E1, x: '100%', y: '0%'   },
  sad:      { src: E1, x: '0%',   y: '100%' },
  shocked:  { src: E1, x: '100%', y: '100%' },
  alert:    { src: E2, x: '0%',   y: '0%'   },
  secure:   { src: E2, x: '100%', y: '0%'   },
  support:  { src: E2, x: '0%',   y: '100%' },
  success:  { src: E2, x: '100%', y: '100%' },
};

interface WoodyEmojiProps {
  mood: WoodyMood;
  /** Taille en pixels (carré). Défaut : 40 */
  size?: number;
  className?: string;
}

export function WoodyEmoji({ mood, size = 40, className = '' }: WoodyEmojiProps) {
  const { src, x, y } = MOOD_MAP[mood];
  return (
    <span
      role="img"
      aria-label={`Woody ${mood}`}
      className={`inline-block flex-shrink-0 align-middle ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${src})`,
        backgroundSize: '200% 200%',
        backgroundPosition: `${x} ${y}`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}
