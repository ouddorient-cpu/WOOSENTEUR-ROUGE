'use client';

/**
 * WoodyPose — sprite vertical 3 poses de Woody (fond transparent)
 *
 * sitting  → Woody assis sur un encadré    (haut du sprite)
 * pointing → Woody qui pointe du doigt     (milieu du sprite)
 * whispering → Woody qui chuchote          (bas du sprite)
 *
 * Usage :
 *   <WoodyPose pose="sitting"    width={120} />
 *   <WoodyPose pose="pointing"   width={100} />
 *   <WoodyPose pose="whispering" width={90}  />
 */

export type WoodyPoseType = 'sitting' | 'pointing' | 'whispering';

const POSE_MAP: Record<WoodyPoseType, { y: string }> = {
  sitting:    { y: '0%'   },  // haut du sprite
  pointing:   { y: '50%'  },  // milieu
  whispering: { y: '100%' },  // bas
};

interface WoodyPoseProps {
  pose: WoodyPoseType;
  /** Largeur en px. La hauteur = width * (1/3) du sprite (ratio 1:3 vertical). */
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function WoodyPose({ pose, width = 100, className = '', style }: WoodyPoseProps) {
  const { y } = POSE_MAP[pose];
  // Le sprite est 1 colonne × 3 lignes → chaque pose = 1/3 de la hauteur totale
  const height = Math.round(width * 1.1); // ratio approximatif de chaque pose

  return (
    <span
      role="img"
      aria-label={`Woody ${pose}`}
      className={`inline-block flex-shrink-0 ${className}`}
      style={{
        width,
        height,
        backgroundImage: 'url(/woody-poses.png)',
        backgroundSize: `${width}px auto`,
        backgroundPositionX: '0px',
        backgroundPositionY: y === '0%' ? '0px'
          : y === '50%' ? `-${height}px`
          : `-${height * 2}px`,
        backgroundRepeat: 'no-repeat',
        ...style,
      }}
    />
  );
}
