'use client';

import Image from 'next/image';

export type WoodyPoseType = 'sitting' | 'pointing' | 'whispering';

const POSE_URLS: Record<WoodyPoseType, string> = {
  sitting:    'https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544331/Gemini_Generated_Image_8vt1oa8vt1oa8vt1__1_-removebg-preview_slimrt.png',
  pointing:   'https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544330/Gemini_Generated_Image_7bnxii7bnxii7bnx-removebg-preview_xfcumj.png',
  whispering: 'https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544330/Gemini_Generated_Image_7bnxii7bnxii7bnx-removebg-preview_xfcumj.png',
};

interface WoodyPoseProps {
  pose: WoodyPoseType;
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function WoodyPose({ pose, width = 100, className = '', style }: WoodyPoseProps) {
  return (
    <Image
      src={POSE_URLS[pose]}
      alt={`Woody ${pose}`}
      width={width}
      height={width}
      className={`object-contain drop-shadow-md ${className}`}
      style={{ width, height: 'auto', ...style }}
    />
  );
}
