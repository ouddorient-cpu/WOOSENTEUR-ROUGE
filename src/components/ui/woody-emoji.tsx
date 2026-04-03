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

const MOOD_MAP: Record<WoodyMood, { src: string; x: string; y: string }> = {
  confused: { src: '/woody-emotions1.png', x: '0%',   y: '0%'   },
  excited:  { src: '/woody-emotions1.png', x: '100%', y: '0%'   },
  sad:      { src: '/woody-emotions1.png', x: '0%',   y: '100%' },
  shocked:  { src: '/woody-emotions1.png', x: '100%', y: '100%' },
  alert:    { src: '/woody-emotions2.png', x: '0%',   y: '0%'   },
  secure:   { src: '/woody-emotions2.png', x: '100%', y: '0%'   },
  support:  { src: '/woody-emotions2.png', x: '0%',   y: '100%' },
  success:  { src: '/woody-emotions2.png', x: '100%', y: '100%' },
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
